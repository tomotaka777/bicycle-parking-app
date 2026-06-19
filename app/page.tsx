"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import StatsBar from "@/components/parking/StatsBar";
import SearchFilter from "@/components/parking/SearchFilter";
import ParkingCard from "@/components/parking/ParkingCard";
import { getAvailabilityStatus } from "@/components/parking/StatusBadge";
import useUserLocation, { calcDistance } from "@/hooks/useUserLocation";
import { firebaseClient, BicycleParkingLot } from "@/lib/firebaseClient";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recommended");
  const { location: userLocation } = useUserLocation();
  const queryClient = useQueryClient();

  const { data: lots = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["parking-lots", userLocation?.lat, userLocation?.lng],
    queryFn: () => firebaseClient.BicycleParkingLot.list(userLocation?.lat, userLocation?.lng),
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = firebaseClient.BicycleParkingLot.subscribe((updatedData) => {
      queryClient.setQueryData(["parking-lots", userLocation?.lat, userLocation?.lng], updatedData);
    });
    return unsubscribe;
  }, [queryClient, userLocation]);

  const filteredLots = lots.filter((lot) => {
    // Search
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !query ||
      (lot.name || "").toLowerCase().includes(query) ||
      (lot.station_name || "").toLowerCase().includes(query) ||
      (lot.address || "").toLowerCase().includes(query);

    // Status
    const status = getAvailabilityStatus(lot.current_count, lot.total_capacity);
    const matchStatus = statusFilter === "all" || status.level === statusFilter;

    // Type
    const matchType = typeFilter === "all" || lot.parking_type === typeFilter;

    return matchSearch && matchStatus && matchType;
  }).sort((a, b) => {
    if (!userLocation || !a.latitude || !b.latitude) return 0;

    if (sortOrder === "nearest") {
      const dA = calcDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const dB = calcDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return dA - dB;
    } else if (sortOrder === "recommended") {
      const dA = calcDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const dB = calcDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      
      // 満車確率P (バックグラウンドから提供される想定。未提供の場合は現在の利用率でモック計算)
      const pA = a.full_probability ?? (a.total_capacity > 0 ? a.current_count / a.total_capacity : 1);
      const pB = b.full_probability ?? (b.total_capacity > 0 ? b.current_count / b.total_capacity : 1);
      
      const scoreA = dA * (1 + pA);
      const scoreB = dB * (1 + pB);
      
      return scoreA - scoreB;
    }
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-lg">🚲</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">駐輪ナビ</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Parking Status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/map"
            className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl text-sm font-medium hover:bg-muted/50 transition-all"
          >
            <MapIcon className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">マップ</span>
          </Link>
        </div>
      </header>

      {/* Page Title */}
      <div className="flex items-end justify-between">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            駐輪場の空き状況
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground mt-1"
          >
            リアルタイムで空き状況を確認できます
          </motion.p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">更新</span>
        </button>
      </div>

      {/* Stats */}
      {!isLoading && lots.length > 0 && <StatsBar lots={lots} />}

      {/* Search & Filter */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        hasLocation={!!userLocation}
      />

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filteredLots.length} 件の駐輪場を表示中
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border p-5 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-muted rounded-lg w-32" />
                <div className="h-6 bg-muted rounded-full w-20" />
              </div>
              <div className="h-8 bg-muted rounded-lg w-24 mb-2" />
              <div className="h-2 bg-muted rounded-full w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredLots.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <span className="text-2xl">🚲</span>
          </div>
          <h3 className="text-base font-semibold mb-1">駐輪場が見つかりません</h3>
          <p className="text-sm text-muted-foreground">
            検索条件を変更してみてください
          </p>
        </motion.div>
      )}

      {/* Parking Grid */}
      {!isLoading && filteredLots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.map((lot, i) => (
            <ParkingCard key={lot.id} lot={lot} index={i} userLocation={userLocation} />
          ))}
        </div>
      )}
    </div>
  );
}
