/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
import { BicycleParkingLot } from "@/lib/firebaseClient";
import { getAvailabilityStatus } from "./StatusBadge";
import { Bike, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function StatsBar({ lots }: { lots: BicycleParkingLot[] }) {
  const totalSpots = lots.reduce((acc, lot) => acc + lot.total_capacity, 0);
  const totalAvailable = lots.reduce((acc, lot) => acc + (lot.total_capacity - lot.current_count), 0);

  const statuses = lots.map(lot => getAvailabilityStatus(lot.current_count, lot.total_capacity));
  const successCount = statuses.filter(s => s.level === "success").length;
  const warningCount = statuses.filter(s => s.level === "warning").length;
  const dangerCount = statuses.filter(s => s.level === "danger").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-2xl border p-4 flex flex-col justify-between">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Bike className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold">{totalAvailable} <span className="text-sm font-normal text-muted-foreground">台</span></div>
          <div className="text-xs text-muted-foreground mt-1">総空き台数</div>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl border p-4 flex flex-col justify-between">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="text-2xl font-bold">{successCount} <span className="text-sm font-normal text-muted-foreground">箇所</span></div>
          <div className="text-xs text-muted-foreground mt-1">空きあり</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-4 flex flex-col justify-between">
        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
        </div>
        <div>
          <div className="text-2xl font-bold">{warningCount} <span className="text-sm font-normal text-muted-foreground">箇所</span></div>
          <div className="text-xs text-muted-foreground mt-1">残りわずか</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-4 flex flex-col justify-between">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-2">
          <XCircle className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <div className="text-2xl font-bold">{dangerCount} <span className="text-sm font-normal text-muted-foreground">箇所</span></div>
          <div className="text-xs text-muted-foreground mt-1">満車</div>
        </div>
      </div>
    </div>
  );
}
