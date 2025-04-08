
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TokenPrice, fetchTokenPrices } from "@/services/priceService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PriceComparisonTableProps {
  autoRefresh?: boolean;
}

const PriceComparisonTable = ({ autoRefresh = true }: PriceComparisonTableProps) => {
  const [priceData, setPriceData] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setIsLoading(true);
        const prices = await fetchTokenPrices();
        setPriceData(prices);
      } catch (error) {
        console.error("Failed to fetch prices", error);
        toast({
          title: "Error fetching prices",
          description: "Could not load the latest price data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrices();
    
    // Auto-refresh prices if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadPrices, 15000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [toast, autoRefresh]);

  if (isLoading && priceData.length === 0) {
    return (
      <div className="rounded-md border p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading price data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Pair</TableHead>
            <TableHead>Raydium</TableHead>
            <TableHead>Orca</TableHead>
            <TableHead>Jupiter</TableHead>
            <TableHead>Meteora</TableHead>
            <TableHead className="text-center">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priceData.map((row) => {
            // Calculate price differences and percentage
            const prices = [row.raydium, row.orca, row.jupiter, row.meteora];
            const max = Math.max(...prices);
            const min = Math.min(...prices);
            const diff = max - min;
            const diffPct = (diff / min) * 100;
            
            return (
              <TableRow key={row.pair}>
                <TableCell className="font-medium">{row.pair}</TableCell>
                <TableCell className={row.bestDex === "raydium" ? "text-highlight font-medium" : ""}>
                  ${row.raydium.toFixed(row.pair === "BONK/USDC" ? 8 : 2)}
                </TableCell>
                <TableCell className={row.bestDex === "orca" ? "text-highlight font-medium" : ""}>
                  ${row.orca.toFixed(row.pair === "BONK/USDC" ? 8 : 2)}
                </TableCell>
                <TableCell className={row.bestDex === "jupiter" ? "text-highlight font-medium" : ""}>
                  ${row.jupiter.toFixed(row.pair === "BONK/USDC" ? 8 : 2)}
                </TableCell>
                <TableCell className={row.bestDex === "meteora" ? "text-highlight font-medium" : ""}>
                  ${row.meteora.toFixed(row.pair === "BONK/USDC" ? 8 : 2)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "gap-1",
                      diffPct >= 0.5 ? "bg-positive/20 text-positive border-positive/40" : 
                      diffPct >= 0.2 ? "bg-amber-500/20 text-amber-500 border-amber-500/40" :
                      "bg-muted/50 border-muted"
                    )}
                  >
                    {diffPct >= 0.2 && <ArrowUp className="w-3 h-3" />}
                    {diffPct.toFixed(2)}%
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      
      <div className="text-xs text-muted-foreground p-2 flex justify-end items-center gap-2">
        {autoRefresh ? (
          <>
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight"></span>
            </span>
            Auto-refreshing every 15s
          </>
        ) : (
          "Auto-refresh disabled"
        )}
      </div>
    </div>
  );
};

export default PriceComparisonTable;
