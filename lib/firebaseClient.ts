import osakaLotsRaw from '../data/osaka_lots.json';

export interface BicycleParkingLot {
  id: string;
  name: string;
  station_name: string;
  address: string;
  current_count: number;
  total_capacity: number;
  parking_type: string;
  latitude: number;
  longitude: number;
  full_probability?: number;
  location_landmark?: string;
  guide_html?: string;
  operating_hours?: string;
  fee?: string;
  updated_date: string;
}

// Map raw JSON to BicycleParkingLot
const osakaLots: BicycleParkingLot[] = osakaLotsRaw.map((lot: any) => ({
  id: lot.id,
  name: lot.name,
  station_name: "不明", 
  address: lot.address || "大阪市北区",
  current_count: lot.current_count,
  total_capacity: lot.total_capacity,
  parking_type: lot.parking_type || "不明",
  latitude: lot.lat,
  longitude: lot.lng,
  full_probability: lot.full_probability,
  location_landmark: lot.location_landmark || "",
  guide_html: lot.guide_html || "",
  operating_hours: "24時間", // Default, as API does not provide
  fee: "料金不明（現地確認）", // Default, as API does not provide
  updated_date: new Date().toISOString()
}));

const osakaTechLot: BicycleParkingLot = {
  id: "osaka_tech",
  name: "大阪国際工科専門職大学駐輪場",
  station_name: "大阪駅",
  address: "大阪市北区梅田3-3-1",
  current_count: 30,
  total_capacity: 100,
  parking_type: "屋内",
  latitude: 34.699799,
  longitude: 135.49311,
  updated_date: new Date().toISOString(),
};

let currentMockData = [...osakaLots, osakaTechLot];

// Fetch helper for Google Sheets CSV (for osaka_tech)
async function fetchSheetData() {
  try {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ4JidNBQtxwG8m2f2UwlAauzzmYz6luwL5oJUbWn7KyYUysL0FrTdtY7O9qok2DMZ_qZbusEU_fUf/pub?output=csv";
    const response = await fetch(`${url}&_t=${Date.now()}`);
    const text = await response.text();
    const firstLine = text.split('\n')[0];
    const columns = firstLine.split(',');
    if (columns.length >= 3) {
       const name = columns[0].trim();
       const total = parseInt(columns[1].trim(), 10);
       const current = parseInt(columns[2].trim(), 10);
       if (!isNaN(total) && !isNaN(current)) {
         return { name, total, current };
       }
    }
  } catch (err) {
    console.error("Failed to fetch sheet data", err);
  }
  return null;
}

// Fetch helper for API sync status (for the 50 lots)
async function fetchSyncStatus() {
  try {
    const res = await fetch(`/api/sync-status?_t=${Date.now()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch sync status", e);
  }
  return null;
}

export const firebaseClient = {
  BicycleParkingLot: {
    list: async (lat?: number, lng?: number): Promise<BicycleParkingLot[]> => {
      // Fetch initial syncs
      const [sheetData, syncStatus] = await Promise.all([
        fetchSheetData(),
        fetchSyncStatus()
      ]);

      currentMockData = currentMockData.map(lot => {
        if (lot.id === "osaka_tech" && sheetData) {
          return { ...lot, current_count: sheetData.current, total_capacity: sheetData.total, name: sheetData.name, updated_date: new Date().toISOString() };
        } else if (syncStatus && syncStatus.slots && syncStatus.slots[lot.id] !== undefined) {
          const available = syncStatus.slots[lot.id];
          const currentCount = Math.max(0, lot.total_capacity - available);
          const fullProb = syncStatus.probabilities && syncStatus.probabilities[lot.id] !== undefined 
            ? syncStatus.probabilities[lot.id] 
            : lot.full_probability;
            
          return { ...lot, current_count: currentCount, full_probability: fullProb, updated_date: new Date().toISOString() };
        }
        return lot;
      });
      return currentMockData;
    },
    subscribe: (callback: (data: BicycleParkingLot[]) => void) => {
      // Call once initially
      firebaseClient.BicycleParkingLot.list().then(data => callback(data));

      const interval = setInterval(async () => {
        const [sheetData, syncStatus] = await Promise.all([
          fetchSheetData(),
          fetchSyncStatus()
        ]);
        
        let hasChanges = false;
        const newData = currentMockData.map(lot => {
          if (lot.id === "osaka_tech" && sheetData) {
             if (lot.current_count !== sheetData.current) hasChanges = true;
             return { ...lot, current_count: sheetData.current, total_capacity: sheetData.total, name: sheetData.name, updated_date: new Date().toISOString() };
          } else if (syncStatus && syncStatus.slots && syncStatus.slots[lot.id] !== undefined) {
             const available = syncStatus.slots[lot.id];
             const currentCount = Math.max(0, lot.total_capacity - available);
             const fullProb = syncStatus.probabilities && syncStatus.probabilities[lot.id] !== undefined 
                ? syncStatus.probabilities[lot.id] 
                : lot.full_probability;
                
             if (lot.current_count !== currentCount || lot.full_probability !== fullProb) hasChanges = true;
             return { ...lot, current_count: currentCount, full_probability: fullProb, updated_date: new Date().toISOString() };
          }
          return lot;
        });
        
        if (hasChanges) {
          currentMockData = newData;
          callback(currentMockData);
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }
};
