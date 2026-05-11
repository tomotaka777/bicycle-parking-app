"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { List, Map as MapIcon, Navigation, Layers } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import useUserLocation from "@/hooks/useUserLocation";
import { firebaseClient } from "@/lib/firebaseClient";
import "leaflet/dist/leaflet.css";

// Dynamic import for the Map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/parking/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-2xl border">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

export default function MapPage() {
  const { location: userLocation, error: locationError } = useUserLocation();
  const [lots, setLots] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initial fetch
    firebaseClient.BicycleParkingLot.list(userLocation?.lat, userLocation?.lng).then((data) => {
      setLots(data);
      queryClient.setQueryData(["parking-lots", userLocation?.lat, userLocation?.lng], data);
    });

    // Real-time updates
    const unsubscribe = firebaseClient.BicycleParkingLot.subscribe((updatedData) => {
      setLots(updatedData);
      queryClient.setQueryData(["parking-lots", userLocation?.lat, userLocation?.lng], updatedData);
    });
    return unsubscribe;
  }, [queryClient, userLocation]);

  const lotsWithCoords = lots.filter((l) => l.latitude && l.longitude);

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
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl text-sm font-medium hover:bg-muted/50 transition-all"
          >
            <List className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">ダッシュボード</span>
          </Link>
        </div>
      </header>

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            マップ表示
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground mt-1"
          >
            地図上で駐輪場の位置と空き状況を確認
          </motion.p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userLocation && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-600">
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">現在地表示中</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-border/60 shadow-sm relative"
        style={{ height: "calc(100vh - 240px)", minHeight: "400px" }}
      >
        {lotsWithCoords.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full bg-card">
              <MapIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">位置情報を読み込み中...</p>
           </div>
        ) : (
          <MapComponent 
            lots={lotsWithCoords} 
            userLocation={userLocation} 
          />
        )}
      </motion.div>
    </div>
  );
}
