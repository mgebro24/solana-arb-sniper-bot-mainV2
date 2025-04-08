
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, Plus, Trash2, Check, X, Pencil, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  name: string;
  condition: {
    type: string;
    comparator: string;
    value: number;
  };
  action: {
    type: string;
    parameters: any;
  };
  active: boolean;
}

interface TradingRulesProps {
  isRunning?: boolean;
}

const TradingRules = ({ isRunning = false }: TradingRulesProps) => {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      name: 'Stop loss protection',
      condition: {
        type: 'total_loss',
        comparator: 'greater_than',
        value: 5
      },
      action: {
        type: 'stop_bot',
        parameters: {}
      },
      active: true
    },
    {
      id: '2',
      name: 'High profit notification',
      condition: {
        type: 'single_profit',
        comparator: 'greater_than',
        value: 1.5
      },
      action: {
        type: 'send_notification',
        parameters: {
          type: 'success'
        }
      },
      active: true
    },
    {
      id: '3',
      name: 'Increase investment on good opportunity',
      condition: {
        type: 'profit_potential',
        comparator: 'greater_than',
        value: 0.8
      },
      action: {
        type: 'adjust_investment',
        parameters: {
          multiplier: 1.5
        }
      },
      active: false
    }
  ]);
  
  const [newRule, setNewRule] = useState<Omit<Rule, 'id'>>({
    name: '',
    condition: {
      type: 'profit_potential',
      comparator: 'greater_than',
      value: 0.5
    },
    action: {
      type: 'adjust_investment',
      parameters: {
        multiplier: 1.2
      }
    },
    active: true
  });
  
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();

  const handleToggleRule = (id: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )
    );
    
    const rule = rules.find(r => r.id === id);
    if (rule) {
      toast({
        title: rule.active ? "Rule Disabled" : "Rule Enabled",
        description: `'${rule.name}' has been ${rule.active ? "disabled" : "enabled"}`,
        variant: "default",
      });
    }
  };

  const handleDeleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    
    setRules(prev => prev.filter(rule => rule.id !== id));
    
    if (rule) {
      toast({
        title: "Rule Deleted",
        description: `'${rule.name}' has been removed`,
        variant: "default",
      });
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsEditing(true);
  };

  const saveEditedRule = () => {
    if (!editingRule) return;
    
    setRules(prev => 
      prev.map(rule => 
        rule.id === editingRule.id ? editingRule : rule
      )
    );
    
    toast({
      title: "Rule Updated",
      description: `'${editingRule.name}' has been modified`,
      variant: "default",
    });
    
    setIsEditing(false);
    setEditingRule(null);
  };

  const createNewRule = () => {
    if (!newRule.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the rule",
        variant: "destructive",
      });
      return;
    }
    
    const id = Date.now().toString();
    setRules(prev => [...prev, { ...newRule, id }]);
    
    toast({
      title: "Rule Created",
      description: `'${newRule.name}' has been added`,
      variant: "default",
    });
    
    // Reset the new rule form
    setNewRule({
      name: '',
      condition: {
        type: 'profit_potential',
        comparator: 'greater_than',
        value: 0.5
      },
      action: {
        type: 'adjust_investment',
        parameters: {
          multiplier: 1.2
        }
      },
      active: true
    });
    
    setIsCreating(false);
  };

  const getConditionLabel = (condition: Rule['condition']) => {
    const typeLabels: Record<string, string> = {
      profit_potential: 'Profit Potential',
      total_loss: 'Total Loss',
      single_profit: 'Single Trade Profit',
      market_volatility: 'Market Volatility',
      time_elapsed: 'Time Elapsed'
    };
    
    const comparatorLabels: Record<string, string> = {
      greater_than: 'greater than',
      less_than: 'less than',
      equal_to: 'equal to'
    };
    
    return `${typeLabels[condition.type]} ${comparatorLabels[condition.comparator]} ${condition.value}${
      condition.type.includes('profit') || condition.type === 'total_loss' ? '%' : 
      condition.type === 'time_elapsed' ? ' min' : ''
    }`;
  };

  const getActionLabel = (action: Rule['action']) => {
    const actionLabels: Record<string, string> = {
      stop_bot: 'Stop Bot',
      send_notification: 'Send Notification',
      adjust_investment: `Adjust Investment (${action.parameters.multiplier}x)`,
      change_strategy: 'Change Strategy'
    };
    
    return actionLabels[action.type];
  };

  const RuleForm = ({ rule, setRule, showName = true }: { 
    rule: Omit<Rule, 'id'> | Rule,
    setRule: (rule: any) => void,
    showName?: boolean
  }) => {
    return (
      <div className="space-y-4">
        {showName && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Rule Name</label>
            <Input 
              placeholder="E.g., Stop loss protection"
              value={rule.name}
              onChange={(e) => setRule({ ...rule, name: e.target.value })}
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="text-sm font-medium">Condition</div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Select 
                value={rule.condition.type}
                onValueChange={(value) => setRule({ 
                  ...rule, 
                  condition: { ...rule.condition, type: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit_potential">Profit Potential</SelectItem>
                  <SelectItem value="total_loss">Total Loss</SelectItem>
                  <SelectItem value="single_profit">Single Trade Profit</SelectItem>
                  <SelectItem value="market_volatility">Market Volatility</SelectItem>
                  <SelectItem value="time_elapsed">Time Elapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Comparator</label>
              <Select 
                value={rule.condition.comparator}
                onValueChange={(value) => setRule({ 
                  ...rule, 
                  condition: { ...rule.condition, comparator: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select comparator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="equal_to">Equal To</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Value</label>
                <span className="text-sm">
                  {rule.condition.value}
                  {rule.condition.type.includes('profit') || rule.condition.type === 'total_loss' 
                    ? '%' : rule.condition.type === 'time_elapsed' ? ' min' : ''}
                </span>
              </div>
              <Slider 
                value={[rule.condition.value]}
                onValueChange={(values) => setRule({
                  ...rule,
                  condition: { ...rule.condition, value: values[0] }
                })}
                min={0}
                max={rule.condition.type === 'time_elapsed' ? 120 : 10}
                step={rule.condition.type === 'time_elapsed' ? 5 : 0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>0{rule.condition.type.includes('profit') || rule.condition.type === 'total_loss' ? '%' : ''}</div>
                <div>
                  {rule.condition.type === 'time_elapsed' ? '120 min' : '10%'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm font-medium">Action</div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Select 
                value={rule.action.type}
                onValueChange={(value) => setRule({ 
                  ...rule, 
                  action: { 
                    ...rule.action, 
                    type: value,
                    parameters: value === 'adjust_investment' 
                      ? { multiplier: 1.2 } 
                      : value === 'send_notification'
                        ? { type: 'success' }
                        : {}
                  } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stop_bot">Stop Bot</SelectItem>
                  <SelectItem value="send_notification">Send Notification</SelectItem>
                  <SelectItem value="adjust_investment">Adjust Investment</SelectItem>
                  <SelectItem value="change_strategy">Change Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {rule.action.type === 'adjust_investment' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Multiplier</label>
                  <span className="text-sm">
                    {rule.action.parameters.multiplier}x
                  </span>
                </div>
                <Slider 
                  value={[rule.action.parameters.multiplier]}
                  onValueChange={(values) => setRule({
                    ...rule,
                    action: { 
                      ...rule.action, 
                      parameters: { ...rule.action.parameters, multiplier: values[0] }
                    }
                  })}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>0.5x</div>
                  <div>3x</div>
                </div>
              </div>
            )}
            
            {rule.action.type === 'send_notification' && (
              <div>
                <label className="text-xs text-muted-foreground">Notification Type</label>
                <Select 
                  value={rule.action.parameters.type}
                  onValueChange={(value) => setRule({
                    ...rule,
                    action: { 
                      ...rule.action, 
                      parameters: { ...rule.action.parameters, type: value }
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {rule.action.type === 'change_strategy' && (
              <div>
                <label className="text-xs text-muted-foreground">Target Strategy</label>
                <Select 
                  value={rule.action.parameters.strategy || "direct"}
                  onValueChange={(value) => setRule({
                    ...rule,
                    action: { 
                      ...rule.action, 
                      parameters: { ...rule.action.parameters, strategy: value }
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct Arbitrage</SelectItem>
                    <SelectItem value="triangular">Triangular Arbitrage</SelectItem>
                    <SelectItem value="quadrilateral">Quadrilateral Arbitrage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Switch 
              checked={rule.active}
              onCheckedChange={(checked) => setRule({ ...rule, active: checked })}
              id="rule-active"
            />
            <label htmlFor="rule-active" className="text-sm cursor-pointer">Rule Active</label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookUser className="h-5 w-5 text-highlight" />
              Trading Rules
            </CardTitle>
            <CardDescription>
              Automated responses to market conditions
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" disabled={isRunning}>
                <Plus className="h-4 w-4" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Rule</DialogTitle>
                <DialogDescription>
                  Define conditions and actions for automated trading responses
                </DialogDescription>
              </DialogHeader>
              
              <RuleForm rule={newRule} setRule={setNewRule} />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={createNewRule}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length > 0 ? (
          <div className="space-y-3">
            {rules.map(rule => (
              <div 
                key={rule.id}
                className={`p-3 rounded-md border ${
                  rule.active 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-secondary/50 border-border/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{rule.name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={rule.active 
                      ? 'bg-primary/20 border-primary/30' 
                      : 'bg-secondary border-muted'
                    }>
                      {rule.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditRule(rule)}
                      disabled={isRunning}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isRunning}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleToggleRule(rule.id)}
                      disabled={isRunning}
                    >
                      {rule.active ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">If:</span>
                    <span>{getConditionLabel(rule.condition)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Then:</span>
                    <span>{getActionLabel(rule.action)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/30 rounded-md p-6 flex flex-col items-center justify-center border border-border/20">
            <BookUser className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">No trading rules defined yet</p>
            <Button 
              onClick={() => setIsCreating(true)}
              disabled={isRunning}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </div>
        )}
        
        {isRunning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Bot is running.</span> Trading rules can't be modified while the bot is active.
            </div>
          </div>
        )}
      </CardContent>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rule</DialogTitle>
            <DialogDescription>
              Modify conditions and actions for this trading rule
            </DialogDescription>
          </DialogHeader>
          
          {editingRule && (
            <RuleForm 
              rule={editingRule} 
              setRule={setEditingRule} 
              showName={true}
            />
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEditedRule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TradingRules;
