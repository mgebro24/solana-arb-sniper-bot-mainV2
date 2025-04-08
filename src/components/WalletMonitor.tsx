
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, Coins, ExternalLink, BarChart4, Shield, ShieldAlert, AlertCircle, Check, 
  ArrowUpRight, ArrowDownRight, CircleAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface WalletMonitorProps {
  isConnected?: boolean;
  walletAddress?: string;
}

const WalletMonitor = ({ 
  isConnected = false,
  walletAddress = "7uYSM9XGxLJU1XwhjVPuQdGtS5SSdkWSrce4HwyVae42"
}: WalletMonitorProps) => {
  const [balance, setBalance] = useState({
    sol: 0,
    usdc: 0,
    otherTokens: 0,
    totalUsdValue: 0
  });
  
  const [transactions, setTransactions] = useState({
    recent: [],
    count: 0,
    pending: 0
  });
  
  const [securityStatus, setSecurityStatus] = useState({
    riskLevel: "low", // low, medium, high
    issues: 0,
    lastScan: new Date()
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isConnected) {
      // Simulate loading wallet data
      setTimeout(() => {
        setBalance({
          sol: 4.82,
          usdc: 125.2,
          otherTokens: 3,
          totalUsdValue: 872.50
        });
        
        setTransactions({
          recent: [
            {
              type: "outgoing",
              destination: "Raydium",
              amount: "0.5 SOL",
              time: "2 mins ago",
              status: "confirmed"
            },
            {
              type: "incoming",
              source: "Jupiter",
              amount: "0.512 SOL",
              time: "5 mins ago",
              status: "confirmed"
            },
            {
              type: "outgoing",
              destination: "Orca",
              amount: "12.5 USDC",
              time: "15 mins ago",
              status: "confirmed"
            }
          ],
          count: 24,
          pending: 0
        });
        
        setSecurityStatus({
          riskLevel: "low",
          issues: 0,
          lastScan: new Date()
        });
        
        setIsLoading(false);
      }, 1500);
    }
  }, [isConnected]);
  
  const handleOpenExplorer = () => {
    window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank');
  };
  
  const renderRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return (
          <Badge variant="outline" className="bg-positive/20 text-positive border-positive/40 gap-1 flex items-center">
            <Shield className="h-3.5 w-3.5" />
            Low Risk
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/40 gap-1 flex items-center">
            <ShieldAlert className="h-3.5 w-3.5" />
            Medium Risk
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/40 gap-1 flex items-center">
            <AlertCircle className="h-3.5 w-3.5" />
            High Risk
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border border-border/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-highlight" />
              Wallet Monitor
            </CardTitle>
            <CardDescription>
              Monitor your wallet balance and activity
            </CardDescription>
          </div>
          {isConnected ? renderRiskBadge(securityStatus.riskLevel) : (
            <Badge variant="outline" className="border-destructive/40 text-destructive gap-1 flex items-center">
              <CircleAlert className="h-3.5 w-3.5" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            {isLoading ? (
              <div className="py-4 flex flex-col items-center justify-center">
                <Coins className="h-8 w-8 text-muted-foreground animate-pulse mb-2" />
                <p className="text-sm text-muted-foreground">Loading wallet data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-md p-3 flex flex-col">
                    <span className="text-sm text-muted-foreground">SOL Balance</span>
                    <span className="text-xl font-medium mt-1">{balance.sol}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      ${(balance.sol * 150).toFixed(2)} USD
                    </span>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-md p-3 flex flex-col">
                    <span className="text-sm text-muted-foreground">USDC Balance</span>
                    <span className="text-xl font-medium mt-1">{balance.usdc}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      ${balance.usdc.toFixed(2)} USD
                    </span>
                  </div>
                </div>
                
                <div className="bg-secondary/30 rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Wallet Address</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 gap-1 text-xs"
                      onClick={handleOpenExplorer}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Explorer
                    </Button>
                  </div>
                  
                  <HoverCard>
                    <HoverCardTrigger className="cursor-help">
                      <div className="bg-secondary px-3 py-1.5 rounded text-sm font-mono">
                        {truncateAddress(walletAddress)}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto font-mono text-xs py-1.5">
                      {walletAddress}
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Allocation</h4>
                    <span className="text-xs text-muted-foreground">
                      ${balance.totalUsdValue.toFixed(2)} Total Value
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>SOL</span>
                        <span>{((balance.sol * 150) / balance.totalUsdValue * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={((balance.sol * 150) / balance.totalUsdValue * 100)} className="h-1.5" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>USDC</span>
                        <span>{(balance.usdc / balance.totalUsdValue * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(balance.usdc / balance.totalUsdValue * 100)} className="h-1.5" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Other Tokens ({balance.otherTokens})</span>
                        <span>{((balance.totalUsdValue - balance.usdc - (balance.sol * 150)) / balance.totalUsdValue * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={((balance.totalUsdValue - balance.usdc - (balance.sol * 150)) / balance.totalUsdValue * 100)} className="h-1.5" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <BarChart4 className="h-4 w-4 text-muted-foreground" />
                      Recent Activity
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {transactions.count} transactions today
                    </span>
                  </div>
                  
                  {transactions.pending > 0 && (
                    <div className="bg-amber-500/10 text-amber-500 rounded-md p-2 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <CircleAlert className="h-4 w-4" />
                        {transactions.pending} pending transaction(s)
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-amber-500 hover:text-amber-600">
                        View
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {transactions.recent.map((tx: any, index: number) => (
                      <div key={index} className="bg-secondary/30 rounded-md p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tx.type === "incoming" ? (
                            <ArrowDownRight className="h-4 w-4 text-positive" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-amber-500" />
                          )}
                          <div>
                            <div className="text-sm">
                              {tx.type === "incoming" ? 
                                `Received from ${tx.source}` : 
                                `Sent to ${tx.destination}`
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tx.time}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {tx.type === "incoming" ? "+" : "-"}{tx.amount}
                          </div>
                          <div className="flex items-center justify-end text-xs">
                            {tx.status === "confirmed" ? (
                              <span className="flex items-center text-positive gap-1">
                                <Check className="h-3 w-3" />
                                Confirmed
                              </span>
                            ) : (
                              <span className="flex items-center text-amber-500 gap-1">
                                <CircleAlert className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center">
            <CircleAlert className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No wallet connected</p>
            <p className="text-xs text-muted-foreground text-center max-w-[250px] mb-4">
              Connect your wallet to monitor balance and transactions for arbitrage operations.
            </p>
            <Button>
              Connect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletMonitor;
