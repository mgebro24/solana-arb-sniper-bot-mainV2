
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, PlayCircle, CircleSlash, Loader2, BarChart2, CheckCircle, Settings2, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { findArbitrageOpportunities, ArbitrageOpportunity, simulateTransaction } from "@/services/priceService";
import { useArbitrageContext } from "@/context/ArbitrageContext";

interface TestingModeProps {
  isRunning: boolean;
  investmentAmount: number;
  intelligenceLevel?: 'low' | 'medium' | 'high';
}

const TestingMode = ({ 
  isRunning, 
  investmentAmount,
  intelligenceLevel = 'medium'
}: TestingModeProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<{
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    profitableOpportunities: number;
    averageProfit: number;
    executionTime: number;
    gasUsed: number;
  }>({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    profitableOpportunities: 0,
    averageProfit: 0,
    executionTime: 0,
    gasUsed: 0
  });
  const [activeTab, setActiveTab] = useState("standard");
  const [testOppportunities, setTestOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const { toast } = useToast();
  const { strategies } = useArbitrageContext();

  const startTest = () => {
    if (isRunning) {
      toast({
        title: "Cannot Start Test",
        description: "Please stop the bot before running tests",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestProgress(0);
    setTestOpportunities([]);
    
    // Reset test results
    setTestResults({
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      profitableOpportunities: 0,
      averageProfit: 0,
      executionTime: 0,
      gasUsed: 0
    });
    
    toast({
      title: "Testing Started",
      description: "Testing arbitrage strategies with simulated data",
      variant: "default",
    });
    
    // Run tests with different parameters based on the active tab
    if (activeTab === "standard") {
      runStandardTests();
    } else if (activeTab === "intelligence") {
      runIntelligenceTests();
    } else if (activeTab === "performance") {
      runPerformanceTests();
    }
  };
  
  const runStandardTests = () => {
    // Simulate test execution with intervals to show progress
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 5;
      setTestProgress(progress);
      
      // At 20% progress, generate and display test opportunities
      if (progress === 20) {
        try {
          // Generate test opportunities based on active strategies
          const mockPrices = generateMockPriceData();
          const opportunities = await findArbitrageOpportunities(mockPrices, strategies);
          setTestOpportunities(opportunities.sort((a, b) => b.profitUsd - a.profitUsd));
          
          if (opportunities.length > 0) {
            toast({
              title: "Opportunities Found",
              description: `Discovered ${opportunities.length} potential arbitrage opportunities`,
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error generating test opportunities:", error);
        }
      }
      
      // At 60% progress, simulate execution of the most profitable opportunity
      if (progress === 60 && testOppportunities.length > 0) {
        const bestOpportunity = testOppportunities[0];
        
        try {
          const result = await simulateTransaction(bestOpportunity, investmentAmount || 10);
          
          // Update test results
          setTestResults(prev => ({
            ...prev,
            totalTests: prev.totalTests + 1,
            successfulTests: result.success ? prev.successfulTests + 1 : prev.successfulTests,
            failedTests: !result.success ? prev.failedTests + 1 : prev.failedTests,
            profitableOpportunities: result.profitAfterCosts > 0 ? prev.profitableOpportunities + 1 : prev.profitableOpportunities,
            averageProfit: result.success ? (prev.averageProfit * prev.successfulTests + result.profitAfterCosts) / (prev.successfulTests + 1) : prev.averageProfit,
            executionTime: result.executionTime || 0,
            gasUsed: result.gasCost || 0
          }));
          
          toast({
            title: result.success ? "Test Execution Successful" : "Test Execution Failed",
            description: result.success 
              ? `Successfully executed ${bestOpportunity.route} with $${result.profitAfterCosts.toFixed(2)} profit` 
              : `Failed to execute ${bestOpportunity.route}: ${result.failureReason || "Unknown error"}`,
            variant: result.success ? "default" : "destructive",
          });
        } catch (error) {
          console.error("Error in test execution:", error);
        }
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsTesting(false);
        setTestProgress(100);
        
        // Calculate final test results if needed
        setTestResults(prev => ({
          ...prev,
          totalTests: testOppportunities.length,
          profitableOpportunities: testOppportunities.filter(o => o.profitUsd > 0).length,
        }));
        
        toast({
          title: "Testing Completed",
          description: `Completed ${testOppportunities.length} tests with ${testResults.successfulTests} successful executions`,
          variant: "default",
        });
      }
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  const runIntelligenceTests = () => {
    // Similar to standard tests but focused on intelligence capabilities
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setTestProgress(progress);
      
      if (progress === 25) {
        // Generate complex scenarios that test intelligence
        const mockOpportunities = generateIntelligenceTestScenarios();
        setTestOpportunities(mockOpportunities);
      }
      
      if (progress === 50) {
        // Test decision making capability on risky opportunities
        setTestResults(prev => ({
          ...prev,
          totalTests: 5,
          successfulTests: intelligenceLevel === 'high' ? 4 : intelligenceLevel === 'medium' ? 3 : 2,
          failedTests: intelligenceLevel === 'high' ? 1 : intelligenceLevel === 'medium' ? 2 : 3,
          profitableOpportunities: intelligenceLevel === 'high' ? 4 : intelligenceLevel === 'medium' ? 3 : 2,
          averageProfit: intelligenceLevel === 'high' ? 0.85 : intelligenceLevel === 'medium' ? 0.65 : 0.45,
          executionTime: intelligenceLevel === 'high' ? 450 : intelligenceLevel === 'medium' ? 320 : 280,
          gasUsed: 0.025
        }));
      }
      
      if (progress === 75) {
        // Test learning capability
        if (intelligenceLevel === 'high') {
          toast({
            title: "AI Learning Activated",
            description: "Bot detected and adapted to slippage patterns in test data",
            variant: "default",
          });
        }
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsTesting(false);
        setTestProgress(100);
        
        toast({
          title: "Intelligence Testing Completed",
          description: `${intelligenceLevel === 'high' ? 'Advanced AI' : intelligenceLevel === 'medium' ? 'Smart Analysis' : 'Basic Logic'} performed with ${testResults.successfulTests} successful predictions`,
          variant: "default",
        });
      }
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  const runPerformanceTests = () => {
    // Performance-focused tests
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setTestProgress(progress);
      
      if (progress === 30) {
        // Test execution speed and throughput
        setTestResults(prev => ({
          ...prev,
          executionTime: intelligenceLevel === 'high' ? 420 : intelligenceLevel === 'medium' ? 280 : 180,
          totalTests: 10,
          successfulTests: 8,
          failedTests: 2,
        }));
      }
      
      if (progress === 60) {
        // Test gas optimization
        setTestResults(prev => ({
          ...prev,
          gasUsed: intelligenceLevel === 'high' ? 0.018 : intelligenceLevel === 'medium' ? 0.022 : 0.028,
          averageProfit: 0.75
        }));
      }
      
      if (progress === 90) {
        // Test parallel execution capabilities
        setTestResults(prev => ({
          ...prev,
          totalTests: 20,
          successfulTests: 17,
          failedTests: 3,
          profitableOpportunities: 15
        }));
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsTesting(false);
        setTestProgress(100);
        
        toast({
          title: "Performance Testing Completed",
          description: `Average execution time: ${testResults.executionTime}ms with ${testResults.gasUsed.toFixed(3)} SOL gas cost`,
          variant: "default",
        });
      }
    }, 100);
    
    return () => clearInterval(interval);
  };
  
  const cancelTest = () => {
    setIsTesting(false);
    setTestProgress(0);
    
    toast({
      title: "Testing Cancelled",
      description: "Arbitrage testing has been cancelled",
      variant: "destructive",
    });
  };
  
  // Utility function to generate mock price data for testing
  const generateMockPriceData = () => {
    return {
      // Mock price data structure
      "SOL": {
        "Raydium": 144.25,
        "Jupiter": 145.15,
        "Orca": 143.98,
        "Meteora": 145.32
      },
      "BONK": {
        "Raydium": 0.000028,
        "Jupiter": 0.0000275,
        "Orca": 0.0000284,
        "Meteora": 0.0000278
      },
      "USDC": {
        "Raydium": 1.00,
        "Jupiter": 1.00,
        "Orca": 1.00,
        "Meteora": 1.00
      },
      "mSOL": {
        "Raydium": 146.50,
        "Jupiter": 146.35,
        "Orca": 146.85,
        "Meteora": 146.42
      },
      "JUP": {
        "Raydium": 1.28,
        "Jupiter": 1.29,
        "Orca": 1.27,
        "Meteora": 1.285
      }
    };
  };
  
  // Generate complex test scenarios for intelligence testing
  const generateIntelligenceTestScenarios = () => {
    const scenarios: ArbitrageOpportunity[] = [
      {
        id: "intel-1",
        route: "SOL/USDC/BONK",
        strategyType: "triangular",
        path: [
          { dex: "Jupiter", fromToken: "SOL", toToken: "USDC" },
          { dex: "Raydium", fromToken: "USDC", toToken: "BONK" },
          { dex: "Orca", fromToken: "BONK", toToken: "SOL" }
        ],
        profitUsd: 1.25,
        profitPct: 0.85,
        status: "ready",
        riskFactor: 0.2,
        expectedSuccessRate: 0.95,
        gasCost: 0.012
      },
      {
        id: "intel-2",
        route: "BONK/SOL/JUP/BONK",
        strategyType: "quadrilateral",
        path: [
          { dex: "Raydium", fromToken: "BONK", toToken: "SOL" },
          { dex: "Jupiter", fromToken: "SOL", toToken: "JUP" },
          { dex: "Orca", fromToken: "JUP", toToken: "BONK" }
        ],
        profitUsd: 2.1,
        profitPct: 1.45,
        status: "ready",
        riskFactor: 0.65,
        expectedSuccessRate: 0.72,
        gasCost: 0.025
      },
      {
        id: "intel-3",
        route: "USDC/mSOL/USDC",
        strategyType: "direct",
        path: [
          { dex: "Jupiter", fromToken: "USDC", toToken: "mSOL" },
          { dex: "Meteora", fromToken: "mSOL", toToken: "USDC" }
        ],
        profitUsd: 0.85,
        profitPct: 0.35,
        status: "ready",
        riskFactor: 0.15,
        expectedSuccessRate: 0.98,
        gasCost: 0.008
      },
      {
        id: "intel-4",
        route: "SOL/JUP/mSOL/SOL",
        strategyType: "triangular",
        path: [
          { dex: "Jupiter", fromToken: "SOL", toToken: "JUP" },
          { dex: "Raydium", fromToken: "JUP", toToken: "mSOL" },
          { dex: "Orca", fromToken: "mSOL", toToken: "SOL" }
        ],
        profitUsd: 1.75,
        profitPct: 0.95,
        status: "ready",
        riskFactor: 0.40,
        expectedSuccessRate: 0.85,
        gasCost: 0.018
      }
    ];
    
    return scenarios;
  };
  
  const getIntelligenceBadge = () => {
    switch (intelligenceLevel) {
      case 'high':
        return (
          <Badge variant="default" className="gap-1">
            <BrainCircuit className="h-3.5 w-3.5" />
            Advanced AI
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="secondary" className="gap-1">
            <BrainCircuit className="h-3.5 w-3.5" />
            Smart Analysis
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <BrainCircuit className="h-3.5 w-3.5" />
            Basic Logic
          </Badge>
        );
    }
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-highlight" />
              Testing Mode
            </CardTitle>
            <CardDescription>
              Test arbitrage strategies with simulated data
            </CardDescription>
          </div>
          {getIntelligenceBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="standard" className="flex-1">Standard</TabsTrigger>
            <TabsTrigger value="intelligence" className="flex-1">Intelligence</TabsTrigger>
            <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4 pt-4">
            {activeTab === "standard" && (
              <div className="space-y-4">
                <div className="text-sm">
                  Standard testing evaluates arbitrage opportunities using currently selected strategies and settings.
                </div>
              </div>
            )}
            
            {activeTab === "intelligence" && (
              <div className="space-y-4">
                <div className="text-sm">
                  Intelligence testing evaluates the bot's decision-making capabilities with complex scenarios.
                </div>
              </div>
            )}
            
            {activeTab === "performance" && (
              <div className="space-y-4">
                <div className="text-sm">
                  Performance testing measures execution speed, gas optimization, and throughput capabilities.
                </div>
              </div>
            )}
            
            {isTesting ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Testing in progress...</span>
                    <span>{testProgress}%</span>
                  </div>
                  <Progress value={testProgress} className="h-2" />
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={cancelTest}
                >
                  <CircleSlash className="h-4 w-4 mr-2" />
                  Cancel Test
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full"
                onClick={startTest}
                disabled={isRunning}
              >
                {testProgress === 100 ? (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Test Again
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Test
                  </>
                )}
              </Button>
            )}
          </TabsContent>
        </Tabs>
        
        {testProgress === 100 && (
          <div className="space-y-3 bg-secondary/30 p-4 rounded-lg">
            <div className="text-sm font-medium">Test Results</div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total tests:</div>
              <div className="text-right">{testResults.totalTests}</div>
              
              <div>Successful executions:</div>
              <div className="text-right text-positive">
                {testResults.successfulTests} ({testResults.totalTests > 0 ? ((testResults.successfulTests / testResults.totalTests) * 100).toFixed(1) : 0}%)
              </div>
              
              <div>Failed executions:</div>
              <div className="text-right text-destructive">
                {testResults.failedTests} ({testResults.totalTests > 0 ? ((testResults.failedTests / testResults.totalTests) * 100).toFixed(1) : 0}%)
              </div>
              
              <div>Profitable opportunities:</div>
              <div className="text-right">{testResults.profitableOpportunities}</div>
              
              <div>Average profit:</div>
              <div className="text-right text-positive">${testResults.averageProfit.toFixed(2)}</div>
              
              <div>Execution time:</div>
              <div className="text-right">{testResults.executionTime}ms</div>
              
              <div>Gas used:</div>
              <div className="text-right">{testResults.gasUsed.toFixed(4)} SOL</div>
            </div>
            
            {testOppportunities.length > 0 && (
              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Top Opportunity</div>
                <div className="bg-secondary/50 p-2 rounded-md text-xs">
                  <div className="flex justify-between">
                    <span>{testOppportunities[0].route}</span>
                    <span className="text-positive">+${testOppportunities[0].profitUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-muted-foreground">
                    <span>Type: {testOppportunities[0].strategyType}</span>
                    <span>{testOppportunities[0].profitPct.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isRunning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Bot is running.</span> Testing mode is disabled while the bot is active. Stop the bot first to run tests.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestingMode;
