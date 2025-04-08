
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, LightbulbIcon, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotIntelligenceProps {
  intelligenceLevel: 'low' | 'medium' | 'high';
  onIntelligenceLevelChange: (level: 'low' | 'medium' | 'high') => void;
  isRunning: boolean;
}

const BotIntelligence = ({
  intelligenceLevel,
  onIntelligenceLevelChange,
  isRunning
}: BotIntelligenceProps) => {
  const { toast } = useToast();
  
  const handleIntelligenceChange = (value: string) => {
    if (isRunning) {
      toast({
        title: "Cannot Change Intelligence",
        description: "Stop the bot before changing intelligence level",
        variant: "destructive",
      });
      return;
    }
    
    onIntelligenceLevelChange(value as 'low' | 'medium' | 'high');
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-highlight" />
              Bot Intelligence
            </CardTitle>
            <CardDescription>
              Configure bot's decision making capability
            </CardDescription>
          </div>
          <Badge 
            variant={
              intelligenceLevel === 'high' ? 'default' : 
              intelligenceLevel === 'medium' ? 'secondary' : 'outline'
            }
          >
            {intelligenceLevel === 'high' ? 'Advanced AI' : 
             intelligenceLevel === 'medium' ? 'Smart' : 'Basic'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={intelligenceLevel} 
          onValueChange={handleIntelligenceChange}
          className="space-y-3"
          disabled={isRunning}
        >
          <div className={`flex items-start space-x-2 rounded-md border p-3 ${
            intelligenceLevel === 'low' ? 'bg-secondary/50 border-secondary' : 'border-border/30'
          }`}>
            <RadioGroupItem value="low" id="low" className="mt-1" />
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between">
                <Label htmlFor="low" className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    Basic Logic
                  </div>
                </Label>
                <span className="text-xs text-muted-foreground">Rust-optimized</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Simple profit-based execution without additional analysis. Fastest performance.
              </p>
            </div>
          </div>
          
          <div className={`flex items-start space-x-2 rounded-md border p-3 ${
            intelligenceLevel === 'medium' ? 'bg-secondary/50 border-secondary' : 'border-border/30'
          }`}>
            <RadioGroupItem value="medium" id="medium" className="mt-1" />
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between">
                <Label htmlFor="medium" className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <LightbulbIcon className="h-4 w-4" />
                    Smart Analysis
                  </div>
                </Label>
                <span className="text-xs text-muted-foreground">Balanced</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Considers gas costs and basic risk factors when executing trades. Good balance of speed and intelligence.
              </p>
            </div>
          </div>
          
          <div className={`flex items-start space-x-2 rounded-md border p-3 ${
            intelligenceLevel === 'high' ? 'bg-secondary/50 border-secondary' : 'border-border/30'
          }`}>
            <RadioGroupItem value="high" id="high" className="mt-1" />
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between">
                <Label htmlFor="high" className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4" />
                    Advanced AI
                  </div>
                </Label>
                <span className="text-xs text-muted-foreground">Learning-enabled</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Full risk assessment, learns from failed trades, and adapts strategies over time. Most sophisticated but requires more resources.
              </p>
            </div>
          </div>
        </RadioGroup>
        
        {isRunning && (
          <div className="mt-4 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-md">
            Intelligence level cannot be changed while the bot is running. Stop the bot first to make changes.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BotIntelligence;
