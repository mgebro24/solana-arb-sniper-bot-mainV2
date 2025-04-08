
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface TokenPair {
  id: string;
  name: string;
  dexes: string[];
  liquidity: {
    [key: string]: number; // dex name: liquidity in USD
  };
  isActive: boolean;
  isCompatible: boolean;
}

interface PairScannerProps {
  onPairDiscovery?: (pairs: TokenPair[]) => void;
  isRunning?: boolean;
}

const PairScanner = ({ 
  onPairDiscovery,
  isRunning = false
}: PairScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [discoveredPairs, setDiscoveredPairs] = useState<TokenPair[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'compatible' | 'active'>('all');
  const { toast } = useToast();

  // Mock data for discovered pairs
  const mockDiscoveredPairs: TokenPair[] = [
    {
      id: "1",
      name: "SOL/USDC",
      dexes: ["Raydium", "Jupiter", "Orca", "Meteora"],
      liquidity: {
        "Raydium": 2500000,
        "Jupiter": 3100000,
        "Orca": 1800000,
        "Meteora": 980000
      },
      isActive: true,
      isCompatible: true
    },
    {
      id: "2",
      name: "BONK/USDC",
      dexes: ["Raydium", "Jupiter", "Meteora"],
      liquidity: {
        "Raydium": 850000,
        "Jupiter": 720000,
        "Meteora": 340000
      },
      isActive: true,
      isCompatible: true
    },
    {
      id: "3",
      name: "RAY/USDC",
      dexes: ["Raydium", "Jupiter", "Orca"],
      liquidity: {
        "Raydium": 580000,
        "Jupiter": 490000,
        "Orca": 320000
      },
      isActive: true,
      isCompatible: true
    },
    {
      id: "4",
      name: "SAMO/USDC",
      dexes: ["Raydium", "Jupiter"],
      liquidity: {
        "Raydium": 350000,
        "Jupiter": 290000
      },
      isActive: false,
      isCompatible: true
    },
    {
      id: "5",
      name: "MNGO/USDC",
      dexes: ["Jupiter", "Orca"],
      liquidity: {
        "Jupiter": 180000,
        "Orca": 140000
      },
      isActive: false,
      isCompatible: true
    },
    {
      id: "6",
      name: "RENDER/USDC",
      dexes: ["Raydium"],
      liquidity: {
        "Raydium": 120000
      },
      isActive: false,
      isCompatible: false
    },
  ];

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveredPairs([]);
    
    toast({
      title: "Scanning Started",
      description: "Searching for tradable token pairs across DEXes",
    });
    
    // Simulate scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 5;
        
        // Add pairs gradually as they're "discovered"
        if (newProgress === 25) {
          setDiscoveredPairs([mockDiscoveredPairs[0], mockDiscoveredPairs[1]]);
        } else if (newProgress === 50) {
          setDiscoveredPairs([...mockDiscoveredPairs.slice(0, 3)]);
        } else if (newProgress === 75) {
          setDiscoveredPairs([...mockDiscoveredPairs.slice(0, 5)]);
        } else if (newProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setDiscoveredPairs(mockDiscoveredPairs);
          
          toast({
            title: "Scan Completed",
            description: `Discovered ${mockDiscoveredPairs.length} token pairs`,
            variant: "default",
          });
          
          if (onPairDiscovery) {
            onPairDiscovery(mockDiscoveredPairs);
          }
          
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
    
    return () => clearInterval(interval);
  };

  const togglePairActive = (id: string) => {
    setDiscoveredPairs(prev => 
      prev.map(pair => 
        pair.id === id ? { ...pair, isActive: !pair.isActive } : pair
      )
    );
    
    // Find the pair that was toggled
    const pair = discoveredPairs.find(p => p.id === id);
    
    if (pair) {
      toast({
        title: pair.isActive ? "Pair Disabled" : "Pair Enabled",
        description: `${pair.name} arbitrage ${pair.isActive ? "disabled" : "enabled"}`,
        variant: "default",
      });
    }
    
    // Notify parent component about the updated pairs
    if (onPairDiscovery) {
      onPairDiscovery(discoveredPairs.map(pair => 
        pair.id === id ? { ...pair, isActive: !pair.isActive } : pair
      ));
    }
  };
  
  const filteredPairs = discoveredPairs.filter(pair => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'compatible') return pair.isCompatible;
    if (activeFilter === 'active') return pair.isActive;
    return true;
  });
  
  const formatLiquidity = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };
  
  const calculateTotalLiquidity = (pair: TokenPair) => {
    return Object.values(pair.liquidity).reduce((acc, value) => acc + value, 0);
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scan className="h-5 w-5 text-highlight" />
              Pair Scanner
            </CardTitle>
            <CardDescription>
              Discover compatible trading pairs
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={activeFilter === 'all' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
            <Button 
              variant={activeFilter === 'compatible' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveFilter('compatible')}
              className="h-7 text-xs"
            >
              Compatible
            </Button>
            <Button 
              variant={activeFilter === 'active' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setActiveFilter('active')}
              className="h-7 text-xs"
            >
              Active
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isScanning ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Scanning DEX pools...</span>
              </div>
              <span>{scanProgress}%</span>
            </div>
            <Progress value={scanProgress} className="h-1.5" />
          </div>
        ) : discoveredPairs.length > 0 ? (
          <div className="space-y-3">
            {filteredPairs.map(pair => (
              <div 
                key={pair.id}
                className={`rounded-md border p-3 transition-colors ${
                  pair.isActive 
                    ? 'bg-primary/10 border-primary/30' 
                    : pair.isCompatible 
                      ? 'bg-secondary/50 border-border/30 hover:border-border/50' 
                      : 'bg-secondary/30 border-border/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`p-1 rounded-full ${
                        !pair.isCompatible ? 'bg-destructive/20' : 
                        pair.isActive ? 'bg-positive/20' : 'bg-secondary'
                      }`}
                    >
                      {!pair.isCompatible ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : pair.isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-positive" />
                      ) : (
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium">{pair.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-secondary/70 text-xs border-muted">
                      {calculateTotalLiquidity(pair) >= 1000000 
                        ? `$${(calculateTotalLiquidity(pair) / 1000000).toFixed(1)}M` 
                        : `$${(calculateTotalLiquidity(pair) / 1000).toFixed(0)}K`} TVL
                    </Badge>
                    <Button 
                      variant={pair.isActive ? "default" : "outline"}
                      size="sm"
                      className="h-7"
                      disabled={!pair.isCompatible || isRunning}
                      onClick={() => togglePairActive(pair.id)}
                    >
                      {pair.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs flex flex-wrap gap-1">
                  {pair.dexes.map(dex => (
                    <div key={dex} className="flex items-center">
                      <Badge variant="outline" className="bg-muted/30 border-muted">
                        {dex} ({formatLiquidity(pair.liquidity[dex])})
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {!pair.isCompatible && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    <span>Insufficient liquidity across multiple DEXes</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/30 rounded-md p-6 flex flex-col items-center justify-center border border-border/20">
            <Scan className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">No token pairs discovered yet</p>
            <Button onClick={startScan} disabled={isRunning}>
              <Scan className="h-4 w-4 mr-2" />
              Scan for Trading Pairs
            </Button>
          </div>
        )}
        
        {discoveredPairs.length > 0 && !isScanning && (
          <Button 
            variant="outline"
            className="w-full"
            onClick={startScan}
            disabled={isRunning}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rescan for New Pairs
          </Button>
        )}
        
        {isRunning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Bot is running.</span> Token pair settings can't be modified while the bot is active.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PairScanner;
