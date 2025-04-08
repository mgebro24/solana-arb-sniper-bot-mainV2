
import { useState, useCallback } from "react";
import Dashboard from "@/components/Dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Globe, Shield, Zap, TrendingUp, BookOpen, Code, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const { toast } = useToast();
  
  // Simulate checking system requirements
  useState(() => {
    const timer = setTimeout(() => {
      setConnectionStatus('ready');
    }, 1500);
    return () => clearTimeout(timer);
  });
  
  const handleConnect = useCallback(() => {
    toast({
      title: "System Ready",
      description: "Arbitrage bot environment initialized successfully",
    });
    setShowDashboard(true);
  }, [toast]);
  
  if (showDashboard) {
    return <Dashboard />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="flex items-center justify-center mb-6">
        <Zap className="h-10 w-10 text-highlight mr-3" />
        <h1 className="text-3xl font-bold">Solana MEV Arbitrage Bot</h1>
      </div>
      
      <Card className="max-w-3xl w-full bg-card/95 backdrop-blur-sm border border-border/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-lg font-medium mb-2">
                <Shield className="h-5 w-5 text-highlight mr-2" />
                System Requirements
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${connectionStatus === 'ready' ? 'bg-positive' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm">WebSocket Connection</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${connectionStatus === 'ready' ? 'bg-positive' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm">Browser Compatibility</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${connectionStatus === 'ready' ? 'bg-positive' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm">System Resources</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${connectionStatus === 'ready' ? 'bg-positive' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm">Network Latency</span>
                </div>
              </div>
              
              <Button 
                onClick={handleConnect}
                className="w-full mt-4"
                disabled={connectionStatus !== 'ready'}
              >
                {connectionStatus === 'ready' ? (
                  <>
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Checking Environment...
                    <div className="ml-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <div className="flex items-center text-lg font-medium mb-2">
                <Globe className="h-5 w-5 text-highlight mr-2" />
                Bot Features
              </div>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-highlight mr-2 mt-0.5" />
                  <span>Multi-DEX arbitrage detection across Solana ecosystem</span>
                </li>
                <li className="flex items-start">
                  <Database className="h-4 w-4 text-highlight mr-2 mt-0.5" />
                  <span>Liquidity pool monitoring with threshold alerts</span>
                </li>
                <li className="flex items-start">
                  <Code className="h-4 w-4 text-highlight mr-2 mt-0.5" />
                  <span>Rust-inspired optimization for lightning-fast execution</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-4 w-4 text-highlight mr-2 mt-0.5" />
                  <span>Risk management system with automatic position sizing</span>
                </li>
                <li className="flex items-start">
                  <Cpu className="h-4 w-4 text-highlight mr-2 mt-0.5" />
                  <span>Parallel transaction processing for maximum throughput</span>
                </li>
                <li className="flex items-start">
                  <BookOpen className="h-4 w-4 text-highlight mr-2 mt-0.5" />
                  <span>Advanced analytics and performance metrics dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
