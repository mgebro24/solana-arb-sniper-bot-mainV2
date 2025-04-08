
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Trophy, ArrowDown, DropletIcon, Timer, AlertTriangle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

interface LiquidityMonitorProps {
  isRunning?: boolean;
  autoRefresh?: boolean;
}

const LiquidityMonitor = ({ 
  isRunning = false,
  autoRefresh = true 
}: LiquidityMonitorProps) => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [liquidityData, setLiquidityData] = useState<any[]>([]);
  
  // Generate mock data on mount and when autoRefresh changes
  useEffect(() => {
    generateData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);
  
  const generateData = () => {
    const dexes = ["Raydium", "Jupiter", "Orca", "Meteora"];
    const pairs = ["SOL/USDC", "BONK/USDC", "RAY/USDC", "JTO/USDC"];
    
    const newData = [];
    
    for (const pair of pairs) {
      const dexLiquidity: Record<string, number> = {};
      let totalLiquidity = 0;
      let bestDex = "";
      let maxLiq = 0;
      
      for (const dex of dexes) {
        // Generate random liquidity between 100k and 5M
        const base = pair === "SOL/USDC" ? 1000000 : 
                     pair === "BONK/USDC" ? 300000 :
                     pair === "RAY/USDC" ? 500000 : 200000;
                     
        const variance = base * 0.5; // 50% variance
        const liquidity = base + (Math.random() * variance * 2) - variance;
        
        dexLiquidity[dex] = liquidity;
        totalLiquidity += liquidity;
        
        if (liquidity > maxLiq) {
          maxLiq = liquidity;
          bestDex = dex;
        }
      }
      
      // Calculate imbalance - higher is more imbalanced
      const avgLiquidity = totalLiquidity / dexes.length;
      const imbalance = dexes.reduce((acc, dex) => {
        return acc + Math.abs(dexLiquidity[dex] - avgLiquidity) / avgLiquidity;
      }, 0) / dexes.length * 100;
      
      // Calculate arbitrage potential (higher imbalance = higher potential)
      const arbPotential = Math.min(imbalance * 0.08, 2.5); // cap at 2.5%
      
      newData.push({
        pair,
        totalLiquidity,
        dexLiquidity,
        bestDex,
        imbalance,
        arbPotential,
        chartData: dexes.map(dex => ({
          dex,
          liquidity: dexLiquidity[dex]
        }))
      });
    }
    
    // Sort by total liquidity descending
    newData.sort((a, b) => b.totalLiquidity - a.totalLiquidity);
    
    setLiquidityData(newData);
    setLastUpdated(new Date());
  };
  
  const formatLiquidity = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };
  
  const getArbPotentialBadge = (potential: number) => {
    if (potential < 0.5) {
      return (
        <Badge variant="outline" className="bg-secondary border-muted text-xs">
          Low
        </Badge>
      );
    }
    if (potential < 1.5) {
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-xs">
          Medium
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-positive/20 text-positive border-positive/40 text-xs">
        High
      </Badge>
    );
  };
  
  const renderHealthStatus = (imbalance: number) => {
    if (imbalance < 10) {
      return (
        <div className="flex items-center gap-1" title="Balanced liquidity across DEXes">
          <Check className="h-4 w-4 text-positive" />
          <span className="text-positive text-xs">Balanced</span>
        </div>
      );
    }
    if (imbalance < 30) {
      return (
        <div className="flex items-center gap-1" title="Some liquidity differences between DEXes">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-amber-500 text-xs">Moderate</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1" title="Significant liquidity differences between DEXes">
        <ArrowDown className="h-4 w-4 text-destructive" />
        <span className="text-destructive text-xs">Imbalanced</span>
      </div>
    );
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DropletIcon className="h-5 w-5 text-highlight" />
              Liquidity Monitor
            </CardTitle>
            <CardDescription>
              Track DEX liquidity and market depth
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-muted-foreground gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Updated {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago
            </div>
            {autoRefresh && (
              <Badge variant="outline" className="bg-muted/30">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight"></span>
                </span>
                Auto-refresh
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Pair</TableHead>
              <TableHead>Liquidity Distribution</TableHead>
              <TableHead className="text-center">Total TVL</TableHead>
              <TableHead className="text-center">Best DEX</TableHead>
              <TableHead className="text-center">Health</TableHead>
              <TableHead className="text-center">Arb Potential</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liquidityData.map((item) => (
              <TableRow key={item.pair}>
                <TableCell className="font-medium">
                  {item.pair}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full h-9">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={item.chartData} layout="vertical" barCategoryGap={1}>
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="dex" hide />
                              <RechartsTooltip 
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Liquidity']}
                                contentStyle={{ 
                                  backgroundColor: 'hsl(240 6% 15%)',
                                  border: 'none',
                                  fontSize: '12px',
                                  borderRadius: '4px'
                                }}
                              />
                              <Bar dataKey="liquidity" fill="#8884d8" radius={[0, 4, 4, 0]} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1.5">
                          {Object.entries(item.dexLiquidity).map(([dex, liq]: [string, any]) => (
                            <div key={dex} className="flex items-center justify-between gap-4">
                              <span className="text-xs">{dex}:</span>
                              <span className="text-xs font-mono">{formatLiquidity(liq)}</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  {formatLiquidity(item.totalLiquidity)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-primary/10 text-primary border-primary/40 text-xs">
                    {item.bestDex}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {renderHealthStatus(item.imbalance)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    {getArbPotentialBadge(item.arbPotential)}
                    <span className="text-[10px] text-muted-foreground">
                      up to {item.arbPotential.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LiquidityMonitor;
