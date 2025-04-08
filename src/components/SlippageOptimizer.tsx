
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowDownUp, ArrowRightLeft, LineChart, MoveHorizontal, Activity, BarChart2, Settings, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SlippageOptimizerProps {
  isRunning: boolean;
  onSlippageSettingsChange?: (settings: any) => void;
}

const SlippageOptimizer = ({ 
  isRunning,
  onSlippageSettingsChange
}: SlippageOptimizerProps) => {
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [dynamicSlippage, setDynamicSlippage] = useState(true);
  const [tradeSplitting, setTradeSplitting] = useState(true);
  const [maxSplits, setMaxSplits] = useState(3);
  const [marketVolatility, setMarketVolatility] = useState(25);
  const [currentSlippage, setCurrentSlippage] = useState(0.3);
  const [historicalSlippage, setHistoricalSlippage] = useState<number[]>([
    0.32, 0.29, 0.38, 0.42, 0.35, 0.31, 0.28, 0.33, 0.40, 0.36, 0.31, 0.27
  ]);
  const { toast } = useToast();

  // Update settings to parent component
  useEffect(() => {
    if (onSlippageSettingsChange) {
      onSlippageSettingsChange({
        maxSlippage,
        dynamicSlippage,
        tradeSplitting,
        maxSplits,
        currentSlippage
      });
    }
  }, [maxSlippage, dynamicSlippage, tradeSplitting, maxSplits, currentSlippage, onSlippageSettingsChange]);

  // Simulate market volatility changes when bot is running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      // Random volatility fluctuation
      setMarketVolatility(prev => {
        const delta = Math.random() * 10 - 5; // -5 to +5
        return Math.max(10, Math.min(90, prev + delta));
      });
      
      // Update current slippage based on volatility
      const baseSlippage = maxSlippage * 0.6; // Base slippage is 60% of max
      const volatilityFactor = marketVolatility / 100; // 0-1 scale
      const newSlippage = baseSlippage + (maxSlippage - baseSlippage) * volatilityFactor;
      
      setCurrentSlippage(parseFloat(newSlippage.toFixed(2)));
      
      // Add to historical data
      setHistoricalSlippage(prev => [...prev.slice(1), currentSlippage]);
      
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isRunning, maxSlippage, marketVolatility, currentSlippage]);
  
  const handleMaxSlippageChange = (value: number[]) => {
    setMaxSlippage(value[0]);
    
    toast({
      title: "Max Slippage Updated",
      description: `Set to ${value[0].toFixed(1)}%`,
      variant: "default",
    });
  };
  
  const handleDynamicSlippageToggle = (checked: boolean) => {
    setDynamicSlippage(checked);
    
    toast({
      title: checked ? "Dynamic Slippage Enabled" : "Fixed Slippage Set",
      description: checked 
        ? "Slippage will adjust based on market conditions" 
        : `Fixed slippage tolerance of ${maxSlippage.toFixed(1)}%`,
      variant: "default",
    });
  };
  
  const handleTradeSplittingToggle = (checked: boolean) => {
    setTradeSplitting(checked);
    
    toast({
      title: checked ? "Trade Splitting Enabled" : "Trade Splitting Disabled",
      description: checked 
        ? "Large trades will be split to minimize slippage" 
        : "All trades will execute in a single transaction",
      variant: "default",
    });
  };
  
  const handleMaxSplitsChange = (value: number[]) => {
    setMaxSplits(value[0]);
    
    toast({
      title: "Max Split Count Updated",
      description: `Large trades will split into up to ${value[0]} parts`,
      variant: "default",
    });
  };
  
  const getVolatilityLevel = () => {
    if (marketVolatility < 30) return { text: "Low", color: "text-positive" };
    if (marketVolatility < 60) return { text: "Medium", color: "text-amber-500" };
    return { text: "High", color: "text-destructive" };
  };
  
  const volatilityLevel = getVolatilityLevel();
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MoveHorizontal className="h-5 w-5 text-highlight" />
              Slippage Optimizer
            </CardTitle>
            <CardDescription>
              Rust-optimized trade execution engine
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={dynamicSlippage ? "bg-primary/10 border-primary/30" : "bg-secondary/70"}
          >
            {dynamicSlippage ? "Dynamic" : "Fixed"} Slippage
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-sm font-medium">Current Slippage</div>
              <div className="text-2xl font-semibold">{currentSlippage}%</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm font-medium">Market Volatility</div>
              <div className={`text-lg font-medium ${volatilityLevel.color}`}>
                {volatilityLevel.text}
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <Progress value={marketVolatility} className="h-1.5" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Maximum Slippage Tolerance</Label>
            <span className="text-sm">{maxSlippage}%</span>
          </div>
          <Slider
            value={[maxSlippage]} 
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={handleMaxSlippageChange}
            disabled={isRunning}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (0.1%)</span>
            <span>High (2.0%)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between space-x-3">
          <Label htmlFor="dynamic-slippage-toggle" className="text-sm flex-1">
            Dynamic Slippage Adjustment
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically adjust slippage based on market conditions
            </p>
          </Label>
          <Switch
            id="dynamic-slippage-toggle"
            checked={dynamicSlippage}
            onCheckedChange={handleDynamicSlippageToggle}
            disabled={isRunning}
          />
        </div>
        
        <div className="flex items-center justify-between space-x-3">
          <Label htmlFor="trade-splitting-toggle" className="text-sm flex-1">
            Intelligent Trade Splitting
            <p className="text-xs text-muted-foreground mt-0.5">
              Break large trades into smaller chunks to reduce impact
            </p>
          </Label>
          <Switch
            id="trade-splitting-toggle"
            checked={tradeSplitting}
            onCheckedChange={handleTradeSplittingToggle}
            disabled={isRunning}
          />
        </div>
        
        {tradeSplitting && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Maximum Split Count</Label>
              <span className="text-sm">{maxSplits}</span>
            </div>
            <Slider
              value={[maxSplits]} 
              min={2}
              max={5}
              step={1}
              onValueChange={handleMaxSplitsChange}
              disabled={isRunning}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fewer splits</span>
              <span>More splits</span>
            </div>
          </div>
        )}
        
        <div className="border border-border/20 rounded-md p-3 bg-secondary/30">
          <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <LineChart className="h-4 w-4" />
            Slippage History
          </div>
          <div className="flex items-end h-20 gap-1">
            {historicalSlippage.map((slippage, index) => {
              const height = (slippage / 1) * 100; // Scale to percentage of max height (assuming max slippage is 1%)
              return (
                <div 
                  key={index} 
                  className="flex-1 bg-primary/40 rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${slippage.toFixed(2)}%`}
                />
              );
            })}
            <div 
              className="flex-1 bg-primary rounded-t"
              style={{ height: `${(currentSlippage / 1) * 100}%` }}
              title={`${currentSlippage.toFixed(2)}% (Current)`}
            />
          </div>
        </div>
        
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {dynamicSlippage 
                ? `Dynamically adjusting slippage based on ${volatilityLevel.text.toLowerCase()} market volatility`
                : `Using fixed ${maxSlippage}% slippage tolerance`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SlippageOptimizer;
