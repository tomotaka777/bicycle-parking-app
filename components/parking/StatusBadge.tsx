/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
import { cn } from "@/lib/utils";

export type StatusLevel = "success" | "warning" | "danger";

export function getAvailabilityStatus(current: number, total: number): {
  level: StatusLevel;
  label: string;
  colorClass: string;
  bgClass: string;
} {
  const available = total - current;
  const ratio = available / total;

  if (available <= 0) {
    return { level: "danger", label: "満車", colorClass: "text-red-600", bgClass: "bg-red-50 border-red-200" };
  } else if (ratio <= 0.2) {
    return { level: "warning", label: "残りわずか", colorClass: "text-yellow-600", bgClass: "bg-yellow-50 border-yellow-200" };
  } else {
    return { level: "success", label: "空きあり", colorClass: "text-green-600", bgClass: "bg-green-50 border-green-200" };
  }
}

export default function StatusBadge({ current, total, className }: { current: number; total: number; className?: string }) {
  const status = getAvailabilityStatus(current, total);

  return (
    <div className={cn("px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5", status.bgClass, status.colorClass, className)}>
      <div className={cn("w-2 h-2 rounded-full", status.level === "danger" ? "bg-red-500" : status.level === "warning" ? "bg-yellow-500" : "bg-green-500")} />
      {status.label}
    </div>
  );
}
