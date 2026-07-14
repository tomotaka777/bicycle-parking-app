/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { BicycleParkingLot } from "@/lib/firebaseClient";
import StatusBadge from "./StatusBadge";
import CapacityBar from "./CapacityBar";
import { calcDistance, formatDistance } from "@/hooks/useUserLocation";

// Fix default marker icon issues in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createCustomIcon(current: number, total: number) {
  const available = total - current;
  const ratio = available / total;
  let color;
  let shadow;
  
  if (available <= 0) {
    color = "#ef4444"; // Danger/Red
    shadow = "rgba(239, 68, 68, 0.4)";
  } else if (ratio <= 0.2) {
    color = "#eab308"; // Warning/Yellow
    shadow = "rgba(234, 179, 8, 0.4)";
  } else {
    color = "#22c55e"; // Success/Green
    shadow = "rgba(34, 197, 94, 0.4)";
  }

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px ${shadow};
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 11px; font-weight: 700;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${available}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      width: 20px; height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59,130,246,0.5);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});


interface MapComponentProps {
  lots: BicycleParkingLot[];
  userLocation: { lat: number; lng: number } | null;
}

export default function MapComponent({ lots, userLocation }: MapComponentProps) {
  const defaultCenter: [number, number] = [34.7024, 135.4959]; // Umeda Default
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : lots.length > 0
    ? [lots[0].latitude, lots[0].longitude]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location */}
      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={300}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1.5 }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 text-sm font-semibold text-blue-600">📍 現在地</div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Parking Lots */}
      {lots.map((lot) => {
        const dist = userLocation
          ? calcDistance(userLocation.lat, userLocation.lng, lot.latitude, lot.longitude)
          : null;
        return (
          <Marker
            key={lot.id}
            position={[lot.latitude, lot.longitude]}
            icon={createCustomIcon(lot.current_count, lot.total_capacity)}
          >
            <Popup className="custom-popup">
              <div className="min-w-[220px] p-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm">{lot.name}</h3>
                  <StatusBadge current={lot.current_count} total={lot.total_capacity} />
                </div>
                <CapacityBar current={lot.current_count} total={lot.total_capacity} />
                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">{lot.address}</p>
                <p className="text-xs text-muted-foreground mt-1"><span className="font-medium px-1 border border-primary/30 rounded text-primary/80 mr-1">料金</span>{lot.fee}</p>
                {dist !== null && (
                  <p className="text-xs font-medium text-primary mt-1">
                    📍 現在地から {formatDistance(dist)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
