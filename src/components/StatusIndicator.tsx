
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isConnected: boolean;
  isRunning: boolean;
}

const StatusIndicator = ({ isConnected, isRunning }: StatusIndicatorProps) => {
  let statusText = "Disconnected";
  let statusClass = "bg-muted";
  
  if (isConnected && isRunning) {
    statusText = "Active";
    statusClass = "bg-positive animate-pulse-glow";
  } else if (isConnected) {
    statusText = "Ready";
    statusClass = "bg-highlight";
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-2.5 w-2.5 rounded-full", statusClass)} />
      <span className="text-xs font-medium text-muted-foreground">{statusText}</span>
    </div>
  );
};

export default StatusIndicator;
