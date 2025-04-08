
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Check, Clock, RefreshCw, TriangleAlert, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Mock data for demonstration
const simulationData = {
  status: "completed", // pending, running, completed, error
  estimatedProfit: 0.32,
  estimatedGas: 0.05,
  netProfit: 0.27,
  profitPercent: 0.42,
  executionTime: 890, // ms
  riskLevel: "low", // low, medium, high
  slippage: 0.18, // percent
  steps: [
    { name: "Buy SOL", status: "success", dex: "Raydium" },
    { name: "Sell for USDC", status: "success", dex: "Jupiter" },
    { name: "Buy RAY", status: "success", dex: "Orca" },
  ]
};

// Mock chart data
const chartData = [
  { time: "00:00", sol: 148.2, orca: 148.2, diff: 0 },
  { time: "01:00", sol: 148.3, orca: 148.3, diff: 0 },
  { time: "02:00", sol: 148.2, orca: 148.4, diff: 0.2 },
  { time: "03:00", sol: 148.1, orca: 148.5, diff: 0.4 },
  { time: "04:00", sol: 148.3, orca: 148.6, diff: 0.3 },
  { time: "05:00", sol: 148.2, orca: 148.6, diff: 0.4 },
  { time: "06:00", sol: 148.3, orca: 148.4, diff: 0.1 },
  { time: "07:00", sol: 148.4, orca: 148.3, diff: -0.1 },
  { time: "08:00", sol: 148.5, orca: 148.2, diff: -0.3 },
];

const SimulationPanel = () => {
  const [currentStatus] = useState(simulationData.status);
  
  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    running: <RefreshCw className="h-4 w-4 animate-spin text-highlight" />,
    completed: <Check className="h-4 w-4 text-positive" />,
    error: <X className="h-4 w-4 text-destructive" />,
  }[currentStatus];

  const riskBadgeClass = {
    low: "bg-positive/20 text-positive border-positive/40",
    medium: "bg-amber-500/20 text-amber-500 border-amber-500/40",
    high: "bg-destructive/20 text-destructive border-destructive/40",
  }[simulationData.riskLevel];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5 text-highlight" />
              Transaction Simulation
            </CardTitle>
            <CardDescription>
              Simulate arbitrage before execution
            </CardDescription>
          </div>
          <Badge className="flex items-center gap-1.5" variant="outline">
            {statusIcon}
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStatus === "running" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Simulating transaction...</span>
              <span>67%</span>
            </div>
            <Progress value={67} className="h-2" />
          </div>
        )}
        
        {currentStatus === "completed" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary p-2 rounded-md">
                <div className="text-sm text-muted-foreground">Est. profit</div>
                <div className="text-positive font-medium">+${simulationData.estimatedProfit.toFixed(2)}</div>
              </div>
              <div className="bg-secondary p-2 rounded-md">
                <div className="text-sm text-muted-foreground">Gas fee</div>
                <div className="text-foreground font-medium">${simulationData.estimatedGas.toFixed(2)}</div>
              </div>
              <div className="bg-secondary p-2 rounded-md">
                <div className="text-sm text-muted-foreground">Net profit</div>
                <div className="text-positive font-medium">+${simulationData.netProfit.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="bg-secondary p-3 rounded-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Price difference</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={riskBadgeClass}>
                    {simulationData.riskLevel.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {simulationData.executionTime}ms execution
                  </span>
                </div>
              </div>
              
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#64748b" strokeWidth={0.5} />
                    <YAxis
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tick={{ fontSize: 10 }}
                      stroke="#64748b"
                      strokeWidth={0.5}
                      style={{ fontSize: '10px' }}
                    />
                    <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(240 6% 15%)',
                        border: 'none',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sol"
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={false}
                      name="Raydium"
                    />
                    <Line
                      type="monotone"
                      dataKey="orca"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      name="Orca"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        
        {currentStatus === "error" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-center gap-3">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            <div>
              <div className="font-medium text-sm">Simulation failed</div>
              <div className="text-xs text-muted-foreground">
                Transaction would fail due to insufficient liquidity
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-1.5">
          <div className="text-sm font-medium mb-1">Transaction steps</div>
          {simulationData.steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between py-1.5 border-b border-muted/30 last:border-0">
              <div className="flex items-center gap-1.5">
                <div className={`p-0.5 rounded-full ${
                  step.status === "success" ? "bg-positive" :
                  step.status === "pending" ? "bg-amber-500" : "bg-muted"
                }`}>
                  {step.status === "success" ? (
                    <Check className="h-3 w-3" />
                  ) : step.status === "pending" ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </div>
                <span className="text-sm">{step.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{step.dex}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Re-simulate
        </Button>
        <Button size="sm" className="gap-1.5" disabled={currentStatus !== "completed"}>
          Execute Transaction
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SimulationPanel;
