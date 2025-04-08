
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Zap, ArrowRight, RefreshCw, CircleDollarSign, Timer, TrendingUp, 
  ClipboardCheck, AlertTriangle, Check, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuickTradeProps {
  isConnected?: boolean;
  isRunning?: boolean;
  onTradeExecuted?: (result: any) => void;
}

const QuickTrade = ({ 
  isConnected = false, 
  isRunning = false,
  onTradeExecuted
}: QuickTradeProps) => {
  const [amount, setAmount] = useState<string>("0.5");
  const [pair, setPair] = useState<string>("SOL/USDC");
  const [sourceDex, setSourceDex] = useState<string>("Raydium");
  const [targetDex, setTargetDex] = useState<string>("Jupiter");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  const { toast } = useToast();
  
  const tokenPairs = [
    "SOL/USDC",
    "BONK/USDC",
    "RAY/USDC",
    "SAMO/USDC",
    "JTO/USDC"
  ];
  
  const dexes = [
    "Raydium",
    "Jupiter",
    "Orca",
    "Meteora"
  ];
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || (/^\d*\.?\d*$/).test(value)) {
      setAmount(value);
    }
  };
  
  const simulateTrade = () => {
    if (Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }
    
    if (sourceDex === targetDex) {
      toast({
        title: "Invalid DEX Selection",
        description: "Source and target DEX must be different",
        variant: "destructive",
      });
      return;
    }
    
    setIsSimulating(true);
    setProgress(0);
    setSimulationResult(null);
    
    // Simulate the progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 20;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Generate simulation result
          const profitPercent = (Math.random() * 1.5) - 0.2; // -0.2% to 1.3%
          const gasCost = 0.001 + (Math.random() * 0.003); // 0.001-0.004 SOL
          const executionTime = 100 + Math.random() * 400; // 100-500ms
          const slippage = Math.random() * 0.5; // 0-0.5%
          
          const amountNum = Number(amount);
          const profit = (amountNum * profitPercent) / 100;
          const netProfit = profit - gasCost;
          
          const result = {
            profitable: netProfit > 0,
            profitPercent,
            profitAmount: profit,
            gasCost,
            netProfit,
            executionTime,
            slippage,
            steps: [
              { 
                description: `Buy ${pair.split('/')[0]} on ${sourceDex}`,
                status: "success" 
              },
              { 
                description: `Sell ${pair.split('/')[0]} on ${targetDex}`,
                status: "success"
              },
              { 
                description: "Verify transaction",
                status: "success" 
              }
            ],
            isProfitable: netProfit > 0,
            risk: profitPercent < 0.3 ? "high" : profitPercent < 0.7 ? "medium" : "low"
          };
          
          setSimulationResult(result);
          setIsSimulating(false);
          
          toast({
            title: "Simulation Complete",
            description: netProfit > 0 
              ? `Potential profit: $${netProfit.toFixed(3)}` 
              : "Trade would not be profitable",
            variant: netProfit > 0 ? "default" : "destructive",
          });
          
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };
  
  const executeTrade = () => {
    if (!simulationResult) {
      toast({
        title: "Simulation Required",
        description: "Please simulate the trade before executing",
        variant: "destructive",
      });
      return;
    }
    
    if (!simulationResult.isProfitable) {
      toast({
        title: "Unprofitable Trade",
        description: "This trade would result in a loss",
        variant: "destructive",
      });
      return;
    }
    
    setIsExecuting(true);
    setProgress(0);
    
    // Simulate execution
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 15;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // In a real implementation, this is where you would call the blockchain to execute the trade
          
          setIsExecuting(false);
          
          // Clear the simulation result
          setSimulationResult(null);
          
          toast({
            title: "Trade Executed",
            description: `Successfully executed ${pair} arbitrage trade`,
            variant: "default",
          });
          
          if (onTradeExecuted) {
            onTradeExecuted({
              pair,
              amount: Number(amount),
              sourceDex,
              targetDex,
              profit: simulationResult.netProfit,
              profitPercent: simulationResult.profitPercent,
              executionTime: simulationResult.executionTime,
              timestamp: new Date()
            });
          }
          
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };
  
  const clearSimulation = () => {
    setSimulationResult(null);
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-highlight" />
              Quick Trade
            </CardTitle>
            <CardDescription>
              Execute one-time arbitrage trades
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "outline"} className={isConnected ? "bg-positive text-positive-foreground" : "text-muted-foreground"}>
            {isConnected ? "Ready to Trade" : "Connect Wallet First"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm">Token Pair</label>
          <Select 
            value={pair} 
            onValueChange={setPair}
            disabled={isSimulating || isExecuting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select token pair" />
            </SelectTrigger>
            <SelectContent>
              {tokenPairs.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm">Amount</label>
          <div className="flex items-center">
            <Input 
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={handleAmountChange}
              disabled={isSimulating || isExecuting}
            />
            <span className="ml-2 text-sm text-muted-foreground">SOL</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm">Buy on</label>
            <Select 
              value={sourceDex} 
              onValueChange={setSourceDex}
              disabled={isSimulating || isExecuting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Source DEX" />
              </SelectTrigger>
              <SelectContent>
                {dexes.map((dex) => (
                  <SelectItem key={dex} value={dex}>
                    {dex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm">Sell on</label>
            <Select 
              value={targetDex} 
              onValueChange={setTargetDex}
              disabled={isSimulating || isExecuting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Target DEX" />
              </SelectTrigger>
              <SelectContent>
                {dexes.map((dex) => (
                  <SelectItem key={dex} value={dex}>
                    {dex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {(isSimulating || isExecuting) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{isSimulating ? "Simulating trade..." : "Executing trade..."}</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        
        {simulationResult && !isExecuting && (
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-1.5">
                <ClipboardCheck className="h-4 w-4 text-highlight" />
                Simulation Result
              </h3>
              <Badge 
                variant="outline" 
                className={
                  simulationResult.isProfitable 
                    ? "bg-positive/20 text-positive border-positive/40" 
                    : "bg-destructive/20 text-destructive border-destructive/40"
                }
              >
                {simulationResult.isProfitable ? "Profitable" : "Not Profitable"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm flex flex-col">
                <span className="text-muted-foreground">Profit</span>
                <span className={simulationResult.profitPercent >= 0 ? "text-positive" : "text-destructive"}>
                  {simulationResult.profitPercent >= 0 ? "+" : ""}{simulationResult.profitPercent.toFixed(3)}%
                </span>
              </div>
              <div className="text-sm flex flex-col">
                <span className="text-muted-foreground">Gas Cost</span>
                <span>
                  ${simulationResult.gasCost.toFixed(4)}
                </span>
              </div>
              <div className="text-sm flex flex-col">
                <span className="text-muted-foreground">Net Profit</span>
                <span className={simulationResult.netProfit >= 0 ? "text-positive" : "text-destructive"}>
                  ${simulationResult.netProfit.toFixed(4)}
                </span>
              </div>
              <div className="text-sm flex flex-col">
                <span className="text-muted-foreground">Execution Time</span>
                <span>
                  {Math.round(simulationResult.executionTime)}ms
                </span>
              </div>
            </div>
            
            <div className="text-sm space-y-1.5">
              <div className="font-medium">Execution Steps</div>
              <div className="space-y-1">
                {simulationResult.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-center text-xs">
                    {step.status === "success" ? (
                      <Check className="h-3.5 w-3.5 text-positive mr-1.5" />
                    ) : step.status === "error" ? (
                      <X className="h-3.5 w-3.5 text-destructive mr-1.5" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                    )}
                    <span>{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {simulationResult.risk !== "low" && (
              <div className={`flex items-start gap-2 p-2 rounded text-xs ${
                simulationResult.risk === "high" 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-amber-500/10 text-amber-500"
              }`}>
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                <div>
                  {simulationResult.risk === "high" 
                    ? "High risk: Low profit margin may be eliminated by market movement" 
                    : "Medium risk: Moderate profit potential with some slippage risk"}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          {simulationResult ? (
            <>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={clearSimulation}
                disabled={isSimulating || isExecuting}
              >
                Reset
              </Button>
              <Button 
                className="flex-1 gap-1.5"
                onClick={executeTrade}
                disabled={!simulationResult.isProfitable || isSimulating || isExecuting || !isConnected || isRunning}
              >
                <CircleDollarSign className="h-4 w-4" />
                Execute Trade
              </Button>
            </>
          ) : (
            <Button 
              className="w-full gap-1.5" 
              onClick={simulateTrade}
              disabled={isSimulating || isExecuting || isRunning}
            >
              <Timer className="h-4 w-4" />
              {isSimulating ? "Simulating..." : "Simulate Trade"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuickTrade;
