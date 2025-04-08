
import { useState, useEffect } from "react";
import Header from "./Header";
import PriceComparisonTable from "./PriceComparisonTable";
import ArbitrageOpportunities from "./ArbitrageOpportunities";
import TokenPairSelector from "./TokenPairSelector";
import DexSelector from "./DexSelector";
import SimulationPanel from "./SimulationPanel";
import BotControls from "./BotControls";
import NetworkStatus from "./NetworkStatus";
import BotStatistics from "./BotStatistics";
import InvestmentPanel from "./InvestmentPanel";
import ArbitrageHistory from "./ArbitrageHistory";
import BotBuilder from "./BotBuilder";
import PortfolioManager from "./PortfolioManager";
import PairScanner from "./PairScanner";
import TransactionLogs from "./TransactionLogs";
import TradingRules from "./TradingRules";
import PerformanceMetrics from "./PerformanceMetrics";
import QuickTrade from "./QuickTrade";
import WalletMonitor from "./WalletMonitor";
import TestingMode from "./TestingMode";
import LiquidityMonitor from "./LiquidityMonitor";
import RustMemoryManager from "./RustMemoryManager";
import ParallelExecutionEngine from "./ParallelExecutionEngine";
import FeeOptimizer from "./FeeOptimizer";
import SmartPathFinder from "./SmartPathFinder";
import RiskManager from "./RiskManager";
import BacktestingEngine from "./BacktestingEngine";
import SlippageOptimizer from "./SlippageOptimizer";
import BlockchainMonitor from "./BlockchainMonitor";
import BotIntelligence from "./BotIntelligence";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp } from "lucide-react";
import { ArbitrageProvider, useArbitrageContext } from "@/context/ArbitrageContext";

const DashboardContent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [maxInvestmentPerTrade, setMaxInvestmentPerTrade] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { toast } = useToast();
  const { strategies, setStrategies, intelligenceLevel, setIntelligenceLevel } = useArbitrageContext();

  // Simulate RPC connection on component mount
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      if (!isConnected) {
        handleConnect();
      }
    }, 1500);
    
    return () => clearTimeout(connectTimeout);
  }, []);
  
  const handleConnect = () => {
    setIsConnected(prev => !prev);
    if (!isConnected) {
      // Generate a mock wallet address when connecting
      setWalletAddress("7uYSM9XGxLJU1XwhjVPuQdGtS5SSdkWSrce4HwyVae42");
    } else {
      setWalletAddress("");
    }
    
    toast({
      title: isConnected ? "Disconnected from RPC" : "Connected to RPC",
      description: isConnected 
        ? "Your connection to the Solana RPC node has been closed." 
        : "Successfully connected to Solana RPC node.",
      variant: isConnected ? "destructive" : "default",
    });
  };
  
  const handleToggleBot = () => {
    if (!isConnected) {
      toast({
        title: "Cannot Start Bot",
        description: "Please connect to RPC node first",
        variant: "destructive",
      });
      return;
    }

    if (investmentAmount <= 0 && !isRunning) {
      toast({
        title: "Cannot Start Bot",
        description: "Please set investment amount first",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(prev => !prev);
    toast({
      title: isRunning ? "Bot Stopped" : "Bot Started",
      description: isRunning 
        ? "The arbitrage bot has been stopped." 
        : `The arbitrage bot is now running with ${intelligenceLevel} intelligence level and searching for opportunities.`,
      variant: "default",
    });
  };
  
  const handleSettings = () => {
    setIsAutoRefresh(prev => !prev);
    toast({
      title: isAutoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled", 
      description: isAutoRefresh 
        ? "Price updates have been paused." 
        : "Price updates will refresh automatically.",
      variant: "default",
    });
  };

  const handleInvestmentChange = (amount: number) => {
    setInvestmentAmount(amount);
    toast({
      title: "Investment Amount Updated",
      description: `Your investment amount has been set to ${amount} SOL`,
      variant: "default",
    });
  };

  const handleMaxPerTradeChange = (amount: number) => {
    setMaxInvestmentPerTrade(amount);
  };

  const handleStrategyChange = (newStrategies: {
    direct: boolean;
    triangular: boolean;
    quadrilateral: boolean;
  }) => {
    // Update strategies in context - this will automatically propagate to other components
    setStrategies(newStrategies);
    
    const enabledStrategies = Object.entries(newStrategies)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([name]) => name);
    
    toast({
      title: "Arbitrage Strategies Updated",
      description: `Active strategies: ${enabledStrategies.join(', ')}`,
      variant: "default",
    });
  };
  
  const handleBotParameterChange = (parameters: any) => {
    // Handle bot parameters from BotBuilder component
    console.log("Bot parameters updated:", parameters);
    
    // Update intelligence level if present in parameters
    if (parameters.intelligenceLevel) {
      setIntelligenceLevel(parameters.intelligenceLevel);
    }
    
    toast({
      title: "Bot Parameters Updated",
      description: "Bot configuration has been updated successfully",
      variant: "default",
    });
  };
  
  const handleQuickTradeExecuted = (result: any) => {
    toast({
      title: "Trade Executed Successfully",
      description: `${result.pair} trade completed with ${result.profit.toFixed(3)} SOL profit`,
      variant: "default",
    });
  };
  
  const handleIntelligenceLevelChange = (level: 'low' | 'medium' | 'high') => {
    setIntelligenceLevel(level);
    
    toast({
      title: "Bot Intelligence Updated",
      description: `Intelligence level set to ${level}`,
      variant: "default",
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <Header 
        isConnected={isConnected} 
        isRunning={isRunning}
        onConnect={handleConnect}
        onToggleBot={handleToggleBot}
        onSettings={handleSettings}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        intelligenceLevel={intelligenceLevel}
      />
      
      <main className="flex-1 container py-6 space-y-6">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Main Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Tabs defaultValue="prices" className="space-y-4">
                  <TabsList className="bg-secondary/50 backdrop-blur-sm">
                    <TabsTrigger value="prices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Price Comparison
                    </TabsTrigger>
                    <TabsTrigger value="arbitrage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Arbitrage Opportunities
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      History
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Statistics
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Logs
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="prices" className="space-y-4">
                    <PriceComparisonTable autoRefresh={isAutoRefresh} />
                  </TabsContent>
                  
                  <TabsContent value="arbitrage" className="space-y-4">
                    <ArbitrageOpportunities 
                      autoRefresh={isAutoRefresh} 
                      isRunning={isRunning}
                      investmentAmount={investmentAmount}
                      maxInvestmentPerTrade={maxInvestmentPerTrade}
                    />
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <ArbitrageHistory />
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-4">
                    <BotStatistics investmentAmount={investmentAmount} />
                  </TabsContent>
                  
                  <TabsContent value="logs" className="space-y-4">
                    <TransactionLogs isRunning={isRunning} />
                  </TabsContent>
                </Tabs>
              </div>
              <div>
                <div className="space-y-6">
                  <InvestmentPanel 
                    onInvestmentChange={handleInvestmentChange}
                    onMaxPerTradeChange={handleMaxPerTradeChange}
                    onStrategyChange={handleStrategyChange}
                    initialInvestment={investmentAmount}
                    initialMaxPerTrade={maxInvestmentPerTrade}
                    initialStrategies={strategies}
                    isRunning={isRunning}
                  />
                  
                  <BotIntelligence
                    intelligenceLevel={intelligenceLevel}
                    onIntelligenceLevelChange={handleIntelligenceLevelChange}
                    isRunning={isRunning}
                  />
                  
                  <QuickTrade 
                    isConnected={isConnected}
                    isRunning={isRunning}
                    onTradeExecuted={handleQuickTradeExecuted}
                  />
                  <BlockchainMonitor 
                    isConnected={isConnected}
                    isRunning={isRunning}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Bot Builder Tab */}
          <TabsContent value="bot" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <BotBuilder 
                  onParameterChange={handleBotParameterChange}
                  onStrategyChange={handleStrategyChange}
                  isRunning={isRunning}
                  initialStrategies={strategies}
                  intelligenceLevel={intelligenceLevel}
                  onIntelligenceLevelChange={handleIntelligenceLevelChange}
                />
              </div>
              <div>
                <SmartPathFinder 
                  isRunning={isRunning}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <PairScanner isRunning={isRunning} />
              </div>
              <div>
                <SlippageOptimizer isRunning={isRunning} />
              </div>
              <div>
                <FeeOptimizer isRunning={isRunning} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <TradingRules isRunning={isRunning} />
              </div>
              <div>
                <RiskManager 
                  isRunning={isRunning}
                  investmentAmount={investmentAmount}
                />
              </div>
              <div>
                <RustMemoryManager isRunning={isRunning} />
              </div>
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <PerformanceMetrics investmentAmount={investmentAmount} isRunning={isRunning} />
              </div>
              <div>
                <ParallelExecutionEngine isRunning={isRunning} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <BacktestingEngine isRunning={isRunning} />
              </div>
              <div>
                <LiquidityMonitor isRunning={isRunning} autoRefresh={isAutoRefresh} />
              </div>
            </div>
          </TabsContent>
          
          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WalletMonitor isConnected={isConnected} walletAddress={walletAddress} />
              <PortfolioManager 
                investmentAmount={investmentAmount} 
                isConnected={isConnected}
                isRunning={isRunning}
              />
            </div>
          </TabsContent>
          
          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <TestingMode 
                isRunning={isRunning} 
                investmentAmount={investmentAmount} 
                intelligenceLevel={intelligenceLevel}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TokenPairSelector />
                <DexSelector />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {isRunning && (
        <div className="fixed bottom-4 right-4 animate-bounce">
          <Badge className="py-2 px-3 flex items-center gap-2 bg-positive text-positive-foreground">
            <TrendingUp className="h-4 w-4" />
            Bot Active - {intelligenceLevel === 'high' ? 'AI' : intelligenceLevel === 'medium' ? 'Smart' : 'Basic'} Mode
          </Badge>
        </div>
      )}
      
      {!isConnected && (
        <div className="fixed bottom-4 left-4">
          <Badge className="py-2 px-3 flex items-center gap-2 bg-destructive text-destructive-foreground">
            <AlertCircle className="h-4 w-4" />
            Not Connected to RPC
          </Badge>
        </div>
      )}
    </div>
  );
};

// Wrap the main component with the ArbitrageProvider
const Dashboard = () => (
  <ArbitrageProvider>
    <DashboardContent />
  </ArbitrageProvider>
);

export default Dashboard;
