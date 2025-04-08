
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Network, GitBranch, Zap, Cog, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParallelExecutionEngineProps {
  isRunning: boolean;
  onEngineConfigChange?: (config: any) => void;
}

const ParallelExecutionEngine = ({ 
  isRunning,
  onEngineConfigChange
}: ParallelExecutionEngineProps) => {
  const [threads, setThreads] = useState(4);
  const [activeThreads, setActiveThreads] = useState(0);
  const [executorMode, setExecutorMode] = useState<'standard' | 'aggressive' | 'conservative'>('standard');
  const [parallelizationEnabled, setParallelizationEnabled] = useState(true);
  const [threadLoads, setThreadLoads] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [taskQueue, setTaskQueue] = useState<{id: string, type: string, progress: number}[]>([]);
  const { toast } = useToast();

  // Simulate thread activity when bot is running
  useEffect(() => {
    if (!isRunning || !parallelizationEnabled) {
      setActiveThreads(0);
      setThreadLoads(Array(8).fill(0));
      return;
    }
    
    // Simulate active threads based on current config
    setActiveThreads(Math.min(threads, 8));
    
    const interval = setInterval(() => {
      // Update thread loads
      setThreadLoads(prev => 
        prev.map((load, i) => {
          if (i < threads) {
            // For active threads, fluctuate the load
            const delta = Math.random() * 20 - 10; // -10 to +10
            return Math.max(30, Math.min(95, load + delta));
          }
          return 0; // Inactive threads have 0 load
        })
      );
      
      // Randomly add or complete tasks
      setTaskQueue(prev => {
        const newTasks = [...prev];
        
        // Chance to add a new task
        if (Math.random() > 0.7 && newTasks.length < threads * 2) {
          const taskTypes = ['price_check', 'opportunity_eval', 'tx_prep', 'execution'];
          newTasks.push({
            id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
            progress: 0
          });
        }
        
        // Update progress of existing tasks
        return newTasks.map(task => {
          const progressDelta = Math.random() * 15 + 5; // 5 to 20
          const newProgress = task.progress + progressDelta;
          
          if (newProgress >= 100) {
            // Task completed, 50% chance to remove it
            return Math.random() > 0.5 ? null : { ...task, progress: 0 };
          }
          
          return { ...task, progress: newProgress };
        }).filter(Boolean) as typeof newTasks;
      });
      
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, threads, parallelizationEnabled]);

  // Notify parent component when configuration changes
  useEffect(() => {
    if (onEngineConfigChange) {
      onEngineConfigChange({
        threads,
        executorMode,
        parallelizationEnabled
      });
    }
  }, [threads, executorMode, parallelizationEnabled, onEngineConfigChange]);
  
  const handleThreadChange = (value: number[]) => {
    const newThreadCount = value[0];
    setThreads(newThreadCount);
    
    toast({
      title: "Thread Count Updated",
      description: `Execution engine now using ${newThreadCount} threads`,
      variant: "default",
    });
  };
  
  const handleModeChange = (value: string) => {
    setExecutorMode(value as 'standard' | 'aggressive' | 'conservative');
    
    toast({
      title: "Execution Mode Changed",
      description: `Engine mode set to ${value}`,
      variant: "default",
    });
  };
  
  const handleParallelToggle = (checked: boolean) => {
    setParallelizationEnabled(checked);
    
    toast({
      title: checked ? "Parallelization Enabled" : "Parallelization Disabled",
      description: checked 
        ? "Tasks will be executed in parallel for maximum throughput" 
        : "Tasks will be executed sequentially for reliability",
      variant: "default",
    });
  };
  
  const getLoadColor = (load: number) => {
    if (load < 50) return "bg-positive";
    if (load < 80) return "bg-amber-500";
    return "bg-destructive";
  };
  
  const getExecutorModeDescription = () => {
    switch (executorMode) {
      case 'aggressive':
        return "Maximizes throughput, higher resource usage";
      case 'conservative':
        return "Prioritizes stability, lower resource usage";
      default:
        return "Balanced performance and resource usage";
    }
  };
  
  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-highlight" />
              Parallel Execution Engine
            </CardTitle>
            <CardDescription>
              Rust-inspired multi-threaded task execution
            </CardDescription>
          </div>
          <Badge variant={parallelizationEnabled ? "default" : "secondary"}>
            {parallelizationEnabled 
              ? `${activeThreads} Active Threads` 
              : "Sequential Mode"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">Worker Threads</div>
            <div className="text-sm font-medium">{threads}</div>
          </div>
          <Slider 
            value={[threads]}
            min={1}
            max={8}
            step={1}
            onValueChange={handleThreadChange}
            disabled={isRunning}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min (1)</span>
            <span>Max (8)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between space-x-3">
          <Label htmlFor="parallelization-toggle" className="text-sm flex-1">
            Enable Parallelization
          </Label>
          <Switch
            id="parallelization-toggle"
            checked={parallelizationEnabled}
            onCheckedChange={handleParallelToggle}
            disabled={isRunning}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="executor-mode" className="text-sm">Executor Mode</Label>
          <Select 
            value={executorMode}
            onValueChange={handleModeChange}
            disabled={isRunning}
          >
            <SelectTrigger id="executor-mode" className="w-full">
              <SelectValue placeholder="Select execution mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{getExecutorModeDescription()}</p>
        </div>
        
        {parallelizationEnabled && (
          <div className="border border-border/20 rounded-md p-3 bg-secondary/30">
            <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              Thread Utilization
            </div>
            <div className="space-y-1.5">
              {threadLoads.slice(0, threads).map((load, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Thread {index + 1}</span>
                    <span className={load > 80 ? "text-destructive" : ""}>{load.toFixed(0)}%</span>
                  </div>
                  <Progress value={load} className={`h-1.5 ${getLoadColor(load)}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {taskQueue.length > 0 && (
          <div className="border border-border/20 rounded-md p-3 bg-secondary/30">
            <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Active Tasks ({taskQueue.length})
            </div>
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
              {taskQueue.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <div className="w-24 truncate">{task.type}</div>
                  <Progress value={task.progress} className="h-1.5 flex-1" />
                  <div className="w-8 text-right">{task.progress.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isRunning && (
          <div className="flex items-center gap-2 text-positive text-xs">
            <Zap className="h-3.5 w-3.5" />
            <span>
              Engine running with {executorMode} mode, 
              {parallelizationEnabled ? ` ${activeThreads} active threads` : " sequential execution"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParallelExecutionEngine;
