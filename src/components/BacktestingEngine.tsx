
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatabaseIcon, Clock, BarChart2, TrendingUp, Play, Download, ChevronDown, ChevronUp, History, ArrowRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BacktestResult {
  id: string;
  name: string;
  duration: string;
  startDate: string;
  endDate: string;
  profit: number;
  profitPercent: number;
  trades: number;
  winRate: number;
  drawdown: number;
  sharpeRatio: number;
}

interface BacktestingEngineProps {
  isRunning: boolean;
}

const BacktestingEngine = ({ isRunning }: BacktestingEngineProps) => {
  const [timeframe, setTimeframe] = useState<string>('week');
  const [startDate, setStartDate] = useState<string>('2025-03-01');
  const [endDate, setEndDate] = useState<string>('2025-04-01');
  const [initialCapital, setInitialCapital] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('setup');
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate mock backtest results
  const generateMockResults = (id: string, name: string): BacktestResult => {
    // Generate realistic but randomized results
    const profit = Math.random() * 20 + 10; // 10-30%
    const trades = Math.floor(Math.random() * 150) + 50; // 50-200
    const winRate = Math.random() * 20 + 70; // 70-90%
    const drawdown = Math.random() * 5 + 2; // 2-7%
    const sharpeRatio = Math.random() * 2 + 1; // 1-3
    
    return {
      id,
      name,
      duration: timeframe,
      startDate,
      endDate,
      profit: parseFloat((initialCapital * (profit / 100)).toFixed(2)),
      profitPercent: parseFloat(profit.toFixed(2)),
      trades,
      winRate: parseFloat(winRate.toFixed(1)),
      drawdown: parseFloat(drawdown.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2))
    };
  };

  const startBacktest = () => {
    if (isRunning) {
      toast({
        title: "Cannot Start Backtest",
        description: "Please stop the live bot before running backtest",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    setActiveTab('running');
    
    toast({
      title: "Backtest Started",
      description: `Running simulation from ${startDate} to ${endDate}`,
    });
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Generate backtest result
          const resultId = `backtest-${Date.now()}`;
          const resultName = `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Backtest (${new Date().toLocaleTimeString()})`;
          const result = generateMockResults(resultId, resultName);
          
          setBacktestResults(prev => [result, ...prev]);
          setSelectedResult(resultId);
          setIsLoading(false);
          setActiveTab('results');
          
          toast({
            title: "Backtest Completed",
            description: `${result.profitPercent}% profit with ${result.winRate}% win rate`,
            variant: "default",
          });
          
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };
  
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    
    // Update date range based on selected timeframe
    const now = new Date();
    let start = new Date();
    
    switch (value) {
      case 'day':
        start.setDate(now.getDate() - 1);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(now.getMonth() - 3);
        break;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };
  
  const getSelectedResult = () => {
    return backtestResults.find(result => result.id === selectedResult);
  };
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-highlight" />
              Rust Backtesting Engine
            </CardTitle>
            <CardDescription>
              High-performance historical simulation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="setup" className="flex-1">
              Setup
            </TabsTrigger>
            <TabsTrigger value="running" className="flex-1" disabled={!isLoading}>
              Running
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1" disabled={backtestResults.length === 0}>
              Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm">Timeframe</Label>
              <Select value={timeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">1 Day</SelectItem>
                  <SelectItem value="week">1 Week</SelectItem>
                  <SelectItem value="month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initial-capital" className="text-sm flex items-center gap-1.5">
                <DatabaseIcon className="h-4 w-4" />
                Initial Capital (SOL)
              </Label>
              <Input
                id="initial-capital"
                type="number"
                min={1}
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
              />
            </div>
            
            <Button 
              className="w-full gap-1.5"
              onClick={startBacktest}
              disabled={isRunning || isLoading}
            >
              <Play className="h-4 w-4" />
              Start Backtest
            </Button>
            
            {isRunning && (
              <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded border border-border/20 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Please stop the live bot before running backtests</span>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="running" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 animate-pulse text-highlight" />
                  <span>Processing historical data...</span>
                </div>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Start Date: {startDate}</span>
                <span>End Date: {endDate}</span>
              </div>
            </div>
            
            <div className="bg-secondary/30 rounded-md p-3 border border-border/30">
              <div className="text-sm font-medium mb-2">Simulation Details</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeframe:</span>
                  <span>{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initial Capital:</span>
                  <span>{initialCapital} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">Running</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Using Rust-optimized parallel processing for maximum speed</span>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            {selectedResult ? (
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-md p-3 border border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{getSelectedResult()?.name}</div>
                    <Select value={selectedResult} onValueChange={setSelectedResult}>
                      <SelectTrigger className="h-7 text-xs w-[180px]">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        {backtestResults.map(result => (
                          <SelectItem key={result.id} value={result.id}>
                            {result.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{getSelectedResult()?.startDate}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>{getSelectedResult()?.endDate}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Profit</div>
                      <div className="flex items-center gap-2 font-medium text-positive">
                        <TrendingUp className="h-4 w-4" />
                        +{getSelectedResult()?.profitPercent}% (+{getSelectedResult()?.profit} SOL)
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground text-xs">Win Rate</div>
                      <div className="font-medium">{getSelectedResult()?.winRate}%</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground text-xs">Trades</div>
                      <div className="font-medium">{getSelectedResult()?.trades}</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground text-xs">Max Drawdown</div>
                      <div className="font-medium">{getSelectedResult()?.drawdown}%</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground text-xs">Sharpe Ratio</div>
                      <div className="font-medium">{getSelectedResult()?.sharpeRatio}</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground text-xs">Duration</div>
                      <div className="font-medium capitalize">{getSelectedResult()?.duration}</div>
                    </div>
                  </div>
                </div>
                
                <div className="h-[120px] bg-muted/30 rounded-md flex items-center justify-center border border-border/20">
                  <div className="text-sm text-muted-foreground">Profit chart visualization</div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-1.5"
                    onClick={() => setActiveTab('setup')}
                  >
                    <Play className="h-4 w-4" />
                    New Backtest
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="gap-1.5"
                    onClick={() => {
                      toast({
                        title: "Report Downloaded",
                        description: "Detailed backtest report saved as PDF",
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No backtest results available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BacktestingEngine;
