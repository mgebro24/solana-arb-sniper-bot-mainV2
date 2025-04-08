
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Gauge, Percent, Coins, Network, AlertCircle, Clock, BarChart } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const BotControls = () => {
  const [profitThreshold, setProfitThreshold] = useState(0.25);
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [maxTradeSize, setMaxTradeSize] = useState(2.5);
  const [priorityFee, setPriorityFee] = useState("dynamic");
  const [executionDelay, setExecutionDelay] = useState(200);
  const { toast } = useToast();
  
  const handleReset = () => {
    setProfitThreshold(0.25);
    setMaxSlippage(0.5);
    setMaxTradeSize(2.5);
    setPriorityFee("dynamic");
    setExecutionDelay(200);
    
    toast({
      title: "Settings Reset",
      description: "All bot parameters have been reset to default values.",
      variant: "default",
    });
  };
  
  const handlePriorityFeeChange = (fee: string) => {
    setPriorityFee(fee);
    
    toast({
      title: "Priority Fee Updated",
      description: `Priority fee set to ${fee} mode.`,
      variant: "default",
    });
  };
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5 text-highlight" />
              Bot Configuration
            </CardTitle>
            <CardDescription>
              Configure arbitrage parameters and limits
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-secondary/70 border-muted text-xs">
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Min. Profit Threshold</label>
            </div>
            <div className="text-sm">{profitThreshold}%</div>
          </div>
          <Slider
            value={[profitThreshold]}
            onValueChange={(values) => setProfitThreshold(values[0])}
            max={2}
            min={0.05}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <div>0.05%</div>
            <div>2%</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Max. Slippage</label>
            </div>
            <div className="text-sm">{maxSlippage}%</div>
          </div>
          <Slider
            value={[maxSlippage]}
            onValueChange={(values) => setMaxSlippage(values[0])}
            max={2}
            min={0.1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <div>0.1%</div>
            <div>2%</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Max. Trade Size</label>
            </div>
            <div className="text-sm">{maxTradeSize} SOL</div>
          </div>
          <Slider
            value={[maxTradeSize]}
            onValueChange={(values) => setMaxTradeSize(values[0])}
            max={10}
            min={0.1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <div>0.1 SOL</div>
            <div>10 SOL</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Execution Delay</label>
            </div>
            <div className="text-sm">{executionDelay}ms</div>
          </div>
          <Slider
            value={[executionDelay]}
            onValueChange={(values) => setExecutionDelay(values[0])}
            max={1000}
            min={0}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <div>0ms</div>
            <div>1000ms</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Network className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Priority Fee</label>
            </div>
            <div className="text-sm capitalize">{priorityFee}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={priorityFee === "low" ? "secondary" : "outline"} 
              size="sm" 
              className="w-full"
              onClick={() => handlePriorityFeeChange("low")}
            >
              Low
            </Button>
            <Button 
              variant={priorityFee === "dynamic" ? "secondary" : "outline"} 
              size="sm" 
              className="w-full"
              onClick={() => handlePriorityFeeChange("dynamic")}
            >
              Dynamic
            </Button>
            <Button 
              variant={priorityFee === "high" ? "secondary" : "outline"} 
              size="sm" 
              className="w-full"
              onClick={() => handlePriorityFeeChange("high")}
            >
              High
            </Button>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full mt-2 gap-2 border-muted/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                onClick={handleReset}
              >
                <AlertCircle className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset all settings to default values</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default BotControls;
