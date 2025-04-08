import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Clock, History, TrendingUp, Zap, ArrowUpCircle, BarChart, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getBotStatistics } from "@/services/priceService";
import { Badge } from "@/components/ui/badge";

interface BotStatisticsProps {
  investmentAmount?: number;
}

const BotStatistics = ({ investmentAmount = 0 }: BotStatisticsProps) => {
  const [stats, setStats] = useState<any>({
    hourlyStats: [],
    totalProfit: 0,
    totalTransactions: 0,
    avgExecutionTime: 0,
    roi: 0,
    strategyBreakdown: [],
    dailyStats: [],
    pairPerformance: [],
  });
  
  useEffect(() => {
    const fetchStatistics = async () => {
      const statsData = await getBotStatistics(investmentAmount);
      setStats(statsData);
    };
    
    fetchStatistics();
  }, [investmentAmount]);
  
  const formatProfit = (value: number) => {
    return `$${value.toFixed(3)}`;
  };
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="h-5 w-5 text-highlight" />
          Bot Performance Statistics
        </CardTitle>
        <CardDescription>
          Performance metrics and trading history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-secondary/70 backdrop-blur-sm p-2 rounded-md border border-border/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Total Profit
            </div>
            <div className={`font-medium ${stats.totalProfit >= 0 ? 'text-positive' : 'text-destructive'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}{formatProfit(stats.totalProfit)}
            </div>
          </div>
          
          <div className="bg-secondary/70 backdrop-blur-sm p-2 rounded-md border border-border/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <History className="h-3.5 w-3.5" />
              Transactions
            </div>
            <div className="font-medium">
              {stats.totalTransactions}
            </div>
          </div>
          
          <div className="bg-secondary/70 backdrop-blur-sm p-2 rounded-md border border-border/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              Avg. Execution
            </div>
            <div className="font-medium">
              {stats.avgExecutionTime.toFixed(0)}ms
            </div>
          </div>
          
          <div className="bg-secondary/70 backdrop-blur-sm p-2 rounded-md border border-border/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <ArrowUpCircle className="h-3.5 w-3.5" />
              ROI
            </div>
            <div className={`font-medium ${stats.roi >= 0 ? 'text-positive' : 'text-destructive'}`}>
              {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Hourly Profit (Last 12h)</div>
            <div className="h-64 bg-secondary/50 p-4 rounded-md border border-border/20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.hourlyStats}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }} 
                    stroke="#64748b" 
                    strokeWidth={0.5} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    stroke="#64748b" 
                    strokeWidth={0.5}
                    tickFormatter={formatProfit}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(3)}`, 'Profit']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(240 6% 15%)',
                      border: 'none',
                      fontSize: '12px',
                      borderRadius: '4px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Strategy Performance</div>
            <div className="h-64 bg-secondary/50 p-4 rounded-md border border-border/20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.strategyBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.strategyBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} transactions`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(240 6% 15%)',
                      border: 'none',
                      fontSize: '12px',
                      borderRadius: '4px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Performance (Last 7 days)
          </div>
          <div className="h-64 bg-secondary/50 p-4 rounded-md border border-border/20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyStats}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  stroke="#64748b" 
                  strokeWidth={0.5} 
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  stroke="#64748b" 
                  strokeWidth={0.5}
                  tickFormatter={formatProfit}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'profit') return [`$${Number(value).toFixed(2)}`, 'Profit'];
                    return [value, 'Transactions'];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(240 6% 15%)',
                    border: 'none',
                    fontSize: '12px',
                    borderRadius: '4px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="profit"
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Best Performing Token Pairs
          </div>
          <div className="bg-secondary/50 p-3 rounded-md border border-border/20">
            <div className="grid grid-cols-1 divide-y divide-border/30">
              {stats.pairPerformance.map((pair: any, index: number) => (
                <div key={index} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{pair.pair}</span>
                    <Badge variant="outline" className="bg-secondary">
                      {pair.transactions} trades
                    </Badge>
                  </div>
                  <span className={`font-medium ${pair.profit >= 0 ? 'text-positive' : 'text-destructive'}`}>
                    {pair.profit >= 0 ? '+' : ''}{pair.profit.toFixed(2)} USD
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotStatistics;
