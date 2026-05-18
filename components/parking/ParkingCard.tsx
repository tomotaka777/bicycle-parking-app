import { MapPin, Clock, Navigation, Layers } from "lucide-react";
import StatusBadge from "./StatusBadge";
import CapacityBar from "./CapacityBar";
import { calcDistance, formatDistance } from "@/hooks/useUserLocation";
import { BicycleParkingLot } from "@/lib/firebaseClient";
import { motion } from "framer-motion";

interface ParkingCardProps {
  lot: BicycleParkingLot;
  index: number;
  userLocation: { lat: number; lng: number } | null;
}

export default function ParkingCard({ lot, index, userLocation }: ParkingCardProps) {
  const dist = userLocation && lot.latitude && lot.longitude
    ? calcDistance(userLocation.lat, userLocation.lng, lot.latitude, lot.longitude)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border p-5 hover:border-primary/30 transition-all hover:shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-base">{lot.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{lot.station_name}</p>
        </div>
        <StatusBadge current={lot.current_count} total={lot.total_capacity} />
      </div>

      <CapacityBar current={lot.current_count} total={lot.total_capacity} />

      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{lot.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>{lot.parking_type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>24時間</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary font-medium">
            {dist !== null ? `現在地から ${formatDistance(dist)}` : "距離不明"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3">
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Googleマップで経路を見る
        </a>
      </div>
    </motion.div>
  );
}
