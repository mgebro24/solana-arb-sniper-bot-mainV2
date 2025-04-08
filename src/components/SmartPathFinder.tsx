
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RouteIcon, Shuffle, GitGraph, Zap, BarChart2, Settings2, ArrowRight, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useArbitrageContext } from "@/context/ArbitrageContext";

interface Route {
  id: string;
  path: string[];
  efficiency: number;
  expectedProfit: number;
  complexity: number;
  status: 'active' | 'inactive' | 'analyzing';
}

interface SmartPathFinderProps {
  isRunning: boolean;
  onPathUpdate?: (paths: any) => void;
}

const SmartPathFinder = ({ 
  isRunning,
  onPathUpdate
}: SmartPathFinderProps) => {
  const [routeOptimizationLevel, setRouteOptimizationLevel] = useState<'standard' | 'aggressive' | 'maximum'>('standard');
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [activeRouteCount, setActiveRouteCount] = useState(0);
  const [autoDiscover, setAutoDiscover] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [maxComplexity, setMaxComplexity] = useState(3);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { strategies, intelligenceLevel } = useArbitrageContext();

  // Generate initial routes based on active strategies
  useEffect(() => {
    const initialRoutes: Route[] = [];
    
    // Add direct routes if enabled
    if (strategies.direct) {
      initialRoutes.push({
        id: 'route-1',
        path: ['USDC', 'SOL', 'USDC'],
        efficiency: 92,
        expectedProfit: 0.45,
        complexity: 1,
        status: 'active'
      });
    }
    
    // Add triangular routes if enabled
    if (strategies.triangular) {
      initialRoutes.push({
        id: 'route-2',
        path: ['USDC', 'SOL', 'BONK', 'USDC'],
        efficiency: 87,
        expectedProfit: 0.62,
        complexity: 2,
        status: 'active'
      },
      {
        id: 'route-3',
        path: ['USDC', 'RAY', 'BONK', 'USDC'],
        efficiency: 76,
        expectedProfit: 0.39,
        complexity: 2,
        status: 'inactive'
      });
    }
    
    // Add quadrilateral routes if enabled
    if (strategies.quadrilateral) {
      initialRoutes.push({
        id: 'route-4',
        path: ['USDC', 'SOL', 'JUP', 'BONK', 'USDC'],
        efficiency: 72,
        expectedProfit: 0.81,
        complexity: 3,
        status: 'active'
      });
    }
    
    setAvailableRoutes(initialRoutes);
    setActiveRouteCount(initialRoutes.filter(r => r.status === 'active').length);
  }, [strategies]);

  // Update routes when optimization level changes
  useEffect(() => {
    if (routeOptimizationLevel === 'standard') {
      setMaxComplexity(3);
    } else if (routeOptimizationLevel === 'aggressive') {
      setMaxComplexity(4);
    } else {
      setMaxComplexity(5);
    }
  }, [routeOptimizationLevel]);

  // Simulate route discovery when bot is running, with intelligence-based improvements
  useEffect(() => {
    if (!isRunning || !autoDiscover) return;
    
    const interval = setInterval(() => {
      // Higher intelligence increases chance of discovering new routes
      const discoveryChance = intelligenceLevel === 'high' ? 0.4 : 
                              intelligenceLevel === 'medium' ? 0.3 : 0.2;
      
      // Small chance to discover a new route
      if (Math.random() > (1 - discoveryChance)) {
        const tokens = ['USDC', 'SOL', 'BONK', 'RAY', 'JUP', 'SAMO', 'mSOL'];
        
        // Generate random path with length based on active strategies and max complexity
        let validTypes = [];
        if (strategies.direct) validTypes.push('direct');
        if (strategies.triangular) validTypes.push('triangular');
        if (strategies.quadrilateral) validTypes.push('quadrilateral');
        
        // If no strategies are active, can't discover new paths
        if (validTypes.length === 0) return;
        
        const strategyType = validTypes[Math.floor(Math.random() * validTypes.length)];
        
        // Determine path length based on strategy type
        let pathLength = 3; // Default (2 tokens + return to base)
        if (strategyType === 'direct') {
          pathLength = 3; // USDC -> Token -> USDC
        } else if (strategyType === 'triangular') {
          pathLength = 4; // USDC -> Token -> Token -> USDC
        } else if (strategyType === 'quadrilateral') {
          pathLength = 5; // USDC -> Token -> Token -> Token -> USDC
        }
        
        // Ensure we don't exceed max complexity
        pathLength = Math.min(pathLength, maxComplexity + 2);
        
        // Generate the path
        const midTokens = Array(pathLength - 2).fill(0).map(() => 
          tokens[Math.floor(Math.random() * (tokens.length - 1)) + 1]
        );
        const path = ['USDC', ...midTokens, 'USDC'];
        
        // Check this isn't a duplicate route
        const pathStr = path.join('-');
        if (!availableRoutes.some(r => r.path.join('-') === pathStr)) {
          setIsAnalyzing(true);
          
          // After a delay, add the new route
          setTimeout(() => {
            // Higher intelligence improves route quality
            const efficiencyBonus = intelligenceLevel === 'high' ? 10 : 
                                   intelligenceLevel === 'medium' ? 5 : 0;
            
            const efficiency = Math.floor(Math.random() * 25) + 70 + efficiencyBonus;
            
            const newRoute: Route = {
              id: `route-${Date.now()}`,
              path,
              efficiency,
              expectedProfit: parseFloat((Math.random() * 0.9 + 0.2).toFixed(2)),
              complexity: path.length - 2,
              status: 'analyzing'
            };
            
            setAvailableRoutes(prev => [...prev, newRoute]);
            setIsAnalyzing(false);
            
            // After another delay, activate the route if it's promising
            // Higher intelligence has better activation threshold
            const activationThreshold = intelligenceLevel === 'high' ? 72 : 
                                       intelligenceLevel === 'medium' ? 75 : 80;
            
            setTimeout(() => {
              setAvailableRoutes(prev => 
                prev.map(route => 
                  route.id === newRoute.id 
                    ? { ...route, status: route.efficiency > activationThreshold ? 'active' : 'inactive' }
                    : route
                )
              );
              
              if (newRoute.efficiency > activationThreshold) {
                setActiveRouteCount(prev => prev + 1);
                
                toast({
                  title: "New Route Discovered",
                  description: `Added ${newRoute.path.join(' → ')} path with ${newRoute.efficiency}% efficiency`,
                  variant: "default",
                });
              }
              
              // Notify parent component
              if (onPathUpdate) {
                onPathUpdate(availableRoutes.filter(r => r.status === 'active'));
              }
            }, 1500);
          }, 2000);
        }
      }
    }, intelligenceLevel === 'high' ? 6000 : intelligenceLevel === 'medium' ? 8000 : 10000);
    
    return () => clearInterval(interval);
  }, [isRunning, autoDiscover, maxComplexity, availableRoutes, toast, onPathUpdate, strategies, intelligenceLevel]);
  
  const toggleRouteStatus = (routeId: string) => {
    setAvailableRoutes(prev => 
      prev.map(route => {
        if (route.id === routeId) {
          const newStatus = route.status === 'active' ? 'inactive' : 'active';
          return { ...route, status: newStatus };
        }
        return route;
      })
    );
    
    const route = availableRoutes.find(r => r.id === routeId);
    if (route) {
      if (route.status === 'active') {
        setActiveRouteCount(prev => prev - 1);
      } else {
        setActiveRouteCount(prev => prev + 1);
      }
      
      toast({
        title: route.status === 'active' ? "Route Deactivated" : "Route Activated",
        description: `${route.path.join(' → ')} is now ${route.status === 'active' ? 'inactive' : 'active'}`,
        variant: "default",
      });
    }
    
    // Notify parent component
    if (onPathUpdate) {
      const updatedRoutes = availableRoutes.map(route => 
        route.id === routeId 
          ? { ...route, status: route.status === 'active' ? 'inactive' : 'active' } 
          : route
      );
      onPathUpdate(updatedRoutes.filter(r => r.status === 'active'));
    }
  };
  
  const handleOptimizationChange = (value: string) => {
    setRouteOptimizationLevel(value as 'standard' | 'aggressive' | 'maximum');
    
    toast({
      title: "Path Optimization Updated",
      description: `Path finding set to ${value} mode`,
      variant: "default",
    });
  };
  
  const handleAutoDiscoverToggle = (checked: boolean) => {
    setAutoDiscover(checked);
    
    toast({
      title: checked ? "Auto-discovery Enabled" : "Auto-discovery Disabled",
      description: checked 
        ? "New arbitrage paths will be automatically discovered" 
        : "Only using pre-defined arbitrage paths",
      variant: "default",
    });
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return "text-positive";
    if (efficiency >= 70) return "text-amber-500";
    return "text-muted-foreground";
  };
  
  const filteredRoutes = availableRoutes.filter(route => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return route.status === 'active';
    if (activeTab === 'inactive') return route.status === 'inactive';
    if (activeTab === 'simple') return route.complexity <= 1;
    if (activeTab === 'complex') return route.complexity > 1;
    return true;
  });
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitGraph className="h-5 w-5 text-highlight" />
              Smart Path Finder
            </CardTitle>
            <CardDescription>
              Rust-based optimal trading path discovery
            </CardDescription>
          </div>
          <Badge variant={isRunning && autoDiscover ? "default" : "secondary"}>
            {activeRouteCount} Active Route{activeRouteCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-3">
          <Label className="text-sm flex-1" htmlFor="auto-discover-toggle">
            Auto-Discover Routes
            <p className="text-xs text-muted-foreground mt-0.5">
              Dynamically find new profitable trading paths
            </p>
          </Label>
          <Switch 
            id="auto-discover-toggle"
            checked={autoDiscover}
            onCheckedChange={handleAutoDiscoverToggle}
            disabled={isRunning}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Optimization Level</Label>
          <Select 
            value={routeOptimizationLevel}
            onValueChange={handleOptimizationChange}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select optimization level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (Up to 3-hop)</SelectItem>
              <SelectItem value="aggressive">Aggressive (Up to 4-hop)</SelectItem>
              <SelectItem value="maximum">Maximum (Up to 5-hop)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {routeOptimizationLevel === 'standard' ? 'Balanced efficiency and complexity' : 
             routeOptimizationLevel === 'aggressive' ? 'Higher potential profit, more complexity' :
             'Maximum profit potential, highest computational cost'}
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
            <TabsTrigger value="active" className="flex-1 text-xs">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="flex-1 text-xs">Inactive</TabsTrigger>
            <TabsTrigger value="simple" className="flex-1 text-xs">Simple</TabsTrigger>
            <TabsTrigger value="complex" className="flex-1 text-xs">Complex</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-2">
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {filteredRoutes.length > 0 ? filteredRoutes.map(route => (
                <div 
                  key={route.id}
                  className={`p-2 rounded-md border ${
                    route.status === 'active' 
                      ? 'bg-primary/10 border-primary/30' 
                      : route.status === 'analyzing'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-secondary/50 border-border/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {route.status === 'analyzing' ? (
                        <BarChart2 className="h-4 w-4 text-amber-500" />
                      ) : route.status === 'active' ? (
                        <RouteIcon className="h-4 w-4 text-highlight" />
                      ) : (
                        <RouteIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex items-center text-sm">
                        {route.path.map((token, i) => (
                          <div key={i} className="flex items-center">
                            <span className={i === 0 || i === route.path.length - 1 ? "font-medium" : ""}>
                              {token}
                            </span>
                            {i < route.path.length - 1 && (
                              <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-secondary/70">
                        {route.complexity}-hop
                      </Badge>
                      
                      <div className={`text-sm ${getEfficiencyColor(route.efficiency)}`}>
                        {route.efficiency}%
                      </div>
                      
                      <Button
                        variant={route.status === 'active' ? "default" : "outline"}
                        size="sm"
                        className="h-7"
                        onClick={() => toggleRouteStatus(route.id)}
                        disabled={route.status === 'analyzing' || isRunning}
                      >
                        {route.status === 'active' ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-1 text-xs text-muted-foreground">
                    Expected profit: <span className="text-positive">${route.expectedProfit.toFixed(2)}</span> per 100 USDC
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No routes found matching the selected filter
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {isAnalyzing && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <Shuffle className="h-4 w-4 text-primary animate-spin" />
              <span>Analyzing new trading path...</span>
            </div>
          </div>
        )}
        
        {!isRunning && (
          <Button 
            variant="outline" 
            className="w-full gap-1.5"
            disabled={isAnalyzing}
            onClick={() => {
              toast({
                title: "Manual Route Search",
                description: "Scanning for new arbitrage paths",
              });
              setIsAnalyzing(true);
              setTimeout(() => setIsAnalyzing(false), 3000);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Discover New Routes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartPathFinder;
