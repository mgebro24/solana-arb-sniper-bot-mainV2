
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, CloudOff, Cpu, Play, Power, Settings, Zap, Shield, BarChart2, Wallet, Code, BookOpen, Database, Network } from "lucide-react";
import StatusIndicator from "./StatusIndicator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  isConnected: boolean;
  isRunning: boolean;
  onConnect: () => void;
  onToggleBot: () => void;
  onSettings: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Header = ({ 
  isConnected, 
  isRunning, 
  onConnect, 
  onToggleBot, 
  onSettings, 
  activeTab, 
  onTabChange 
}: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card py-3">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-highlight" />
          <h1 className="text-xl font-bold">Solana MEV Arbitrage Bot</h1>
          <div className="ml-6">
            <StatusIndicator isConnected={isConnected} isRunning={isRunning} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onTabChange && (
            <Tabs value={activeTab} onValueChange={onTabChange} className="mr-4">
              <TabsList className="bg-secondary/50 backdrop-blur-sm">
                <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs">
                  <BarChart2 className="h-3.5 w-3.5" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="bot" className="flex items-center gap-1.5 text-xs">
                  <Code className="h-3.5 w-3.5" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs">
                  <Database className="h-3.5 w-3.5" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="wallet" className="flex items-center gap-1.5 text-xs">
                  <Wallet className="h-3.5 w-3.5" />
                  Wallet
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-1.5 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  Testing
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  className="gap-1.5"
                  onClick={onConnect}
                >
                  {isConnected ? (
                    <>
                      <Cpu className="h-4 w-4" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="h-4 w-4" />
                      <span>Connect RPC</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isConnected 
                  ? "Connected to Solana RPC node" 
                  : "Connect to a Solana RPC node"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle 
                  pressed={isRunning} 
                  onPressedChange={onToggleBot}
                  className="gap-1.5"
                >
                  {isRunning ? (
                    <>
                      <Power className="h-4 w-4 text-positive" />
                      <span>Running</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </>
                  )}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {isRunning 
                  ? "Bot is actively searching for opportunities" 
                  : "Start the arbitrage bot"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="icon" onClick={onSettings}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
