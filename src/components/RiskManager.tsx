
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, ShieldAlert, TrendingDown, Percent, BarChart2, CircleDollarSign, ArrowDownRight, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RiskLevel {
  name: string;
  maxPositionSize: number;
  stopLossPercent: number;
  maxDrawdown: number;
  color: string;
}

interface RiskManagerProps {
  isRunning: boolean;
  investmentAmount: number;
  onRiskSettingsChange?: (settings: any) => void;
}

const RiskManager = ({ 
  isRunning,
  investmentAmount,
  onRiskSettingsChange
}: RiskManagerProps) => {
  const [riskLevel, setRiskLevel] = useState<number>(2); // 1-5
  const [autoStopLoss, setAutoStopLoss] = useState(true);
  const [maxDrawdown, setMaxDrawdown] = useState(5);
  const [maxPositionSize, setMaxPositionSize] = useState(30);
  const [stopLossPercent, setStopLossPercent] = useState(1.5);
  const [currentDrawdown, setCurrentDrawdown] = useState(0);
  const [smartPositionSizing, setSmartPositionSizing] = useState(true);
  const { toast } = useToast();

  // Risk levels presets
  const riskLevels: RiskLevel[] = [
    { name: "Ultra Conservative", maxPositionSize: 10, stopLossPercent: 0.5, maxDrawdown: 2, color: "bg-blue-500" },
    { name: "Conservative", maxPositionSize: 20, stopLossPercent: 1, maxDrawdown: 4, color: "bg-teal-500" },
    { name: "Moderate", maxPositionSize: 30, stopLossPercent: 1.5, maxDrawdown: 6, color: "bg-amber-500" },
    { name: "Aggressive", maxPositionSize: 50, stopLossPercent: 2, maxDrawdown: 10, color: "bg-orange-500" },
    { name: "High Risk", maxPositionSize: 80, stopLossPercent: 3, maxDrawdown: 15, color: "bg-rose-500" }
  ];

  // Update settings when risk level changes
  useEffect(() => {
    const selectedLevel = riskLevels[riskLevel - 1];
    setMaxPositionSize(selectedLevel.maxPositionSize);
    setStopLossPercent(selectedLevel.stopLossPercent);
    setMaxDrawdown(selectedLevel.maxDrawdown);
  }, [riskLevel]);

  // Notify parent component when risk settings change
  useEffect(() => {
    if (onRiskSettingsChange) {
      onRiskSettingsChange({
        riskLevel,
        autoStopLoss,
        maxDrawdown,
        maxPositionSize,
        stopLossPercent,
        smartPositionSizing
      });
    }
  }, [riskLevel, autoStopLoss, maxDrawdown, maxPositionSize, stopLossPercent, smartPositionSizing, onRiskSettingsChange]);

  // Simulate drawdown when bot is running
  useEffect(() => {
    if (!isRunning) {
      setCurrentDrawdown(0);
      return;
    }
    
    // Random fluctuations in drawdown
    const interval = setInterval(() => {
      setCurrentDrawdown(prev => {
        // Usually decrease (profitable) but sometimes increase (losses)
        const change = Math.random() > 0.7 
          ? Math.random() * 0.5 
          : -Math.random() * 0.3;
          
        return Math.max(0, Math.min(maxDrawdown, prev + change));
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isRunning, maxDrawdown]);
  
  const handleRiskLevelChange = (value: number[]) => {
    setRiskLevel(value[0]);
    
    toast({
      title: "Risk Level Updated",
      description: `Set to ${riskLevels[value[0] - 1].name} profile`,
      variant: "default",
    });
  };
  
  const handleAutoStopLossToggle = (checked: boolean) => {
    setAutoStopLoss(checked);
    
    toast({
      title: checked ? "Auto Stop-Loss Enabled" : "Auto Stop-Loss Disabled",
      description: checked 
        ? `Bot will stop if drawdown exceeds ${maxDrawdown}%` 
        : "No automatic stop based on drawdown",
      variant: "default",
    });
  };
  
  const handleSmartSizingToggle = (checked: boolean) => {
    setSmartPositionSizing(checked);
    
    toast({
      title: checked ? "Smart Position Sizing Enabled" : "Fixed Position Sizing Set",
      description: checked 
        ? "Position sizes will adjust based on opportunity quality" 
        : "All positions will use the same percentage of capital",
      variant: "default",
    });
  };
  
  const handleMaxPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setMaxPositionSize(value);
    }
  };
  
  const handleStopLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 10) {
      setStopLossPercent(value);
    }
  };
  
  const calculateMaxPositionValue = () => {
    return investmentAmount * (maxPositionSize / 100);
  };
  
  const getDrawdownStatus = () => {
    const ratio = currentDrawdown / maxDrawdown;
    if (ratio < 0.5) return "text-positive";
    if (ratio < 0.75) return "text-amber-500";
    return "text-destructive";
  };
  
  const currentRiskLevel = riskLevels[riskLevel - 1];
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-highlight" />
              Risk Manager
            </CardTitle>
            <CardDescription>
              Rust-optimized capital protection system
            </CardDescription>
          </div>
          <Badge className={`${currentRiskLevel.color} text-white`}>
            {currentRiskLevel.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Risk Profile</Label>
          </div>
          <Slider 
            value={[riskLevel]}
            min={1}
            max={5}
            step={1}
            onValueChange={handleRiskLevelChange}
            disabled={isRunning}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative</span>
            <span>Moderate</span>
            <span>Aggressive</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="max-position" className="text-sm flex items-center gap-1.5">
              <Percent className="h-4 w-4" />
              Max Position Size
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="max-position"
                type="number"
                min={1}
                max={100}
                value={maxPositionSize}
                onChange={handleMaxPositionChange}
                disabled={isRunning}
                className="w-20"
              />
              <span className="text-sm">%</span>
              <span className="text-xs text-muted-foreground">
                ({calculateMaxPositionValue().toFixed(2)} SOL max)
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stop-loss" className="text-sm flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Stop-Loss Threshold
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="stop-loss"
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={stopLossPercent}
                onChange={handleStopLossChange}
                disabled={isRunning || !autoStopLoss}
                className="w-20"
              />
              <span className="text-sm">%</span>
              <span className="text-xs text-muted-foreground">
                per trade
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between space-x-3">
          <Label htmlFor="stop-loss-toggle" className="text-sm flex-1">
            Automatic Stop-Loss
            <p className="text-xs text-muted-foreground mt-0.5">
              Halt trading if drawdown exceeds {maxDrawdown}%
            </p>
          </Label>
          <Switch
            id="stop-loss-toggle"
            checked={autoStopLoss}
            onCheckedChange={handleAutoStopLossToggle}
            disabled={isRunning}
          />
        </div>
        
        <div className="flex items-center justify-between space-x-3">
          <Label htmlFor="smart-sizing-toggle" className="text-sm flex-1">
            Smart Position Sizing
            <p className="text-xs text-muted-foreground mt-0.5">
              Dynamically adjust position size based on opportunity quality
            </p>
          </Label>
          <Switch
            id="smart-sizing-toggle"
            checked={smartPositionSizing}
            onCheckedChange={handleSmartSizingToggle}
            disabled={isRunning}
          />
        </div>
        
        {isRunning && (
          <div className="border border-border/20 rounded-md p-3 bg-secondary/30">
            <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              Current Risk Metrics
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Current Drawdown</span>
                </div>
                <div className={`font-medium ${getDrawdownStatus()}`}>
                  {currentDrawdown.toFixed(2)}%
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  <span>Current Position</span>
                </div>
                <div className="font-medium">
                  {smartPositionSizing 
                    ? `${(maxPositionSize * 0.7).toFixed(1)}% - ${maxPositionSize}%` 
                    : `${maxPositionSize}%`}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Stop-Loss Status</span>
                </div>
                <Badge variant="outline" className="bg-positive/10 text-positive border-positive/30">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {currentDrawdown > maxDrawdown * 0.75 && isRunning && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-foreground">Approaching maximum drawdown.</span> Bot will pause trading if drawdown exceeds {maxDrawdown}%.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskManager;
