import { getAvailabilityStatus } from "./StatusBadge";
import { cn } from "@/lib/utils";

export default function CapacityBar({ current, total }: { current: number; total: number }) {
  const status = getAvailabilityStatus(current, total);
  const ratio = Math.min(100, Math.max(0, (current / total) * 100));

  let barColor = "bg-green-500";
  if (status.level === "warning") barColor = "bg-yellow-500";
  if (status.level === "danger") barColor = "bg-red-500";

  return (
    <div className="mt-3">
      <div className="flex justify-between items-end mb-1">
        <div className="text-2xl font-bold">
          {total - current}
          <span className="text-sm font-normal text-muted-foreground ml-1">/ {total} 台</span>
        </div>
        <div className="text-xs font-medium text-muted-foreground">空き</div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${100 - ratio}%` }}
        />
      </div>
    </div>
  );
}
