
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { monitorMempool } from "@/services/priceService";
import { Activity, Box, Cpu, Waves } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const NetworkStatus = () => {
  const [networkData, setNetworkData] = useState({
    pendingTransactions: 0,
    largeSwaps: 0,
    congestionLevel: "medium" as "low" | "medium" | "high"
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const data = await monitorMempool();
        setNetworkData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch network data", error);
      }
    };
    
    fetchNetworkData();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchNetworkData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const getCongestionColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-500";
      case "medium": return "text-amber-500";
      case "high": return "text-red-500";
      default: return "text-gray-500";
    }
  };
  
  const getCongestionProgress = (level: string) => {
    switch (level) {
      case "low": return 25;
      case "medium": return 60;
      case "high": return 90;
      default: return 50;
    }
  };
  
  const getBadgeVariant = (level: string) => {
    switch (level) {
      case "low": 
        return "bg-green-500/20 text-green-500 border-green-500/40";
      case "medium": 
        return "bg-amber-500/20 text-amber-500 border-amber-500/40";
      case "high": 
        return "bg-destructive/20 text-destructive border-destructive/40";
      default: 
        return "";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-highlight" />
          Network Status
        </CardTitle>
        <CardDescription>
          Real-time Solana network metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Cpu className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Congestion</span>
                <Badge className={getBadgeVariant(networkData.congestionLevel)} variant="outline">
                  {networkData.congestionLevel.toUpperCase()}
                </Badge>
              </div>
              <Progress 
                value={getCongestionProgress(networkData.congestionLevel)} 
                className={`h-2 ${getCongestionColor(networkData.congestionLevel)}`} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary p-3 rounded-md flex flex-col">
                <div className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5" />
                  Pending Transactions
                </div>
                <div className="text-lg font-medium">
                  {networkData.pendingTransactions.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-secondary p-3 rounded-md flex flex-col">
                <div className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5" />
                  Large Swaps
                </div>
                <div className="text-lg font-medium">
                  {networkData.largeSwaps}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2 flex items-center justify-between">
              <span>Auto-updates every 10s</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight"></span>
                </span>
                <span>Live</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkStatus;
