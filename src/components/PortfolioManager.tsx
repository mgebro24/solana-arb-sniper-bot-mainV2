
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Wallet, ArrowDownUp, RefreshCw, TrendingUp, TrendingDown, AlertCircle, CircleDollarSign, CoinsIcon, PercentIcon, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface Token {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
  color: string;
}

interface PortfolioManagerProps {
  investmentAmount?: number;
  isConnected?: boolean;
  isRunning?: boolean;
  onRebalance?: () => void;
}

const PortfolioManager = ({ 
  investmentAmount = 0, 
  isConnected = false, 
  isRunning = false,
  onRebalance
}: PortfolioManagerProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [profitLoss, setProfitLoss] = useState(0);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [autoRebalanceThreshold, setAutoRebalanceThreshold] = useState(5); // 5% deviation threshold
  const [activeTab, setActiveTab] = useState("overview");
  const [targetAllocations, setTargetAllocations] = useState<Record<string, number>>({
    SOL: 50,
    USDC: 30,
    BONK: 10,
    RAY: 10
  });
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<{
    date: Date;
    type: string;
    amount: number;
    token: string;
    status: string;
  }[]>([
    {
      date: new Date(Date.now() - 86400000),
      type: "Buy",
      amount: 1.25,
      token: "SOL",
      status: "Completed"
    },
    {
      date: new Date(Date.now() - 172800000),
      type: "Sell",
      amount: 5000,
      token: "BONK",
      status: "Completed"
    },
    {
      date: new Date(Date.now() - 259200000),
      type: "Swap",
      amount: 10,
      token: "USDC → RAY",
      status: "Completed"
    }
  ]);
  
  const { toast } = useToast();
  
  // Colors for the pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    // Mock data - in a real app, this would come from a wallet or API
    const mockPortfolio: Token[] = [
      { 
        symbol: "SOL", 
        name: "Solana", 
        amount: 2.45, 
        value: investmentAmount * 0.65, 
        change24h: 3.2,
        color: COLORS[0]
      },
      { 
        symbol: "USDC", 
        name: "USD Coin", 
        amount: 21.35, 
        value: investmentAmount * 0.20, 
        change24h: 0.1,
        color: COLORS[1] 
      },
      { 
        symbol: "BONK", 
        name: "Bonk", 
        amount: 250000, 
        value: investmentAmount * 0.05, 
        change24h: -5.8,
        color: COLORS[2] 
      },
      { 
        symbol: "RAY", 
        name: "Raydium", 
        amount: 12.8, 
        value: investmentAmount * 0.10, 
        change24h: 1.5,
        color: COLORS[3] 
      },
    ];
    
    setTokens(mockPortfolio);
    
    const total = mockPortfolio.reduce((acc, token) => acc + token.value, 0);
    setTotalValue(total);
    
    // Calculate profit/loss (mock data)
    if (investmentAmount > 0) {
      setProfitLoss(total - investmentAmount);
    }

    // Check for auto rebalance if enabled
    if (autoRebalance && isConnected && isRunning && investmentAmount > 0) {
      checkAndAutoRebalance(mockPortfolio, total);
    }
  }, [investmentAmount, autoRebalance, isConnected, isRunning]);
  
  const checkAndAutoRebalance = (currentTokens: Token[], total: number) => {
    // Check if any token is deviating more than threshold % from target allocation
    const needsRebalancing = currentTokens.some(token => {
      const currentPercentage = (token.value / total) * 100;
      const targetPercentage = targetAllocations[token.symbol] || 0;
      return Math.abs(currentPercentage - targetPercentage) > autoRebalanceThreshold;
    });
    
    if (needsRebalancing && !isRebalancing) {
      toast({
        title: "Auto-Rebalancing Triggered",
        description: `Portfolio deviation exceeded ${autoRebalanceThreshold}% threshold`,
      });
      handleRebalance();
    }
  };

  const handleRebalance = async () => {
    if (!isConnected || isRunning) return;
    
    setIsRebalancing(true);
    toast({
      title: "Rebalancing Portfolio",
      description: "Optimizing token allocation for arbitrage...",
    });
    
    // Simulate rebalancing - in a real app, this would call a contract or API
    setTimeout(() => {
      // Update token distribution based on target allocations
      const updatedTokens = tokens.map(token => {
        const targetValue = totalValue * (targetAllocations[token.symbol] / 100);
        // Simple price estimate for calculating new amount
        const price = token.value / token.amount;
        const newAmount = price > 0 ? targetValue / price : 0;
        
        return {
          ...token,
          value: targetValue,
          amount: newAmount
        };
      });
      
      setTokens(updatedTokens);
      setIsRebalancing(false);
      
      // Add rebalance to transaction history
      setTransactionHistory(prev => [
        {
          date: new Date(),
          type: "Rebalance",
          amount: 0,
          token: "All",
          status: "Completed"
        },
        ...prev
      ]);
      
      toast({
        title: "Portfolio Rebalanced",
        description: "Token allocation has been optimized",
        variant: "default",
      });
      
      if (onRebalance) {
        onRebalance();
      }
    }, 2500);
  };
  
  const handleUpdateTargetAllocation = (symbol: string, value: number) => {
    // Make sure allocations sum to 100%
    const currentTotal = Object.entries(targetAllocations)
      .filter(([key]) => key !== symbol)
      .reduce((sum, [_, value]) => sum + value, 0);
    
    if (currentTotal + value > 100) {
      toast({
        title: "Invalid Allocation",
        description: "Total allocation cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }
    
    setTargetAllocations(prev => ({
      ...prev,
      [symbol]: value
    }));
    setEditingToken(null);
  };
  
  const chartData = tokens.map(token => ({
    name: token.symbol,
    value: token.value,
    color: token.color
  }));

  const calculateCurrentPercentage = (token: Token) => {
    return totalValue > 0 ? (token.value / totalValue) * 100 : 0;
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-highlight" />
              Portfolio Manager
            </CardTitle>
            <CardDescription>
              Manage your token allocation
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "outline"} className={isConnected ? "bg-positive text-positive-foreground" : "text-muted-foreground"}>
            {isConnected ? "Wallet Connected" : "Wallet Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between bg-secondary/50 rounded-md p-3 border border-border/20">
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-lg font-medium">${totalValue.toFixed(2)} USD</div>
              </div>
              <div className={`text-right ${profitLoss >= 0 ? 'text-positive' : 'text-destructive'}`}>
                <div className="flex items-center justify-end text-sm">
                  {profitLoss >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  PnL
                </div>
                <div className="font-medium">
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USD
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(240 6% 15%)',
                          border: 'none',
                          fontSize: '12px',
                          borderRadius: '4px'
                        }}
                      />
                      <Legend
                        formatter={(value) => <span style={{ color: '#ccc', fontSize: '10px' }}>{value}</span>}
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="col-span-3 space-y-2">
                {isRebalancing ? (
                  <div className="h-[180px] flex items-center justify-center flex-col gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-highlight" />
                    <div className="text-sm">Rebalancing Portfolio...</div>
                    <Progress value={65} className="w-full h-1.5" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                    {tokens.map((token, index) => (
                      <div key={index} className="flex items-center justify-between bg-secondary/30 rounded-md p-2 border border-border/10">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: token.color }}></div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div>{token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                          <div className="text-xs text-muted-foreground">${token.value.toFixed(2)}</div>
                        </div>
                        <div className="w-16 text-right">
                          <Badge 
                            variant="outline" 
                            className={`${
                              token.change24h > 0 
                                ? 'bg-positive/20 text-positive border-positive/40' 
                                : 'bg-destructive/20 text-destructive border-destructive/40'
                            }`}
                          >
                            {token.change24h > 0 ? '+' : ''}{token.change24h}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRebalance}
                disabled={!isConnected || isRunning || isRebalancing}
                className="w-full"
              >
                <ArrowDownUp className="h-4 w-4 mr-2" />
                Rebalance Portfolio
              </Button>
              
              <Button
                size="sm"
                className="w-full"
                disabled={!isConnected || isRunning}
              >
                <CircleDollarSign className="h-4 w-4 mr-2" />
                {investmentAmount > 0 ? `Add Funds` : `Set Investment`}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="allocations" className="space-y-4">
            <div className="flex items-center justify-between bg-secondary/50 rounded-md p-3 border border-border/20 mb-4">
              <div className="flex items-center gap-2">
                <PercentIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Target Allocations</div>
                  <div className="text-xs text-muted-foreground">Set your desired portfolio mix</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Auto-rebalance</div>
                <Switch
                  checked={autoRebalance}
                  onCheckedChange={setAutoRebalance}
                  disabled={!isConnected || isRunning}
                />
              </div>
            </div>
            
            {autoRebalance && (
              <div className="bg-secondary/20 p-3 rounded-md border border-border/20 mb-4">
                <Label className="text-sm">Auto-rebalance Threshold</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Slider
                    value={[autoRebalanceThreshold]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(values) => setAutoRebalanceThreshold(values[0])}
                    disabled={!isConnected || isRunning}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-10 text-center">{autoRebalanceThreshold}%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Bot will automatically rebalance when any token deviates by more than {autoRebalanceThreshold}% from target
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {tokens.map((token) => (
                <div 
                  key={token.symbol} 
                  className="bg-secondary/30 rounded-md p-3 border border-border/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: token.color }}></div>
                      <div className="font-medium">{token.symbol}</div>
                    </div>
                    {editingToken === token.symbol ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={targetAllocations[token.symbol]}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 100) {
                              setTargetAllocations(prev => ({
                                ...prev,
                                [token.symbol]: value
                              }));
                            }
                          }}
                          className="w-16 h-7 text-right"
                          min={0}
                          max={100}
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2"
                          onClick={() => handleUpdateTargetAllocation(token.symbol, targetAllocations[token.symbol])}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{targetAllocations[token.symbol]}%</div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2"
                          onClick={() => setEditingToken(token.symbol)}
                          disabled={isRunning || isRebalancing}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full bg-secondary/50 rounded-full h-2 mb-1">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${targetAllocations[token.symbol]}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>Current: {calculateCurrentPercentage(token).toFixed(1)}%</div>
                    <div>Target: {targetAllocations[token.symbol]}%</div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleRebalance}
              disabled={!isConnected || isRunning || isRebalancing}
              className="w-full mt-2"
            >
              <CoinsIcon className="h-4 w-4 mr-2" />
              Apply Target Allocations
            </Button>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between bg-secondary/50 rounded-md p-3 border border-border/20 mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Recent Transactions</div>
                  <div className="text-xs text-muted-foreground">Your portfolio history</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {transactionHistory.length > 0 ? (
                transactionHistory.map((tx, index) => (
                  <div 
                    key={index} 
                    className="bg-secondary/30 rounded-md p-3 border border-border/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                    </div>
                    
                    <div>
                      <div className="text-right">
                        {tx.amount > 0 ? `${tx.amount} ${tx.token}` : tx.token}
                      </div>
                      <div className="text-xs text-right">
                        <Badge variant="outline" className="bg-positive/20 text-positive border-positive/40">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transaction history available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Wallet not connected.</span> Connect your wallet to manage your portfolio and run the arbitrage bot.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;
