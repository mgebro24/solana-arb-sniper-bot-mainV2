
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Mock data for demonstration
const tokenPairs = [
  { id: "sol-usdc", name: "SOL/USDC", liquidity: "High", volume: "$12.5M" },
  { id: "ray-usdc", name: "RAY/USDC", liquidity: "Medium", volume: "$3.2M" },
  { id: "jto-usdc", name: "JTO/USDC", liquidity: "Medium", volume: "$2.8M" },
  { id: "bonk-usdc", name: "BONK/USDC", liquidity: "High", volume: "$5.4M" },
  { id: "mngo-usdc", name: "MNGO/USDC", liquidity: "Low", volume: "$1.1M" },
  { id: "samo-usdc", name: "SAMO/USDC", liquidity: "Medium", volume: "$2.1M" },
  { id: "orca-usdc", name: "ORCA/USDC", liquidity: "Low", volume: "$0.9M" },
  { id: "stsol-usdc", name: "stSOL/USDC", liquidity: "High", volume: "$6.8M" },
];

const TokenPairSelector = () => {
  const [selectedPairs, setSelectedPairs] = useState(["sol-usdc", "ray-usdc", "jto-usdc", "bonk-usdc"]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredPairs = searchQuery 
    ? tokenPairs.filter(pair => 
        pair.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tokenPairs;
  
  const togglePair = (pairId: string) => {
    setSelectedPairs(prev => 
      prev.includes(pairId) 
        ? prev.filter(id => id !== pairId)
        : [...prev, pairId]
    );
  };
  
  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Token Pairs</CardTitle>
        <CardDescription>
          Select pairs to monitor for arbitrage
        </CardDescription>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search pairs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-2 pb-4">
            {filteredPairs.map((pair) => (
              <div 
                key={pair.id} 
                className="flex items-center justify-between py-2 border-b border-muted/30 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id={pair.id} 
                    checked={selectedPairs.includes(pair.id)}
                    onCheckedChange={() => togglePair(pair.id)}
                  />
                  <label 
                    htmlFor={pair.id} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {pair.name}
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      pair.liquidity === "High" ? "bg-positive/20 text-positive" :
                      pair.liquidity === "Medium" ? "bg-amber-500/20 text-amber-500" :
                      "bg-muted/50 text-muted-foreground"
                    }`}>
                      {pair.liquidity}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right">
                    {pair.volume}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TokenPairSelector;
