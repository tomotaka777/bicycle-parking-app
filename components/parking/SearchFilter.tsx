import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  typeFilter: string;
  onTypeChange: (val: string) => void;
  sortOrder: string;
  onSortChange: (val: string) => void;
  hasLocation: boolean;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  sortOrder,
  onSortChange,
  hasLocation,
}: SearchFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="駐輪場名・駅名で検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            isOpen 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "bg-card border text-foreground hover:bg-muted"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">フィルター</span>
          {isOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-card border rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">空き状況</div>
          <div className="flex flex-wrap gap-2">
            {["all", "success", "warning", "danger"].map((val) => (
              <button
                key={val}
                onClick={() => onStatusChange(val)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  statusFilter === val
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {val === "all" ? "すべて" : val === "success" ? "空きあり" : val === "warning" ? "残りわずか" : "満車"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">並び替え</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSortChange("default")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                sortOrder === "default"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              デフォルト
            </button>
            <button
              onClick={() => onSortChange("nearest")}
              disabled={!hasLocation}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all disabled:opacity-50",
                sortOrder === "nearest"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              近い順
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">種別</div>
          <div className="flex flex-wrap gap-2">
            {["all", "屋根あり", "屋根なし", "地下式", "機械式"].map((val) => (
              <button
                key={val}
                onClick={() => onTypeChange(val)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  typeFilter === val
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {val === "all" ? "すべて" : val}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
