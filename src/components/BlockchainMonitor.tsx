
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Layers, Clock, Activity, CheckCircle2, AlertCircle, XCircle, Cpu, Radio, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NetworkStats {
  blockHeight: number;
  blockTime: number;
  tps: number;
  success_rate: number;
  avgFee: number;
  status: 'excellent' | 'good' | 'degraded' | 'congested';
  validators: {
    active: number;
    total: number;
  };
  epoch: {
    current: number;
    progress: number;
  };
  finality: {
    latestConfirmed: number;
    latestProcessed: number;
  };
}

interface BlockchainMonitorProps {
  isConnected: boolean;
  isRunning: boolean;
}

const BlockchainMonitor = ({ 
  isConnected,
  isRunning
}: BlockchainMonitorProps) => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    blockHeight: 231574821,
    blockTime: 0.43,
    tps: 2821,
    success_rate: 98.7,
    avgFee: 0.000012,
    status: 'good',
    validators: {
      active: 1732,
      total: 1840
    },
    epoch: {
      current: 422,
      progress: 67
    },
    finality: {
      latestConfirmed: 231574789,
      latestProcessed: 231574820
    }
  });
  const [blockTimes, setBlockTimes] = useState<number[]>([0.41, 0.43, 0.44, 0.42, 0.40, 0.43, 0.45, 0.42]);
  const [tpsHistory, setTpsHistory] = useState<number[]>([2750, 2830, 2790, 2810, 2840, 2780, 2820, 2860]);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Update network stats periodically when connected
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      // Simulate block height increment
      setNetworkStats(prev => ({
        ...prev,
        blockHeight: prev.blockHeight + 1,
        blockTime: parseFloat((0.4 + Math.random() * 0.1).toFixed(2)),
        tps: Math.floor(2700 + Math.random() * 300),
        success_rate: parseFloat((97 + Math.random() * 2.5).toFixed(1)),
        avgFee: parseFloat((0.00001 + Math.random() * 0.000005).toFixed(6)),
        finality: {
          latestConfirmed: prev.finality.latestConfirmed + 1,
          latestProcessed: prev.finality.latestProcessed + 1
        },
        epoch: {
          ...prev.epoch,
          progress: Math.min(100, prev.epoch.progress + 0.1)
        }
      }));
      
      // Update block time history
      const newBlockTime = parseFloat((0.4 + Math.random() * 0.1).toFixed(2));
      setBlockTimes(prev => [...prev.slice(1), newBlockTime]);
      
      // Update TPS history
      const newTps = Math.floor(2700 + Math.random() * 300);
      setTpsHistory(prev => [...prev.slice(1), newTps]);
      
      // Periodically update network status
      if (Math.random() > 0.95) {
        const newStatus = ['excellent', 'good', 'good', 'degraded'][Math.floor(Math.random() * 4)] as 'excellent' | 'good' | 'degraded' | 'congested';
        
        if (newStatus !== networkStats.status) {
          setNetworkStats(prev => ({
            ...prev,
            status: newStatus
          }));
          
          if (newStatus === 'degraded') {
            toast({
              title: "Network Alert",
              description: "Solana network performance is currently degraded",
              variant: "destructive",
            });
          } else if (newStatus === 'excellent' && isRunning) {
            toast({
              title: "Optimal Network Conditions",
              description: "Increasing trade frequency to take advantage",
              variant: "default",
            });
          }
        }
      }
      
    }, isRunning ? 2000 : 3000);
    
    return () => clearInterval(interval);
  }, [isConnected, isRunning, networkStats.status, toast]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-positive text-positive-foreground">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-emerald-500 text-emerald-950">Good</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-500 text-amber-950">Degraded</Badge>;
      case 'congested':
        return <Badge className="bg-destructive text-destructive-foreground">Congested</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Sparkles className="h-4 w-4 text-positive" />;
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'congested':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="h-5 w-5 text-highlight" />
              Blockchain Monitor
            </CardTitle>
            <CardDescription>
              Real-time Solana network analytics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(networkStats.status)}
            {getStatusBadge(networkStats.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-muted/50 rounded-none px-3">
            <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1 text-xs">Metrics</TabsTrigger>
            <TabsTrigger value="validators" className="flex-1 text-xs">Validators</TabsTrigger>
          </TabsList>
          
          <div className="p-3">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 p-2 rounded-md border border-border/20">
                  <div className="text-xs text-muted-foreground mb-1">Block Height</div>
                  <div className="text-lg font-medium">{networkStats.blockHeight.toLocaleString()}</div>
                </div>
                
                <div className="bg-secondary/30 p-2 rounded-md border border-border/20">
                  <div className="text-xs text-muted-foreground mb-1">Avg Block Time</div>
                  <div className="text-lg font-medium">{networkStats.blockTime}s</div>
                </div>
              </div>
              
              <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Current TPS</div>
                  <div className="text-sm font-medium">{networkStats.tps}</div>
                </div>
                
                <div className="flex items-end h-16 gap-1">
                  {tpsHistory.map((tps, index) => {
                    const height = (tps / 3500) * 100; // Scale to percentage of max height (assuming max TPS is 3500)
                    return (
                      <div 
                        key={index} 
                        className={`flex-1 rounded-t ${
                          tps > 3000 ? 'bg-positive' : 
                          tps > 2500 ? 'bg-emerald-500' : 
                          tps > 2000 ? 'bg-amber-500' : 'bg-destructive'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${tps} TPS`}
                      />
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2 mins ago</span>
                  <span>Now</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 p-2 rounded-md border border-border/20">
                  <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                  <div className="text-lg font-medium">{networkStats.success_rate}%</div>
                </div>
                
                <div className="bg-secondary/30 p-2 rounded-md border border-border/20">
                  <div className="text-xs text-muted-foreground mb-1">Average Fee</div>
                  <div className="text-lg font-medium">{networkStats.avgFee} SOL</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Epoch Progress</span>
                    </div>
                    <div>
                      Epoch {networkStats.epoch.current} ({networkStats.epoch.progress.toFixed(1)}%)
                    </div>
                  </div>
                  <Progress value={networkStats.epoch.progress} className="h-1.5 mt-1" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>Finality</span>
                    </div>
                    <div>
                      {networkStats.finality.latestProcessed - networkStats.finality.latestConfirmed} blocks behind
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Confirmed: {networkStats.finality.latestConfirmed.toLocaleString()} | 
                    Processed: {networkStats.finality.latestProcessed.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
                  <div className="text-sm font-medium mb-2">Block Times (seconds)</div>
                  <div className="flex items-end h-16 gap-1">
                    {blockTimes.map((time, index) => {
                      const height = (time / 0.6) * 100; // Scale to percentage of max height (assuming max time is 0.6s)
                      return (
                        <div 
                          key={index} 
                          className={`flex-1 rounded-t ${
                            time < 0.4 ? 'bg-positive' : 
                            time < 0.45 ? 'bg-emerald-500' : 
                            time < 0.5 ? 'bg-amber-500' : 'bg-destructive'
                          }`}
                          style={{ height: `${height}%` }}
                          title={`${time}s`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="validators" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Active Validators</div>
                  <Badge variant="outline" className="bg-secondary/70">
                    {networkStats.validators.active} / {networkStats.validators.total}
                  </Badge>
                </div>
                <Progress 
                  value={(networkStats.validators.active / networkStats.validators.total) * 100} 
                  className="h-1.5" 
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Radio className="h-3.5 w-3.5" />
                      <span>Stake Distribution</span>
                    </div>
                    <div className="text-lg font-medium">Top 10: 32.4%</div>
                    <div className="text-xs text-muted-foreground">
                      Nakamoto Coefficient: 23
                    </div>
                  </div>
                  
                  <div className="bg-secondary/30 p-3 rounded-md border border-border/20">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Vote Distance</span>
                    </div>
                    <div className="text-lg font-medium">Average: 2 slots</div>
                    <div className="text-xs text-muted-foreground">
                      Max: 8 slots
                    </div>
                  </div>
                </div>
              </div>
              
              {networkStats.status === 'degraded' && (
                <div className="bg-amber-500/10 p-3 rounded-md border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Network Degradation</div>
                      <div className="text-xs text-muted-foreground">
                        Some RPC nodes are experiencing increased latency.
                        Consider adjusting transaction priority fees.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        {!isConnected && (
          <div className="p-3 border-t border-border/20">
            <div className="text-xs flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Connect to RPC node to monitor live blockchain data</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainMonitor;
