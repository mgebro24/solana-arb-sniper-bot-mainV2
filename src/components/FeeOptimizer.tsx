
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, TrendingDown, Clock, Zap, BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeeOptimizerProps {
  isRunning: boolean;
  onFeeStrategyChange?: (strategy: any) => void;
}

const FeeOptimizer = ({ 
  isRunning,
  onFeeStrategyChange
}: FeeOptimizerProps) => {
  const [priorityLevel, setPriorityLevel] = useState(2);
  const [dynamicPriority, setDynamicPriority] = useState(true);
  const [congestionLevel, setCongestionLevel] = useState(30);
  const [estimatedFee, setEstimatedFee] = useState(0.000045);
  const [historicalFees, setHistoricalFees] = useState<number[]>([
    0.000050, 0.000047, 0.000052, 0.000048, 0.000045, 
    0.000043, 0.000047, 0.000051, 0.000049, 0.000046
  ]);
  const [feeReduction, setFeeReduction] = useState(15);
  const { toast } = useToast();

  // Update fee estimation when parameters change
  useEffect(() => {
    const baseFee = 0.000050; // Base fee in SOL
    const priorityMultiplier = dynamicPriority 
      ? 1 + (congestionLevel / 100) * 0.5 // Dynamic fee based on congestion
      : 0.8 + (priorityLevel * 0.2); // Static fee based on priority level
      
    const newEstimatedFee = baseFee * priorityMultiplier;
    setEstimatedFee(newEstimatedFee);
    
    // Calculate fee reduction compared to average historical fee
    const avgHistoricalFee = historicalFees.reduce((a, b) => a + b, 0) / historicalFees.length;
    const newFeeReduction = ((avgHistoricalFee - newEstimatedFee) / avgHistoricalFee) * 100;
    setFeeReduction(Math.max(0, newFeeReduction));
    
    // Notify parent component of fee strategy changes
    if (onFeeStrategyChange) {
      onFeeStrategyChange({
        priorityLevel,
        dynamicPriority,
        estimatedFee: newEstimatedFee,
        feeReduction: Math.max(0, newFeeReduction)
      });
    }
  }, [priorityLevel, dynamicPriority, congestionLevel, historicalFees, onFeeStrategyChange]);

  // Simulate network congestion changes
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      // Random congestion level fluctuation
      setCongestionLevel(prev => {
        const delta = Math.random() * 10 - 5; // -5 to +5
        return Math.max(5, Math.min(95, prev + delta));
      });
      
      // Add new fee data point and remove oldest
      setHistoricalFees(prev => {
        const baseFee = 0.000050;
        const variation = (Math.random() * 0.00001) - 0.000005; // -0.000005 to +0.000005
        const newFee = baseFee + variation;
        return [...prev.slice(1), newFee];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const handlePriorityChange = (value: number[]) => {
    const newPriority = value[0];
    setPriorityLevel(newPriority);
    
    toast({
      title: "Priority Level Updated",
      description: `Transaction priority set to level ${newPriority}`,
      variant: "default",
    });
  };
  
  const handleDynamicToggle = (checked: boolean) => {
    setDynamicPriority(checked);
    
    toast({
      title: checked ? "Dynamic Priority Enabled" : "Static Priority Enabled",
      description: checked 
        ? "Fees will adjust automatically based on network congestion" 
        : "Fees will remain consistent based on priority level",
      variant: "default",
    });
  };
  
  const getPriorityLabel = () => {
    switch (priorityLevel) {
      case 1: return "Economy";
      case 2: return "Standard";
      case 3: return "Fast";
      case 4: return "Urgent";
      default: return "Custom";
    }
  };
  
  const getCongestionLevelClass = () => {
    if (congestionLevel < 30) return "text-positive";
    if (congestionLevel < 70) return "text-amber-500";
    return "text-destructive";
  };
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-highlight" />
              Fee Optimizer
            </CardTitle>
            <CardDescription>
              Rust-optimized transaction fee management
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={feeReduction > 0 ? "text-positive border-positive/30 bg-positive/10" : "bg-secondary"}
          >
            {feeReduction.toFixed(1)}% Savings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
            <div className="text-sm font-medium mb-2">Estimated Fee</div>
            <div className="text-2xl font-semibold">{estimatedFee.toFixed(6)} SOL</div>
            <div className="text-xs text-muted-foreground mt-1">
              Per transaction
            </div>
          </div>
          
          <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Network Congestion</div>
              <span className={`text-sm ${getCongestionLevelClass()}`}>
                {congestionLevel.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={congestionLevel} 
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Priority Level</Label>
            <Badge variant="secondary">{getPriorityLabel()}</Badge>
          </div>
          <Slider 
            value={[priorityLevel]}
            min={1}
            max={4}
            step={1}
            onValueChange={handlePriorityChange}
            disabled={dynamicPriority || isRunning}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Economy</span>
            <span>Standard</span>
            <span>Fast</span>
            <span>Urgent</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between space-x-3">
          <Label htmlFor="dynamic-toggle" className="flex-1">
            Dynamic Priority Adjustment
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically optimize fees based on network conditions
            </p>
          </Label>
          <Switch
            id="dynamic-toggle"
            checked={dynamicPriority}
            onCheckedChange={handleDynamicToggle}
            disabled={isRunning}
          />
        </div>
        
        <div className="border border-border/20 rounded-md p-3 bg-secondary/30">
          <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Recent Fee History
          </div>
          <div className="flex items-end h-20 gap-1">
            {historicalFees.map((fee, index) => {
              const height = (fee / 0.00006) * 100; // Scale to percentage of max height
              return (
                <div 
                  key={index} 
                  className="flex-1 bg-primary/40 rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${fee.toFixed(6)} SOL`}
                />
              );
            })}
            <div 
              className={`flex-1 ${feeReduction > 0 ? 'bg-positive' : 'bg-primary'} rounded-t`}
              style={{ height: `${(estimatedFee / 0.00006) * 100}%` }}
              title={`${estimatedFee.toFixed(6)} SOL (Current)`}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {dynamicPriority ? "Dynamic priority" : getPriorityLabel()} selected
          </div>
        </div>
        
        {isRunning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Fee settings locked.</span> Fee optimizer settings can't be modified while the bot is running.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeOptimizer;
