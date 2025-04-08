
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare, Download, Filter, CheckCircle2, XCircle, AlertTriangle, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

interface TransactionLogsProps {
  isRunning?: boolean;
  maxEntries?: number;
}

const TransactionLogs = ({ 
  isRunning = false,
  maxEntries = 100
}: TransactionLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterTypes, setFilterTypes] = useState<Record<string, boolean>>({
    info: true,
    success: true,
    error: true,
    warning: true
  });
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Generate mock logs on mount and when the bot status changes
  useEffect(() => {
    // Clear logs when starting
    if (isRunning) {
      addLog({
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'info',
        message: 'Arbitrage bot started',
        data: { version: '1.0.0' }
      });
      
      // Set up interval to add logs periodically if the bot is running
      const interval = setInterval(() => {
        if (!isRunning) return;
        
        // Randomly generate different types of logs
        const types: ('info' | 'success' | 'error' | 'warning')[] = ['info', 'success', 'warning', 'error'];
        const weights = [0.60, 0.25, 0.1, 0.05]; // Probabilities for each type
        
        // Select a type based on weights
        let rand = Math.random();
        let selectedTypeIndex = 0;
        let cumulativeWeight = 0;
        
        for (let i = 0; i < weights.length; i++) {
          cumulativeWeight += weights[i];
          if (rand <= cumulativeWeight) {
            selectedTypeIndex = i;
            break;
          }
        }
        
        const type = types[selectedTypeIndex];
        
        // Generate log message based on type
        let message = '';
        let data = null;
        
        switch (type) {
          case 'info':
            message = sample([
              'Scanning for arbitrage opportunities',
              'Checking SOL/USDC price difference between Raydium and Orca',
              'Monitoring liquidity pools for changes',
              'Received new block data from RPC',
              'Updated token prices from DEX pools',
              'Processing market depth data'
            ]);
            break;
          case 'success':
            message = sample([
              'Found arbitrage opportunity for SOL/USDC',
              'Successfully executed triangular arbitrage',
              'Transaction confirmed with 0.25% profit',
              'Portfolio rebalanced for optimal position',
              'Completed direct arbitrage between Jupiter and Raydium'
            ]);
            data = {
              profit: (Math.random() * 0.5 + 0.1).toFixed(3) + '%',
              txHash: '5KY...j8mQ'
            };
            break;
          case 'warning':
            message = sample([
              'Slippage above threshold, transaction aborted',
              'Network congestion detected, increasing priority fees',
              'Price impact too high for trade size',
              'DEX API response slower than expected',
              'Token reserve ratio shifting unfavorably'
            ]);
            break;
          case 'error':
            message = sample([
              'Transaction failed: insufficient funds',
              'RPC connection timeout',
              'DEX API returned error response',
              'Failed to calculate optimal path',
              'Contract execution reverted'
            ]);
            data = {
              error: 'Transaction error',
              code: 'INSUFFICIENT_OUTPUT_AMOUNT'
            };
            break;
        }
        
        addLog({
          id: Date.now().toString(),
          timestamp: new Date(),
          type,
          message,
          data
        });
      }, 3000);
      
      return () => clearInterval(interval);
    } else if (logs.length > 0) {
      // Add a log when stopping if there are existing logs
      addLog({
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'info',
        message: 'Arbitrage bot stopped',
      });
    }
  }, [isRunning]);
  
  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);
  
  const addLog = (log: LogEntry) => {
    setLogs(prev => {
      if (prev.length >= maxEntries) {
        // Remove oldest entries if we exceed maxEntries
        return [...prev.slice(prev.length - maxEntries + 1), log];
      }
      return [...prev, log];
    });
  };
  
  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "Logs Cleared",
      description: "Transaction log history has been cleared",
    });
  };
  
  const downloadLogs = () => {
    try {
      const logsText = logs.map(log => 
        `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${log.message}${
          log.data ? ` | Data: ${JSON.stringify(log.data)}` : ''
        }`
      ).join('\n');
      
      const blob = new Blob([logsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arbitrage_bot_logs_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Logs Exported",
        description: "Transaction logs saved to text file",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to download logs", error);
      toast({
        title: "Export Failed",
        description: "Could not export transaction logs",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to randomly select an item from an array
  function sample<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return <TerminalSquare className="h-4 w-4" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
    }
  };
  
  const getLogClass = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return 'text-foreground';
      case 'success':
        return 'text-positive';
      case 'warning':
        return 'text-amber-500';
      case 'error':
        return 'text-destructive';
    }
  };
  
  const filteredLogs = logs.filter(log => filterTypes[log.type]);

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-highlight" />
              Transaction Logs
            </CardTitle>
            <CardDescription>
              Real-time bot activity and operations
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`${isRunning ? 'animate-pulse bg-positive/20 text-positive border-positive/30' : 'bg-secondary/70 text-muted-foreground'}`}
          >
            {isRunning ? 'Live Logs' : 'Stopped'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={filterTypes.info}
                onCheckedChange={(checked) => setFilterTypes(prev => ({ ...prev, info: checked }))}
              >
                Info
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.success}
                onCheckedChange={(checked) => setFilterTypes(prev => ({ ...prev, success: checked }))}
              >
                Success
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.warning}
                onCheckedChange={(checked) => setFilterTypes(prev => ({ ...prev, warning: checked }))}
              >
                Warning
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.error}
                onCheckedChange={(checked) => setFilterTypes(prev => ({ ...prev, error: checked }))}
              >
                Error
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7"
              onClick={clearLogs}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7"
              onClick={downloadLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="border-t border-border/20">
          <div 
            className="h-[350px] overflow-y-auto bg-secondary/20 font-mono text-xs p-2"
            style={{ scrollBehavior: 'smooth' }}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              const isScrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
              if (autoScroll !== isScrolledToBottom) {
                setAutoScroll(isScrolledToBottom);
              }
            }}
          >
            {filteredLogs.length > 0 ? (
              <div className="space-y-1">
                {filteredLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 pb-1 border-b border-border/10 last:border-0">
                    <div className={`pt-0.5 ${getLogClass(log.type)}`}>
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`${getLogClass(log.type)}`}>{log.message}</span>
                      </div>
                      {log.data && (
                        <div className="mt-0.5 bg-secondary/40 p-1 rounded text-[10px] text-muted-foreground overflow-x-auto">
                          {JSON.stringify(log.data)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No logs available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionLogs;
