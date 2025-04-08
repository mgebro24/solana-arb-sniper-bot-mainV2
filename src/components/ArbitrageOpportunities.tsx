
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, TrendingUp, Zap, AlertCircle, Triangle, ArrowLeftRight, BarChart2, BrainCircuit } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { ArbitrageOpportunity, findArbitrageOpportunities, fetchTokenPrices, simulateTransaction } from "@/services/priceService";
import { useToast } from "@/hooks/use-toast";
import { useArbitrageContext } from "@/context/ArbitrageContext";

interface ArbitrageOpportunitiesProps {
  autoRefresh: boolean;
  isRunning: boolean;
  investmentAmount?: number;
  maxInvestmentPerTrade?: number;
  activeStrategies?: {
    direct: boolean;
    triangular: boolean;
    quadrilateral: boolean;
  };
}

const ArbitrageOpportunities = ({ 
  autoRefresh = true, 
  isRunning = false,
  investmentAmount = 0,
  maxInvestmentPerTrade = 0,
  activeStrategies = { direct: true, triangular: true, quadrilateral: false }
}: ArbitrageOpportunitiesProps) => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { toast } = useToast();
  const { strategies, intelligenceLevel } = useArbitrageContext();

  // Use the context strategies if provided, otherwise use the prop
  const effectiveStrategies = strategies || activeStrategies;

  const fetchOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching opportunities with strategies:", effectiveStrategies);
      const prices = await fetchTokenPrices();
      const arbs = await findArbitrageOpportunities(prices, effectiveStrategies);
      
      // Sort opportunities by profitability before setting state
      const sortedArbs = [...arbs].sort((a, b) => b.profitUsd - a.profitUsd);
      setOpportunities(sortedArbs);
      
      // Log the most profitable opportunity for potential auto-execution
      if (sortedArbs.length > 0) {
        console.log("Most profitable opportunity:", sortedArbs[0]);
      }
    } catch (error) {
      console.error("Failed to fetch arbitrage opportunities", error);
      toast({
        title: "Error finding opportunities",
        description: "Could not analyze the latest market data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, effectiveStrategies]);

  useEffect(() => {
    fetchOpportunities();
    
    // Auto-refresh opportunities if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchOpportunities, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchOpportunities, autoRefresh]);

  // Filter opportunities based on active strategies
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredOpportunities(opportunities);
    } else {
      setFilteredOpportunities(opportunities.filter(opp => opp.strategyType === activeFilter));
    }
  }, [activeFilter, opportunities]);

  // Effect for auto-execution when bot is running with intelligent decision making
  useEffect(() => {
    if (isRunning && opportunities.length > 0 && investmentAmount > 0) {
      const readyOpportunities = opportunities.filter(opp => opp.status === 'ready');
      
      if (readyOpportunities.length > 0) {
        // Auto-execute the most profitable opportunity based on intelligence level
        let selectedOpportunity: ArbitrageOpportunity;
        
        if (intelligenceLevel === 'high') {
          // Advanced selection logic - consider risk, gas costs, historical success rate
          selectedOpportunity = readyOpportunities.reduce((best, current) => {
            // Calculate an "intelligence score" considering multiple factors
            const currentScore = current.profitUsd - (current.gasCost || 0) - (current.riskFactor || 0);
            const bestScore = best.profitUsd - (best.gasCost || 0) - (best.riskFactor || 0);
            return currentScore > bestScore ? current : best;
          }, readyOpportunities[0]);
          
          console.log("Selected opportunity using high intelligence:", selectedOpportunity);
        } else if (intelligenceLevel === 'medium') {
          // Balanced approach - consider profit and gas costs
          selectedOpportunity = readyOpportunities.reduce((best, current) => {
            const currentNet = current.profitUsd - (current.gasCost || 0);
            const bestNet = best.profitUsd - (best.gasCost || 0);
            return currentNet > bestNet ? current : best;
          }, readyOpportunities[0]);
        } else {
          // Simple approach - just pick the highest profit
          selectedOpportunity = readyOpportunities.reduce(
            (max, opp) => opp.profitUsd > max.profitUsd ? opp : max,
            readyOpportunities[0]
          );
        }
        
        // Check if we have enough investment for this trade
        const tradeAmount = Math.min(maxInvestmentPerTrade || investmentAmount, investmentAmount);
        if (tradeAmount > 0) {
          handleExecute(selectedOpportunity.id, tradeAmount);
        }
      }
    }
  }, [isRunning, opportunities, investmentAmount, maxInvestmentPerTrade, intelligenceLevel]);

  const handleExecute = async (id: string, amount?: number) => {
    const investmentForTrade = amount || (maxInvestmentPerTrade || investmentAmount);
    
    toast({
      title: "Executing arbitrage",
      description: `Preparing transaction with ${investmentForTrade.toFixed(2)} SOL`,
    });
    
    // Simulate execution by updating status
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id ? { ...opp, status: "executing", investmentAmount: investmentForTrade } : opp
      )
    );
    
    try {
      // Get the opportunity
      const opportunity = opportunities.find(opp => opp.id === id);
      if (!opportunity) return;
      
      // Simulate transaction execution
      const result = await simulateTransaction(opportunity, investmentForTrade);
      
      // Update opportunity with results
      setTimeout(() => {
        setOpportunities(prev => {
          // Store result for learning from this execution
          const updatedOpportunities = prev.map(opp => 
            opp.id === id ? { 
              ...opp, 
              status: result.success ? "completed" : "failed",
              executionTime: result.executionTime,
              gasCost: result.gasCost,
              profitUsd: result.profitAfterCosts,
              timestamp: Date.now(),
            } : opp
          );
          
          // Analyze the results to learn from success/failure - improves future opportunities
          if (intelligenceLevel === 'high' && !result.success) {
            console.log("Learning from failed transaction:", result.failureReason);
            // In a real implementation, this would update a learning model
            // For now, we just log the insight
          }
          
          return updatedOpportunities;
        });
        
        toast({
          title: result.success ? "Arbitrage executed" : "Arbitrage failed",
          description: result.success 
            ? `Transaction completed with profit: $${result.profitAfterCosts.toFixed(2)}`
            : `Transaction failed: ${result.failureReason || "Unknown error"}`,
          variant: result.success ? "default" : "destructive",
        });
      }, 2000);
    } catch (error) {
      console.error("Error executing arbitrage:", error);
      
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === id ? { ...opp, status: "failed" } : opp
        )
      );
      
      toast({
        title: "Execution error",
        description: "Failed to execute the arbitrage transaction",
        variant: "destructive",
      });
    }
  };

  const getStrategyIcon = (strategyType: string) => {
    switch (strategyType) {
      case 'direct':
        return <ArrowLeftRight className="h-3.5 w-3.5" />;
      case 'triangular':
        return <Triangle className="h-3.5 w-3.5" />;
      case 'quadrilateral':
        return <BarChart2 className="h-3.5 w-3.5" />;
      default:
        return <TrendingUp className="h-3.5 w-3.5" />;
    }
  };

  const filterOpportunities = (strategyType: string) => {
    setActiveFilter(strategyType);
  };

  const getIntelligenceBadge = () => {
    if (!isRunning) return null;
    
    return (
      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 gap-1">
        <BrainCircuit className="h-3.5 w-3.5" />
        {intelligenceLevel === 'high' ? 'Advanced AI' : 
          intelligenceLevel === 'medium' ? 'Smart Analysis' : 'Basic Logic'}
      </Badge>
    );
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-highlight" />
              Arbitrage Opportunities
            </CardTitle>
            <CardDescription>
              Real-time opportunities across DEXes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={activeFilter === 'all' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => filterOpportunities('all')}
              className="text-xs h-8"
            >
              All
            </Button>
            <Button 
              variant={activeFilter === 'direct' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => filterOpportunities('direct')}
              className="text-xs h-8"
              disabled={!effectiveStrategies.direct}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
              Direct
            </Button>
            <Button 
              variant={activeFilter === 'triangular' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => filterOpportunities('triangular')}
              className="text-xs h-8"
              disabled={!effectiveStrategies.triangular}
            >
              <Triangle className="h-3.5 w-3.5 mr-1" />
              Triangular
            </Button>
            <Button 
              variant={activeFilter === 'quadrilateral' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => filterOpportunities('quadrilateral')}
              className="text-xs h-8"
              disabled={!effectiveStrategies.quadrilateral}
            >
              <BarChart2 className="h-3.5 w-3.5 mr-1" />
              Quad
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {getIntelligenceBadge()}
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && filteredOpportunities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Scanning opportunities...</p>
            </div>
          </div>
        ) : filteredOpportunities.length > 0 ? (
          filteredOpportunities.map((opp) => (
            <div 
              key={opp.id} 
              className={`bg-secondary/70 backdrop-blur-sm rounded-md p-3 space-y-2 border ${
                opp.status === 'executing' ? 'border-amber-500/50 bg-amber-500/5' :
                opp.status === 'completed' ? 'border-positive/50 bg-positive/5' :
                opp.status === 'failed' ? 'border-destructive/50 bg-destructive/5' :
                'border-border/20 hover:border-border/50'
              } transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span>{opp.route}</span>
                  <Badge variant="outline" className="bg-positive/20 text-positive border-positive/40">
                    +{opp.profitPct.toFixed(2)}%
                  </Badge>
                  <Badge variant="outline" className="bg-secondary border-muted">
                    <span className="flex items-center gap-1.5">
                      {getStrategyIcon(opp.strategyType)}
                      {opp.strategyType.charAt(0).toUpperCase() + opp.strategyType.slice(1)}
                    </span>
                  </Badge>
                  {intelligenceLevel === 'high' && opp.riskFactor !== undefined && (
                    <Badge variant={opp.riskFactor > 0.5 ? "destructive" : "outline"} className="bg-secondary/70">
                      Risk: {opp.riskFactor < 0.3 ? 'Low' : opp.riskFactor < 0.7 ? 'Medium' : 'High'}
                    </Badge>
                  )}
                </div>
                <div className="text-positive font-medium">
                  +${opp.profitUsd.toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <div className="flex flex-wrap items-center gap-1">
                  {opp.path.map((step, i) => (
                    <div key={i} className="flex items-center">
                      <span className="bg-muted px-1.5 py-0.5 rounded">
                        {step.dex}
                      </span>
                      {i < opp.path.length - 1 && (
                        <ArrowRight className="h-3 w-3 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  size="sm" 
                  variant={opp.status === "completed" ? "success" : 
                          opp.status === "failed" ? "destructive" : 
                          opp.status === "executing" ? "outline" : "secondary"}
                  className="gap-1"
                  onClick={() => handleExecute(opp.id)}
                  disabled={opp.status !== "ready" || isRunning || investmentAmount <= 0}
                >
                  {opp.status === "executing" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Executing
                    </>
                  ) : opp.status === "completed" ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5" />
                      Completed
                    </>
                  ) : opp.status === "failed" ? (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Failed
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
              
              {opp.status === "completed" && opp.executionTime && (
                <div className="text-xs text-muted-foreground flex justify-between pt-1">
                  <span>Execution time: {opp.executionTime}ms</span>
                  <span>Gas cost: ${opp.gasCost?.toFixed(4)}</span>
                </div>
              )}
              
              {intelligenceLevel === 'high' && opp.status === "failed" && opp.failureReason && (
                <div className="text-xs text-destructive flex items-center gap-1 pt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Analysis: {opp.failureReason}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No {activeFilter !== 'all' ? activeFilter : ''} arbitrage opportunities found at the moment
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {isRunning ? 'Automatically executing opportunities...' : 'Scanning for opportunities...'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageOpportunities;
