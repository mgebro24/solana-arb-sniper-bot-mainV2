
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, BarChart2, XCircle, RefreshCw, Trash2, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemoryStats {
  used: number;
  total: number;
  cached: number;
  allocated: number;
}

interface RustMemoryManagerProps {
  isRunning: boolean;
}

const RustMemoryManager = ({ isRunning }: RustMemoryManagerProps) => {
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    used: 128,
    total: 512,
    cached: 64,
    allocated: 256
  });
  const [optimizationLevel, setOptimizationLevel] = useState<1 | 2 | 3>(2);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  // Simulate memory usage changes when bot is running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setMemoryStats(prev => {
        // Simulate memory fluctuation
        const usedDelta = Math.random() * 10 - 5; // -5 to +5
        const newUsed = Math.max(100, Math.min(400, prev.used + usedDelta));
        const newCached = Math.max(32, prev.cached + (Math.random() * 4 - 2));
        
        return {
          ...prev,
          used: newUsed,
          cached: newCached,
          allocated: newUsed + newCached
        };
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const handleOptimize = () => {
    setIsOptimizing(true);
    toast({
      title: "Memory Optimization Started",
      description: `Running level ${optimizationLevel} optimization`,
    });
    
    setTimeout(() => {
      setMemoryStats(prev => ({
        ...prev,
        used: prev.used * 0.7,
        cached: prev.cached * 0.5,
        allocated: prev.used * 0.7 + prev.cached * 0.5
      }));
      
      setIsOptimizing(false);
      toast({
        title: "Memory Optimization Complete",
        description: "Memory usage reduced by 30%",
        variant: "default",
      });
    }, 2500);
  };
  
  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "Memory cache has been released",
    });
    
    setMemoryStats(prev => ({
      ...prev,
      cached: 0,
      allocated: prev.used
    }));
  };
  
  const getMemoryUsageClass = (percentage: number) => {
    if (percentage < 50) return "text-positive";
    if (percentage < 75) return "text-amber-500";
    return "text-destructive";
  };
  
  const usagePercentage = (memoryStats.allocated / memoryStats.total) * 100;
  const memoryStatusClass = getMemoryUsageClass(usagePercentage);
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-highlight" />
              Rust Memory Manager
            </CardTitle>
            <CardDescription>
              Optimized memory allocation system
            </CardDescription>
          </div>
          <Badge variant="outline" className={`${memoryStatusClass} bg-secondary/50`}>
            {usagePercentage.toFixed(1)}% Used
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Memory Allocation</span>
            <span className={memoryStatusClass}>{memoryStats.allocated.toFixed(0)} MB / {memoryStats.total} MB</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 p-3 rounded-md space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                <span>Active Memory</span>
              </div>
              <span className={getMemoryUsageClass((memoryStats.used / memoryStats.total) * 100)}>
                {memoryStats.used.toFixed(0)} MB
              </span>
            </div>
            <Progress 
              value={(memoryStats.used / memoryStats.total) * 100} 
              className="h-1 bg-muted/30" 
            />
          </div>
          
          <div className="bg-secondary/30 p-3 rounded-md space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Cached Data</span>
              </div>
              <span>{memoryStats.cached.toFixed(0)} MB</span>
            </div>
            <Progress 
              value={(memoryStats.cached / memoryStats.total) * 100} 
              className="h-1 bg-muted/30" 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-muted/20 rounded-md p-2">
          <div className="text-sm">Optimization Level</div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(level => (
              <Button 
                key={level}
                variant={optimizationLevel === level ? "secondary" : "outline"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setOptimizationLevel(level as 1 | 2 | 3)}
                disabled={isOptimizing || isRunning}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="default" 
            className="w-full gap-1.5"
            onClick={handleOptimize}
            disabled={isOptimizing || isRunning}
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <HardDrive className="h-4 w-4" />
                Optimize Memory
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-1.5"
            onClick={handleClearCache}
            disabled={isOptimizing || isRunning || memoryStats.cached === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>
        
        {isRunning && (
          <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded border border-border/20">
            <div className="flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Memory optimization is disabled while bot is running</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RustMemoryManager;
