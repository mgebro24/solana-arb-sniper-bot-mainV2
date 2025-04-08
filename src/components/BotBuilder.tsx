
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings, Code, Bot, Brain, PencilRuler, Wrench, AlertCircle, Tv2, 
  Cpu, Gauge, Download, Save, RotateCw, Timer, Wallet, Zap 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BotTemplate {
  name: string;
  description: string;
  parameters: {
    tradingInterval: number;
    profitThreshold: number;
    slippageTolerance: number;
    priorityFee: string;
    maxTransactionsPerHour: number;
    autoRebalance: boolean;
    failsafeMode: boolean;
  };
  strategies: {
    direct: boolean;
    triangular: boolean;
    quadrilateral: boolean;
  };
}

const predefinedTemplates: BotTemplate[] = [
  {
    name: "Conservative",
    description: "Slower trading with lower risk",
    parameters: {
      tradingInterval: 60000,
      profitThreshold: 0.5,
      slippageTolerance: 0.3,
      priorityFee: "low",
      maxTransactionsPerHour: 5,
      autoRebalance: true,
      failsafeMode: true
    },
    strategies: {
      direct: true,
      triangular: false,
      quadrilateral: false
    }
  },
  {
    name: "Balanced",
    description: "Moderate risk and trading frequency",
    parameters: {
      tradingInterval: 30000,
      profitThreshold: 0.25,
      slippageTolerance: 0.5,
      priorityFee: "dynamic",
      maxTransactionsPerHour: 15,
      autoRebalance: true,
      failsafeMode: true
    },
    strategies: {
      direct: true,
      triangular: true,
      quadrilateral: false
    }
  },
  {
    name: "Aggressive",
    description: "High frequency trading with higher risk",
    parameters: {
      tradingInterval: 10000,
      profitThreshold: 0.1,
      slippageTolerance: 1.0,
      priorityFee: "high",
      maxTransactionsPerHour: 30,
      autoRebalance: true,
      failsafeMode: false
    },
    strategies: {
      direct: true,
      triangular: true,
      quadrilateral: true
    }
  }
];

interface BotBuilderProps {
  onParameterChange?: (parameters: any) => void;
  onStrategyChange?: (strategies: any) => void;
  isRunning?: boolean;
}

const BotBuilder = ({ onParameterChange, onStrategyChange, isRunning = false }: BotBuilderProps) => {
  const [currentTemplate, setCurrentTemplate] = useState<BotTemplate | null>(null);
  const [botName, setBotName] = useState("My Arbitrage Bot");
  const [parameters, setParameters] = useState({
    tradingInterval: 30000, // ms
    profitThreshold: 0.25, // %
    slippageTolerance: 0.5, // %
    priorityFee: "dynamic",
    maxTransactionsPerHour: 15,
    autoRebalance: true,
    failsafeMode: true,
  });
  const [strategies, setStrategies] = useState({
    direct: true,
    triangular: true,
    quadrilateral: false,
  });
  const [advancedMode, setAdvancedMode] = useState(false);
  const { toast } = useToast();

  const handleApplyTemplate = (template: BotTemplate) => {
    setCurrentTemplate(template);
    setParameters(template.parameters);
    setStrategies(template.strategies);
    
    if (onParameterChange) onParameterChange(template.parameters);
    if (onStrategyChange) onStrategyChange(template.strategies);

    toast({
      title: "Template Applied",
      description: `Applied the ${template.name} bot template`,
      variant: "default",
    });
  };

  const handleParameterChange = (key: string, value: any) => {
    const newParameters = { ...parameters, [key]: value };
    setParameters(newParameters);
    if (onParameterChange) onParameterChange(newParameters);
    
    // Check if we're still matching a template
    setCurrentTemplate(null);
  };

  const handleStrategyChange = (key: string, value: boolean) => {
    const newStrategies = { ...strategies, [key]: value };
    setStrategies(newStrategies);
    if (onStrategyChange) onStrategyChange(newStrategies);
    
    // Check if we're still matching a template
    setCurrentTemplate(null);
  };

  const handleSaveConfiguration = () => {
    // Save the configuration to local storage
    const config = {
      botName,
      parameters,
      strategies
    };
    localStorage.setItem("botConfig", JSON.stringify(config));
    
    toast({
      title: "Configuration Saved",
      description: "Your bot configuration has been saved",
      variant: "default",
    });
  };

  const handleExportConfiguration = () => {
    // Export the configuration as a JSON file
    const config = {
      botName,
      parameters,
      strategies,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${botName.replace(/\s+/g, "_").toLowerCase()}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Exported",
      description: "Your bot configuration has been exported as JSON",
      variant: "default",
    });
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-highlight" />
              Bot Builder
            </CardTitle>
            <CardDescription>
              Configure and optimize your arbitrage bot
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="advanced-mode"
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
            <Label htmlFor="advanced-mode" className="text-sm">Advanced Mode</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="templates">
          <TabsList className="w-full">
            <TabsTrigger value="templates" className="flex-1">
              <PencilRuler className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Parameters
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex-1">
              <Brain className="h-4 w-4 mr-2" />
              Strategies
            </TabsTrigger>
            {advancedMode && (
              <TabsTrigger value="code" className="flex-1">
                <Code className="h-4 w-4 mr-2" />
                Custom Code
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Bot Name</div>
              <Input 
                placeholder="Enter bot name"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                disabled={isRunning}
                className="w-full"
              />
            </div>
            
            <div className="text-sm font-medium mb-2">Predefined Templates</div>
            <div className="grid grid-cols-1 gap-4">
              {predefinedTemplates.map((template, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    currentTemplate?.name === template.name 
                      ? "bg-primary/10 border-primary/50" 
                      : "bg-secondary/50 border-border/20 hover:border-border/50"
                  }`}
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{template.name}</div>
                    {currentTemplate?.name === template.name && (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Threshold:</span>
                      <span>{template.parameters.profitThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trading Interval:</span>
                      <span>{template.parameters.tradingInterval / 1000}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strategies:</span>
                      <span>
                        {Object.entries(template.strategies)
                          .filter(([_, enabled]) => enabled)
                          .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
                          .join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <span>
                        {template.name === "Conservative" && "Low"}
                        {template.name === "Balanced" && "Medium"}
                        {template.name === "Aggressive" && "High"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Timer className="h-4 w-4 mr-2" />
                    Trading Interval (ms)
                  </Label>
                  <span className="text-sm">{parameters.tradingInterval} ms</span>
                </div>
                <Slider
                  value={[parameters.tradingInterval]}
                  onValueChange={(values) => handleParameterChange("tradingInterval", values[0])}
                  min={1000}
                  max={120000}
                  step={1000}
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <div>1s</div>
                  <div>120s</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Gauge className="h-4 w-4 mr-2" />
                    Profit Threshold (%)
                  </Label>
                  <span className="text-sm">{parameters.profitThreshold}%</span>
                </div>
                <Slider
                  value={[parameters.profitThreshold]}
                  onValueChange={(values) => handleParameterChange("profitThreshold", values[0])}
                  min={0.05}
                  max={2}
                  step={0.05}
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <div>0.05%</div>
                  <div>2%</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    Slippage Tolerance (%)
                  </Label>
                  <span className="text-sm">{parameters.slippageTolerance}%</span>
                </div>
                <Slider
                  value={[parameters.slippageTolerance]}
                  onValueChange={(values) => handleParameterChange("slippageTolerance", values[0])}
                  min={0.1}
                  max={2}
                  step={0.1}
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <div>0.1%</div>
                  <div>2%</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Priority Fee
                  </Label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={parameters.priorityFee === "low" ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => handleParameterChange("priorityFee", "low")}
                    disabled={isRunning}
                  >
                    Low
                  </Button>
                  <Button
                    size="sm"
                    variant={parameters.priorityFee === "dynamic" ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => handleParameterChange("priorityFee", "dynamic")}
                    disabled={isRunning}
                  >
                    Dynamic
                  </Button>
                  <Button
                    size="sm"
                    variant={parameters.priorityFee === "high" ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => handleParameterChange("priorityFee", "high")}
                    disabled={isRunning}
                  >
                    High
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Cpu className="h-4 w-4 mr-2" />
                    Max Transactions Per Hour
                  </Label>
                  <span className="text-sm">{parameters.maxTransactionsPerHour}</span>
                </div>
                <Slider
                  value={[parameters.maxTransactionsPerHour]}
                  onValueChange={(values) => handleParameterChange("maxTransactionsPerHour", values[0])}
                  min={1}
                  max={60}
                  step={1}
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <div>1</div>
                  <div>60</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                <div className="flex items-center">
                  <RotateCw className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Label htmlFor="auto-rebalance" className="text-sm cursor-pointer">
                    Auto-rebalance Portfolio
                  </Label>
                </div>
                <Switch 
                  id="auto-rebalance"
                  checked={parameters.autoRebalance}
                  onCheckedChange={(checked) => handleParameterChange("autoRebalance", checked)}
                  disabled={isRunning}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Label htmlFor="failsafe-mode" className="text-sm cursor-pointer">
                    Failsafe Mode (Stop on loss)
                  </Label>
                </div>
                <Switch 
                  id="failsafe-mode"
                  checked={parameters.failsafeMode}
                  onCheckedChange={(checked) => handleParameterChange("failsafeMode", checked)}
                  disabled={isRunning}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="strategies" className="pt-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Enable or disable different arbitrage strategies
            </div>
            
            <div className="space-y-3">
              {/* Direct Strategy */}
              <div className={`p-3 rounded-md ${strategies.direct ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 border border-border/20"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center">
                      Direct Arbitrage
                      <Badge variant="outline" className="ml-2 bg-secondary border-muted text-xs">
                        Basic
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Simple A → B → A arbitrage between two DEXes
                    </div>
                  </div>
                  <Switch 
                    checked={strategies.direct}
                    onCheckedChange={(checked) => handleStrategyChange("direct", checked)}
                    disabled={isRunning}
                  />
                </div>
              </div>
              
              {/* Triangular Strategy */}
              <div className={`p-3 rounded-md ${strategies.triangular ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 border border-border/20"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center">
                      Triangular Arbitrage
                      <Badge variant="outline" className="ml-2 bg-secondary border-muted text-xs">
                        Intermediate
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      A → B → C → A across multiple pools
                    </div>
                  </div>
                  <Switch 
                    checked={strategies.triangular}
                    onCheckedChange={(checked) => handleStrategyChange("triangular", checked)}
                    disabled={isRunning}
                  />
                </div>
              </div>
              
              {/* Quadrilateral Strategy */}
              <div className={`p-3 rounded-md ${strategies.quadrilateral ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 border border-border/20"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center">
                      Quadrilateral Arbitrage
                      <Badge variant="outline" className="ml-2 bg-secondary border-muted text-xs">
                        Advanced
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      A → B → C → D → A complex trading path
                    </div>
                  </div>
                  <Switch 
                    checked={strategies.quadrilateral}
                    onCheckedChange={(checked) => handleStrategyChange("quadrilateral", checked)}
                    disabled={isRunning}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {advancedMode && (
            <TabsContent value="code" className="pt-4">
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-md p-4 border border-border/30">
                  <div className="text-sm font-medium mb-2">Custom Strategy Code (JavaScript)</div>
                  <textarea
                    className="w-full h-[200px] rounded-md p-3 bg-background border border-border/50 font-mono text-sm"
                    placeholder="// Define your custom strategy logic here
function customStrategy(pairs, prices) {
  // Your arbitrage detection algorithm
  return opportunities;
}"
                    disabled={isRunning}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled={isRunning}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Validate Custom Code
                </Button>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 text-sm">
                  <div className="flex items-center text-yellow-500 mb-1">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Advanced Feature</span>
                  </div>
                  <p className="text-muted-foreground">
                    Custom code execution allows you to define your own arbitrage strategies. 
                    Use with caution as incorrect code may lead to unexpected behavior.
                  </p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        <div className="flex items-center justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportConfiguration}
            disabled={isRunning}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          
          <Button 
            onClick={handleSaveConfiguration}
            size="sm"
            disabled={isRunning}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotBuilder;
