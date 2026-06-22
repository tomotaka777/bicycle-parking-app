"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bike, MapPin, CheckCircle2, AlertTriangle, XCircle, ArrowUp, ArrowDown, ArrowRight, ArrowUpRight, ArrowDownRight, ArrowDownLeft, ArrowLeft, ArrowUpLeft } from "lucide-react";
import { firebaseClient } from "@/lib/firebaseClient";
import dynamic from "next/dynamic";
import useUserLocation, { calcDistance, formatDistance } from "@/hooks/useUserLocation";
import QRCode from "react-qr-code";

// Dynamically import the map to avoid SSR issues with Leaflet
const SignageMap = dynamic(() => import("@/components/parking/SignageMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#DDEBDE] text-[#137A74] font-bold">マップを読み込み中...</div>
});

function getSignageStatus(current: number, total: number) {
  const available = total - current;
  const ratio = available / total;
  
  if (available <= 0) {
    return { level: "danger", label: "満車", colorClass: "text-[#D94F4F]", icon: XCircle, iconBg: "bg-[#D94F4F]" };
  } else if (ratio <= 0.2) {
    return { level: "warning", label: "残りわずか", colorClass: "text-[#C69227]", icon: AlertTriangle, iconBg: "bg-[#C69227]" };
  } else {
    return { level: "success", label: "空きあり", colorClass: "text-[#4A8F64]", icon: CheckCircle2, iconBg: "bg-[#4A8F64]" };
  }
}

function calcBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = toDeg(Math.atan2(y, x));
  
  const normalized = (brng + 360) % 360;
  
  if (normalized >= 337.5 || normalized < 22.5) return { dir: "北", enDir: "North", icon: ArrowUp };
  if (normalized >= 22.5 && normalized < 67.5) return { dir: "北東", enDir: "North-East", icon: ArrowUpRight };
  if (normalized >= 67.5 && normalized < 112.5) return { dir: "東", enDir: "East", icon: ArrowRight };
  if (normalized >= 112.5 && normalized < 157.5) return { dir: "南東", enDir: "South-East", icon: ArrowDownRight };
  if (normalized >= 157.5 && normalized < 202.5) return { dir: "南", enDir: "South", icon: ArrowDown };
  if (normalized >= 202.5 && normalized < 247.5) return { dir: "南西", enDir: "South-West", icon: ArrowDownLeft };
  if (normalized >= 247.5 && normalized < 292.5) return { dir: "西", enDir: "West", icon: ArrowLeft };
  if (normalized >= 292.5 && normalized < 337.5) return { dir: "北西", enDir: "North-West", icon: ArrowUpLeft };
  return { dir: "北", enDir: "North", icon: ArrowUp };
}

export default function SignagePage() {
  const queryClient = useQueryClient();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  const { data: lots = [] } = useQuery({
    queryKey: ["parking-lots-signage"],
    queryFn: () => firebaseClient.BicycleParkingLot.list(),
  });

  useEffect(() => {
    const unsubscribe = firebaseClient.BicycleParkingLot.subscribe((updatedData) => {
      queryClient.setQueryData(["parking-lots-signage"], updatedData);
    });
    
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      unsubscribe();
      clearInterval(timeInterval);
    };
  }, [queryClient]);

  // Calculate distances for all lots from fixed Osaka Tech location
  const lotsWithDistance = useMemo(() => {
    if (!lots.length) return [];
    
    // Fixed location: Osaka Tech
    const lat = 34.699799;
    const lng = 135.49311;

    const withDistance = lots
      .filter(l => l.latitude && l.id !== "osaka_tech")
      .map(lot => {
        const dist = calcDistance(lat, lng, lot.latitude, lot.longitude);
        const bearing = calcBearing(lat, lng, lot.latitude, lot.longitude);
        const p = lot.full_probability ?? (lot.total_capacity > 0 ? lot.current_count / lot.total_capacity : 1);
        const score = dist * (1 + p);
        return { ...lot, dist, bearing, score };
      });
    
    withDistance.sort((a, b) => a.score - b.score);
    return withDistance;
  }, [lots]);

  const currentLot = lotsWithDistance[0] || {
    name: "読み込み中...", current_count: 0, total_capacity: 1, dist: 0
  };
  const closestLots = lotsWithDistance.slice(1, 5);

  const renderProgressBar = (current: number, total: number) => {
    const available = total - current;
    const ratio = Math.max(0, Math.min(1, available / total));
    const activeBoxes = Math.round(ratio * 10);
    
    return (
      <div className="flex gap-1 mt-1">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`h-4 w-[22px] rounded-sm ${i < activeBoxes ? "bg-[#5E9B68]" : "bg-gray-200"}`}
          />
        ))}
      </div>
    );
  };

  const ListItem = ({ lot, letter }: any) => {
    if (!lot) return null;
    const status = getSignageStatus(lot.current_count, lot.total_capacity);
    const Icon = status.icon;
    const DirIcon = lot.bearing.icon;

    return (
      <div className="flex items-center justify-between bg-white rounded-xl mb-2 px-4 py-3 shadow-sm border-l-[12px] border-[#137A74]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#137A74] rounded-lg flex items-center justify-center">
            <Bike className="text-white w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{letter}. {lot.name || "駐輪場"}</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-2xl font-bold text-[#137A74]">{formatDistance(lot.dist)}</span>
              <div className="w-[1px] h-6 bg-gray-300"></div>
              <div className="flex items-center gap-1 text-gray-600">
                <DirIcon className="w-5 h-5 font-bold" strokeWidth={3} />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold">{lot.bearing.dir}</span>
                  <span className="text-[10px] text-gray-400">{lot.bearing.enDir}</span>
                </div>
              </div>
              <div className="w-[1px] h-6 bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold text-gray-600">予測</span>
                  <span className="text-[10px] text-gray-400">{lot.full_probability !== undefined ? `${(lot.full_probability * 100).toFixed(0)}%` : "不明"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#137A74] mb-1">空き状況</span>
            <span className={`text-2xl font-black tracking-tight ${status.colorClass}`}>
              {status.label}
            </span>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${status.iconBg}`}>
            <Icon className="text-white w-9 h-9" strokeWidth={3} />
          </div>
        </div>
      </div>
    );
  };

  const currentStatus = getSignageStatus(currentLot.current_count, currentLot.total_capacity);
  const CurrentIcon = currentStatus.icon;
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-[#137A74] flex flex-col font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-start text-white">
        <div className="flex gap-4 items-start mt-2">
          <Bike className="w-14 h-14 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <h1 className="text-4xl font-bold tracking-wider mb-2">梅田周辺 駐輪場ルート案内</h1>
            <p className="text-base font-medium">大阪国際工科専門職大学から、周辺エリアの<br/>駐輪場までのルートと空き状況をご案内します。</p>
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg text-center shadow-lg">
          <p className="text-[10px] text-gray-800 font-bold mb-1">詳細はこちら</p>
          <div className="w-20 h-20 bg-white flex items-center justify-center">
            <QRCode value="https://bicycle-parking-app.vercel.app/" size={80} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 flex flex-col gap-3 pb-4">
        
        {/* Current Location Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="bg-[#B9892A] text-white text-lg font-bold px-4 py-1.5 rounded-r-full inline-flex items-center gap-2 -ml-5 mb-2 shadow-sm">
                <span>★</span>おすすめの駐輪場
              </div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-3">{currentLot.name}</h2>
              <div className="flex items-center gap-3">
                <MapPin className="text-[#137A74] w-7 h-7" fill="#137A74" stroke="white" />
                <span className="text-4xl font-bold text-[#137A74]">{formatDistance(currentLot.dist)}</span>
                <div className="w-[1px] h-8 bg-gray-300 mx-2"></div>
                <span className="text-gray-600 font-medium text-lg">おすすめの駐輪場です</span>
                {currentLot.full_probability !== undefined && (
                  <>
                    <div className="w-[1px] h-8 bg-gray-300 mx-2"></div>
                    <span className="text-gray-600 font-medium text-lg">予測: {(currentLot.full_probability * 100).toFixed(0)}%</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-[1px] h-24 bg-gray-200 mx-6"></div>
            
            <div className="flex flex-col justify-center items-end min-w-[200px]">
              <div className="text-sm font-bold text-[#137A74] w-full text-left mb-1">空き状況</div>
              <div className="flex items-center gap-4 mb-2 w-full justify-between">
                <span className={`text-5xl font-black tracking-tight ${currentStatus.colorClass}`}>
                  {currentStatus.label}
                </span>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentStatus.iconBg} shadow-sm`}>
                  <CurrentIcon className="text-white w-9 h-9" strokeWidth={3} />
                </div>
              </div>
              <div className="w-full">
                <div className="text-[10px] text-gray-500 font-bold mb-1">利用状況</div>
                {renderProgressBar(currentLot.current_count, currentLot.total_capacity)}
              </div>
            </div>
          </div>
        </div>

        {/* Real Map Area */}
        <div className="bg-white rounded-[24px] h-[360px] relative overflow-hidden shadow-inner border-4 border-white flex items-center justify-center">
          {currentLot.latitude && closestLots.length > 0 && (
            <SignageMap 
              center={{lat: 34.699799, lng: 135.49311}} 
              lots={closestLots} 
              currentLot={currentLot}
            />
          )}
        </div>

        {/* Dynamic List Area */}
        <div className="flex flex-col mt-2">
          {closestLots.map((lot, idx) => (
             <ListItem key={lot.id} lot={lot} letter={letters[idx]} />
          ))}
        </div>

        {/* Detail Map Image Area */}
        <div className="mt-2 bg-white rounded-[24px] h-[360px] relative overflow-hidden shadow-lg flex border-4 border-white">
          {/* 左側: カメラ画像 */}
          <div className="w-1/2 h-full bg-gray-50/50 flex items-center justify-center border-r border-gray-100">
            <img 
              src={`/api/drive-image?id=1MRkL6KR4cIrCiTA28xipCL2Lff_iiVBd&t=${Date.now()}`}
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/1200x600/e2e8f0/475569?text=Image+Load+Error";
              }}
              alt="Parking Layout" 
              className="w-full h-full object-contain mix-blend-multiply p-2"
            />
          </div>
          
          {/* 右側: 説明文 */}
          <div className="w-1/2 h-full p-8 flex flex-col justify-center bg-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#137A74] text-white rounded-xl flex items-center justify-center shadow-sm">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">現在の駐輪スペース状況</h3>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium">
              現在地の<span className="font-bold text-[#137A74] mx-1">大阪国際工科専門職大学駐輪場</span>の様子をAIカメラでリアルタイム解析しています。<br />
              各スペースの空き状況が一目でわかります。
            </p>
            
            <div className="flex flex-col gap-5 bg-gray-50/80 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-md bg-green-500/20 border-2 border-green-500 shadow-sm flex-shrink-0"></div>
                <span className="text-xl font-bold text-gray-800 tracking-wide">緑色 <span className="text-gray-500 font-medium ml-2">... 今すぐ駐輪できます</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-md bg-red-500/20 border-2 border-red-500 shadow-sm flex-shrink-0"></div>
                <span className="text-xl font-bold text-gray-800 tracking-wide">赤色 <span className="text-gray-500 font-medium ml-2">... 既に埋まっています</span></span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#0F605A] text-white px-6 py-4 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-3">
          <Bike className="w-8 h-8 opacity-80" />
          <p>ルールを守って、きれいに使いましょう。<br/>放置自転車はやめましょう。</p>
        </div>
        <div className="text-right">
          <p className="text-base">更新時刻 <span className="font-bold text-xl">{timeStr}</span></p>
          <p className="text-gray-300 font-mono tracking-widest">{dateStr}</p>
        </div>
      </footer>
    </div>
  );
}
