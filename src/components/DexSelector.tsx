
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

// Mock data for demonstration
const dexes = [
  { id: "raydium", name: "Raydium", active: true, status: "stable" },
  { id: "orca", name: "Orca", active: true, status: "stable" },
  { id: "jupiter", name: "Jupiter", active: true, status: "stable" },
  { id: "meteora", name: "Meteora", active: true, status: "stable" },
  { id: "serum", name: "Serum", active: false, status: "deprecated" },
  { id: "lifinity", name: "Lifinity", active: false, status: "limited" },
  { id: "saber", name: "Saber", active: false, status: "available" },
  { id: "aldrin", name: "Aldrin", active: false, status: "available" },
];

const DexSelector = () => {
  const [activeDexes, setActiveDexes] = useState(
    dexes.filter(dex => dex.active).map(dex => dex.id)
  );
  
  const toggleDex = (dexId: string) => {
    setActiveDexes(prev => 
      prev.includes(dexId) 
        ? prev.filter(id => id !== dexId)
        : [...prev, dexId]
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">DEX Monitors</CardTitle>
        <CardDescription>
          Select exchanges to monitor for arbitrage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {dexes.map((dex) => {
            const isActive = activeDexes.includes(dex.id);
            const isDisabled = dex.status === "deprecated";
            
            return (
              <div 
                key={dex.id} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  isDisabled ? "opacity-50 cursor-not-allowed" :
                  isActive ? "bg-secondary" : "bg-muted/20"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{dex.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {dex.status === "stable" ? "Stable" :
                     dex.status === "limited" ? "Limited liquidity" :
                     dex.status === "deprecated" ? "Deprecated" : "Available"}
                  </span>
                </div>
                <Switch 
                  checked={isActive}
                  onCheckedChange={() => !isDisabled && toggleDex(dex.id)}
                  disabled={isDisabled}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DexSelector;
