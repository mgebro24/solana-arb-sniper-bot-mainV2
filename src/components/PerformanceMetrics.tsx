
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart2, TrendingUp, Clock, Wallet, ArrowDown, ArrowUp, CircleDollarSign } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetricsProps {
  investmentAmount?: number;
  isRunning?: boolean;
}

const PerformanceMetrics = ({ 
  investmentAmount = 0,
  isRunning = false
}: PerformanceMetricsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [profitData, setProfitData] = useState<any[]>([]);
  const [gasData, setGasData] = useState<any[]>([]);
  const [slippageData, setSlippageData] = useState<any[]>([]);
  const [executionData, setExecutionData] = useState<any[]>([]);
  
  const [metrics, setMetrics] = useState({
    totalProfit: 0,
    totalGasFees: 0,
    totalTransactions: 0,
    avgExecutionTime: 0,
    avgProfitPerTrade: 0,
    successRate: 0,
    roi: 0,
  });
  
  useEffect(() => {
    generateMockData();
  }, [selectedPeriod, investmentAmount]);
  
  const generateMockData = () => {
    let dataPoints: number;
    let format: string;
    
    switch (selectedPeriod) {
      case 'hour':
        dataPoints = 60;
        format = 'HH:mm';
        break;
      case 'day':
        dataPoints = 24;
        format = 'HH:00';
        break;
      case 'week':
        dataPoints = 7;
        format = 'ddd';
        break;
      case 'month':
        dataPoints = 30;
        format = 'DD';
        break;
      default:
        dataPoints = 24;
        format = 'HH:00';
    }
    
    // Generate profit data
    let profit = 0;
    let gasFees = 0;
    let transactions = 0;
    let executionTotal = 0;
    let successCount = 0;
    
    const profitArray = [];
    const gasArray = [];
    const slippageArray = [];
    const executionArray = [];
    
    for (let i = 0; i < dataPoints; i++) {
      // Generate timestamp
      const date = new Date();
      if (selectedPeriod === 'hour') {
        date.setMinutes(date.getMinutes() - (dataPoints - i));
      } else if (selectedPeriod === 'day') {
        date.setHours(date.getHours() - (dataPoints - i));
      } else if (selectedPeriod === 'week') {
        date.setDate(date.getDate() - (dataPoints - i));
      } else if (selectedPeriod === 'month') {
        date.setDate(date.getDate() - (dataPoints - i));
      }
      
      // Generate values based on period
      const baseProfit = selectedPeriod === 'hour' ? 0.05 : 
                        selectedPeriod === 'day' ? 0.2 : 
                        selectedPeriod === 'week' ? 1.2 : 3.5;
      
      const txCount = Math.floor(Math.random() * (
        selectedPeriod === 'hour' ? 3 : 
        selectedPeriod === 'day' ? 8 : 
        selectedPeriod === 'week' ? 25 : 80
      )) + 1;
      
      const periodProfit = (Math.random() * baseProfit * 2) * (Math.random() > 0.8 ? -0.5 : 1);
      const periodGasFee = txCount * (0.002 + Math.random() * 0.003);
      const avgSlippage = Math.random() * 0.5;
      const avgExecution = 100 + Math.random() * 400;
      
      // Update totals
      profit += periodProfit;
      gasFees += periodGasFee;
      transactions += txCount;
      executionTotal += avgExecution * txCount;
      successCount += txCount * (Math.random() > 0.1 ? 1 : 0.7); // 90% success rate on average
      
      // Add to arrays
      profitArray.push({
        time: formatTime(date, format),
        profit: periodProfit.toFixed(3),
        cumulative: profit.toFixed(2)
      });
      
      gasArray.push({
        time: formatTime(date, format),
        gas: periodGasFee.toFixed(3),
        transactions: txCount
      });
      
      slippageArray.push({
        time: formatTime(date, format),
        slippage: avgSlippage.toFixed(3),
        transactions: txCount
      });
      
      executionArray.push({
        time: formatTime(date, format),
        execution: avgExecution.toFixed(0),
        transactions: txCount
      });
    }
    
    setProfitData(profitArray);
    setGasData(gasArray);
    setSlippageData(slippageArray);
    setExecutionData(executionArray);
    
    // Calculate overall metrics
    setMetrics({
      totalProfit: profit,
      totalGasFees: gasFees,
      totalTransactions: transactions,
      avgExecutionTime: transactions > 0 ? executionTotal / transactions : 0,
      avgProfitPerTrade: transactions > 0 ? profit / transactions : 0,
      successRate: transactions > 0 ? (successCount / transactions) * 100 : 0,
      roi: investmentAmount > 0 ? (profit / investmentAmount) * 100 : 0
    });
  };
  
  const formatTime = (date: Date, format: string): string => {
    if (format === 'HH:mm') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (format === 'HH:00') {
      return `${date.getHours()}:00`;
    } else if (format === 'ddd') {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else if (format === 'DD') {
      return date.getDate().toString();
    }
    return date.toLocaleTimeString();
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-highlight" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Trading performance analytics and statistics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "default" : "outline"} className={isRunning ? "animate-pulse" : ""}>
              {isRunning ? "Live Data" : "Historical Data"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="profit">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="profit" className="text-xs">Profit</TabsTrigger>
              <TabsTrigger value="gas" className="text-xs">Gas Fees</TabsTrigger>
              <TabsTrigger value="slippage" className="text-xs">Slippage</TabsTrigger>
              <TabsTrigger value="execution" className="text-xs">Execution</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <button 
                className={`text-xs px-2 py-1 rounded ${selectedPeriod === 'hour' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setSelectedPeriod('hour')}
              >
                1H
              </button>
              <button 
                className={`text-xs px-2 py-1 rounded ${selectedPeriod === 'day' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setSelectedPeriod('day')}
              >
                24H
              </button>
              <button 
                className={`text-xs px-2 py-1 rounded ${selectedPeriod === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setSelectedPeriod('week')}
              >
                7D
              </button>
              <button 
                className={`text-xs px-2 py-1 rounded ${selectedPeriod === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setSelectedPeriod('month')}
              >
                30D
              </button>
            </div>
          </div>
          
          <div className="bg-secondary/30 rounded-md p-4 grid grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">Total Profit</div>
              <div className={`text-lg font-medium ${metrics.totalProfit >= 0 ? 'text-positive' : 'text-destructive'}`}>
                ${metrics.totalProfit.toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">Gas Fees</div>
              <div className="text-lg font-medium">
                ${metrics.totalGasFees.toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">Transactions</div>
              <div className="text-lg font-medium">
                {metrics.totalTransactions}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">ROI</div>
              <div className={`text-lg font-medium flex items-center ${metrics.roi >= 0 ? 'text-positive' : 'text-destructive'}`}>
                {metrics.roi >= 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {metrics.roi.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <TabsContent value="profit" className="mt-0">
            <div className="rounded-md border border-border/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-positive" />
                  <span className="font-medium">Profit Overview</span>
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  <span className="text-muted-foreground">Avg. per trade:</span>
                  <span className={metrics.avgProfitPerTrade >= 0 ? 'text-positive' : 'text-destructive'}>
                    ${metrics.avgProfitPerTrade.toFixed(3)}
                  </span>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#64748b22" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickFormatter={(value) => `$${value}`}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(240 6% 15%)',
                        border: 'none',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                      formatter={(value: any) => [`$${value}`, 'Profit']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      name="Period Profit"
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      name="Cumulative Profit"
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gas" className="mt-0">
            <div className="rounded-md border border-border/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Gas Fee Analysis</span>
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  <span className="text-muted-foreground">Avg. per transaction:</span>
                  <span>
                    ${(metrics.totalGasFees / metrics.totalTransactions || 0).toFixed(4)}
                  </span>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gasData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#64748b22" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickFormatter={(value) => `$${value}`}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(240 6% 15%)',
                        border: 'none',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === "gas") return [`$${value}`, 'Gas Fees'];
                        return [value, 'Transactions'];
                      }}
                    />
                    <Bar 
                      dataKey="gas" 
                      name="Gas Fees"
                      fill="#f59e0b90" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      name="Transactions"
                      yAxisId="right"
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="slippage" className="mt-0">
            <div className="rounded-md border border-border/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Slippage Analysis</span>
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  <span className="text-muted-foreground">Avg. slippage:</span>
                  <span>{(slippageData.reduce((acc, item) => acc + parseFloat(item.slippage), 0) / slippageData.length).toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slippageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#64748b22" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(240 6% 15%)',
                        border: 'none',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === "slippage") return [`${value}%`, 'Slippage'];
                        return [value, 'Transactions'];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="slippage" 
                      name="Slippage"
                      stroke="#9333ea" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      name="Transactions"
                      yAxisId="right"
                      stroke="#64748b" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="execution" className="mt-0">
            <div className="rounded-md border border-border/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-500" />
                  <span className="font-medium">Execution Time</span>
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  <span className="text-muted-foreground">Avg. execution:</span>
                  <span>{metrics.avgExecutionTime.toFixed(0)} ms</span>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#64748b22" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickFormatter={(value) => `${value}ms`}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b" 
                      strokeWidth={0.5} 
                      fontSize={10}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(240 6% 15%)',
                        border: 'none',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === "execution") return [`${value} ms`, 'Execution Time'];
                        return [value, 'Transactions'];
                      }}
                    />
                    <Bar 
                      dataKey="execution" 
                      name="Execution Time"
                      fill="#0ea5e990" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      name="Transactions"
                      yAxisId="right"
                      stroke="#64748b" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
