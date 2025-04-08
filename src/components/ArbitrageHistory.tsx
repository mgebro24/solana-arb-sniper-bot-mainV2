
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Clock, ArrowRight, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getArbitrageHistory, ArbitrageHistoryItem } from "@/services/priceService";

const ArbitrageHistory = () => {
  const [history, setHistory] = useState<ArbitrageHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ArbitrageHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  
  useEffect(() => {
    // Fetch history data
    const fetchHistory = async () => {
      const historyData = await getArbitrageHistory();
      setHistory(historyData);
      setFilteredHistory(historyData);
    };
    
    fetchHistory();
  }, []);
  
  useEffect(() => {
    // Apply filters
    if (filter === 'all') {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter(item => 
        filter === 'success' ? item.status === 'completed' : item.status === 'failed'
      ));
    }
  }, [filter, history]);
  
  const totalProfit = history
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + (item.profitUsd || 0) - (item.gasCost || 0), 0);
  
  const successRate = history.length > 0
    ? (history.filter(item => item.status === 'completed').length / history.length) * 100
    : 0;
    
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-highlight" />
              Arbitrage History
            </CardTitle>
            <CardDescription>
              Record of all arbitrage transactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {filter === 'all' ? 'All' : filter === 'success' ? 'Successful' : 'Failed'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Transactions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('success')}>
                  Successful Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('failed')}>
                  Failed Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary p-2 rounded-md">
            <div className="text-sm text-muted-foreground">Total Profit</div>
            <div className={`text-lg font-medium ${totalProfit >= 0 ? 'text-positive' : 'text-destructive'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} USD
            </div>
          </div>
          <div className="bg-secondary p-2 rounded-md">
            <div className="text-sm text-muted-foreground">Success Rate</div>
            <div className="text-lg font-medium">{successRate.toFixed(1)}%</div>
          </div>
          <div className="bg-secondary p-2 rounded-md">
            <div className="text-sm text-muted-foreground">Transactions</div>
            <div className="text-lg font-medium">{history.length}</div>
          </div>
        </div>
        
        {filteredHistory.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredHistory.map((item, index) => (
              <div 
                key={index} 
                className="bg-secondary/60 backdrop-blur-sm rounded-md p-3 space-y-2 border border-border/20 hover:border-border/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.status === 'completed' ? (
                      <TrendingUp className="h-4 w-4 text-positive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-medium">{item.route}</span>
                    <Badge variant="outline" className={
                      item.status === 'completed' 
                        ? "bg-positive/20 text-positive border-positive/40" 
                        : "bg-destructive/20 text-destructive border-destructive/40"
                    }>
                      {item.status === 'completed' ? 'Successful' : 'Failed'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <div className="flex flex-wrap items-center gap-1">
                    {item.path.map((step, i) => (
                      <div key={i} className="flex items-center">
                        <span className="bg-muted px-1.5 py-0.5 rounded">
                          {step.dex}
                        </span>
                        {i < item.path.length - 1 && (
                          <ArrowRight className="h-3 w-3 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{item.executionTime || 0}ms</span>
                    </div>
                    <div>
                      Gas: ${item.gasCost?.toFixed(4) || '0.00'}
                    </div>
                    <div>
                      Strategy: {item.strategyType}
                    </div>
                  </div>
                  
                  <div className={`font-medium ${item.profitUsd >= 0 ? 'text-positive' : 'text-destructive'}`}>
                    {item.profitUsd >= 0 ? '+' : ''}{item.profitUsd?.toFixed(2) || '0.00'} USD
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No transaction history found
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArbitrageHistory;
