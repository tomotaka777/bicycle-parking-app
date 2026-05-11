"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issues in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createCustomIcon(current: number, total: number, label: string) {
  const available = total - current;
  const ratio = available / total;
  let color;
  
  if (available <= 0) {
    color = "#D94F4F"; // Danger/Red
  } else if (ratio <= 0.2) {
    color = "#B9892A"; // Warning/Yellow
  } else {
    color = "#348A54"; // Success/Green
  }

  return L.divIcon({
    className: "custom-signage-marker",
    html: `
      <div style="
        position: relative;
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 14px; font-weight: 900;
      ">
        ${label}
        <div style="
          position: absolute;
          bottom: -8px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function createClosestLotIcon(current: number, total: number) {
  const available = total - current;
  const ratio = available / total;
  let color;
  
  if (available <= 0) {
    color = "#D94F4F"; // Danger/Red
  } else if (ratio <= 0.2) {
    color = "#B9892A"; // Warning/Yellow
  } else {
    color = "#348A54"; // Success/Green
  }

  return L.divIcon({
    className: "closest-lot-marker",
    html: `
      <div style="
        position: relative;
        background: ${color};
        border: 3px solid white;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 14px; font-weight: 900;
        padding: 6px 12px;
        white-space: nowrap;
      ">
        ★ 一番近い
        <div style="
          position: absolute;
          bottom: -8px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [100, 44],
    iconAnchor: [50, 44],
    popupAnchor: [0, -44],
  });
}

const currentLocationIcon = L.divIcon({
  className: "current-location-marker",
  html: `
    <div style="
      position: relative;
      width: 44px; height: 44px;
      background: #137A74;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(19,122,116,0.6);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="width: 16px; height: 16px; background: white; border-radius: 50%;"></div>
      <div style="
          position: absolute;
          bottom: -10px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid #137A74;
        "></div>
    </div>
  `,
  iconSize: [44, 54],
  iconAnchor: [22, 54],
});

export default function SignageMap({ center, lots, currentLot }: { center: {lat: number, lng: number}, lots: any[], currentLot?: any }) {
  // Use a slight filter to make the map match the teal theme better
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        className="brightness-95 contrast-100 hue-rotate-15 saturate-50"
      />

      <Circle
        center={[center.lat, center.lng]}
        radius={200}
        pathOptions={{ color: "#137A74", fillColor: "#137A74", fillOpacity: 0.1, weight: 2 }}
      />
      <Circle
        center={[center.lat, center.lng]}
        radius={400}
        pathOptions={{ color: "#137A74", fillColor: "#137A74", fillOpacity: 0.05, weight: 1, dashArray: "5, 5" }}
      />

      <Marker position={[center.lat, center.lng]} icon={currentLocationIcon} />

      {currentLot && (
        <Marker
          position={[currentLot.latitude, currentLot.longitude]}
          icon={createClosestLotIcon(currentLot.current_count, currentLot.total_capacity)}
        />
      )}

      {lots.map((lot, idx) => {
        const letters = ["A", "B", "C", "D"];
        const letter = letters[idx] || "";
        return (
          <Marker
            key={lot.id}
            position={[lot.latitude, lot.longitude]}
            icon={createCustomIcon(lot.current_count, lot.total_capacity, letter)}
          />
        );
      })}
    </MapContainer>
  );
}
