
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Landmark, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useArbitrageContext } from "@/context/ArbitrageContext";

interface InvestmentPanelProps {
  onInvestmentChange?: (amount: number) => void;
  onMaxPerTradeChange?: (amount: number) => void;
  onStrategyChange?: (strategies: { direct: boolean; triangular: boolean; quadrilateral: boolean }) => void;
  initialInvestment?: number;
  initialMaxPerTrade?: number;
  initialStrategies?: { direct: boolean; triangular: boolean; quadrilateral: boolean };
  isRunning?: boolean;
}

const InvestmentPanel = ({
  onInvestmentChange,
  onMaxPerTradeChange,
  onStrategyChange,
  initialInvestment = 0,
  initialMaxPerTrade = 0,
  initialStrategies,
  isRunning = false
}: InvestmentPanelProps) => {
  const [investmentAmount, setInvestmentAmount] = useState<number | string>(initialInvestment);
  const [maxPerTrade, setMaxPerTrade] = useState<number | string>(initialMaxPerTrade);
  const { toast } = useToast();
  
  // Get strategies from context
  const { strategies, setStrategies } = useArbitrageContext();
  
  // Initialize strategies from props or context
  useEffect(() => {
    if (initialStrategies) {
      setStrategies(initialStrategies);
    }
  }, [initialStrategies, setStrategies]);
  
  // Update investment amount when initialInvestment prop changes
  useEffect(() => {
    setInvestmentAmount(initialInvestment);
  }, [initialInvestment]);
  
  // Update max per trade when initialMaxPerTrade prop changes
  useEffect(() => {
    setMaxPerTrade(initialMaxPerTrade);
  }, [initialMaxPerTrade]);
  
  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRunning) return;
    
    const value = e.target.value;
    
    if (value === "") {
      setInvestmentAmount("");
      return;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    
    setInvestmentAmount(numValue);
    
    if (onInvestmentChange) {
      onInvestmentChange(numValue);
    }
  };
  
  const handleMaxPerTradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRunning) return;
    
    const value = e.target.value;
    
    if (value === "") {
      setMaxPerTrade("");
      return;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    
    // Ensure max per trade doesn't exceed total investment
    const effectiveValue = typeof investmentAmount === 'number' && numValue > investmentAmount 
      ? investmentAmount 
      : numValue;
    
    setMaxPerTrade(effectiveValue);
    
    if (onMaxPerTradeChange) {
      onMaxPerTradeChange(effectiveValue);
    }
  };
  
  const handleStrategyToggle = (strategy: 'direct' | 'triangular' | 'quadrilateral') => {
    if (isRunning) {
      toast({
        title: "Cannot Change Strategy",
        description: "Stop the bot before changing strategies",
        variant: "destructive",
      });
      return;
    }
    
    const updatedStrategies = {
      ...strategies,
      [strategy]: !strategies[strategy]
    };
    
    // Ensure at least one strategy is active
    if (Object.values(updatedStrategies).some(isActive => isActive)) {
      setStrategies(updatedStrategies);
      
      if (onStrategyChange) {
        onStrategyChange(updatedStrategies);
      }
    } else {
      toast({
        title: "Strategy Error",
        description: "At least one arbitrage strategy must be active",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Landmark className="h-5 w-5 text-highlight" />
          Investment Panel
        </CardTitle>
        <CardDescription>
          Configure investment amounts and strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="investment-amount">Total Investment (SOL)</Label>
          <Input
            id="investment-amount"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            value={investmentAmount}
            onChange={handleInvestmentChange}
            disabled={isRunning}
            className={isRunning ? "opacity-70" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="max-per-trade">Max Amount Per Trade (SOL)</Label>
          <Input
            id="max-per-trade"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            value={maxPerTrade}
            onChange={handleMaxPerTradeChange}
            disabled={isRunning}
            className={isRunning ? "opacity-70" : ""}
          />
        </div>
        
        <div className="pt-2">
          <h3 className="text-sm font-medium mb-3">Arbitrage Strategies</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="direct-toggle" className="cursor-pointer flex-1">
                <span>Direct (DEX-to-DEX)</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Same token pair across different DEXes
                </p>
              </Label>
              <Switch
                id="direct-toggle"
                checked={strategies.direct}
                onCheckedChange={() => handleStrategyToggle('direct')}
                disabled={isRunning}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="triangular-toggle" className="cursor-pointer flex-1">
                <span>Triangular</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Three-way token routes on same/different DEXes
                </p>
              </Label>
              <Switch
                id="triangular-toggle"
                checked={strategies.triangular}
                onCheckedChange={() => handleStrategyToggle('triangular')}
                disabled={isRunning}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="quadrilateral-toggle" className="cursor-pointer flex-1">
                <span>Quadrilateral</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Four-way complex routes (higher profit, higher risk)
                </p>
              </Label>
              <Switch
                id="quadrilateral-toggle"
                checked={strategies.quadrilateral}
                onCheckedChange={() => handleStrategyToggle('quadrilateral')}
                disabled={isRunning}
              />
            </div>
          </div>
        </div>
        
        {isRunning && (
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Bot is running.</span> Investment settings cannot be changed while the bot is active.
            </div>
          </div>
        )}
        
        {typeof investmentAmount === 'number' && investmentAmount > 0 && typeof maxPerTrade === 'number' && maxPerTrade > 0 && maxPerTrade < investmentAmount && (
          <div className="text-xs text-muted-foreground pt-1">
            With current settings, bot will execute multiple trades of up to {maxPerTrade.toFixed(2)} SOL each from your total {investmentAmount.toFixed(2)} SOL investment.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentPanel;
