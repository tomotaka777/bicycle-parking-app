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
  updated_date: string;
}

const mockData: BicycleParkingLot[] = [
  {
    id: "1",
    name: "梅田駅前第1駐輪場",
    station_name: "梅田駅",
    address: "大阪市北区梅田1-3-1",
    current_count: 70,
    total_capacity: 250,
    parking_type: "地下式",
    latitude: 34.702485,
    longitude: 135.495951,
    updated_date: new Date().toISOString(),
  },
  {
    id: "2",
    name: "梅田駅前第2駐輪場",
    station_name: "梅田駅",
    address: "大阪市北区梅田2-4-9",
    current_count: 0, // 満車 (Danger/Red)
    total_capacity: 150,
    parking_type: "機械式",
    latitude: 34.699485,
    longitude: 135.492951,
    updated_date: new Date().toISOString(),
  },
  {
    id: "3",
    name: "東梅田駐輪場",
    station_name: "東梅田駅",
    address: "大阪市北区曾根崎2-10-5",
    current_count: 75,
    total_capacity: 120,
    parking_type: "屋根あり",
    latitude: 34.7001,
    longitude: 135.5002,
    updated_date: new Date().toISOString(),
  },
  {
    id: "4",
    name: "南森町駅前駐輪場",
    station_name: "南森町駅",
    address: "大阪市北区南森町1-4-19",
    current_count: 16, // 残りわずか (Warning/Yellow)
    total_capacity: 80,
    parking_type: "屋根あり",
    latitude: 34.6976,
    longitude: 135.5114,
    updated_date: new Date().toISOString(),
  },
  {
    id: "5",
    name: "西梅田駐輪場",
    station_name: "西梅田駅",
    address: "大阪市北区梅田2-2-22",
    current_count: 88,
    total_capacity: 100,
    parking_type: "屋根あり",
    latitude: 34.6985,
    longitude: 135.4938,
    updated_date: new Date().toISOString(),
  },
  {
    id: "signage_current",
    name: "グランフロント北館駐輪場",
    station_name: "大阪駅",
    address: "大阪市北区大深町",
    current_count: 150, // 空きあり
    total_capacity: 200,
    parking_type: "屋内",
    latitude: 34.705876,
    longitude: 135.494447,
    updated_date: new Date().toISOString(),
  },
  {
    id: "signage_A",
    name: "地下鉄中津駅管理駐輪場",
    station_name: "中津駅",
    address: "大阪市北区中津",
    current_count: 80, // 空きあり
    total_capacity: 100,
    parking_type: "屋外",
    latitude: 34.710,
    longitude: 135.496,
    updated_date: new Date().toISOString(),
  },
  {
    id: "signage_B",
    name: "グランフロント大阪駐輪場 南館",
    station_name: "大阪駅",
    address: "大阪市北区大深町",
    current_count: 10, // 残りわずか
    total_capacity: 150,
    parking_type: "屋内",
    latitude: 34.703,
    longitude: 135.495,
    updated_date: new Date().toISOString(),
  },
  {
    id: "signage_C",
    name: "ヨドバシカメラ駐輪場",
    station_name: "大阪駅",
    address: "大阪市北区大深町",
    current_count: 200, // 空きあり
    total_capacity: 300,
    parking_type: "屋内",
    latitude: 34.705,
    longitude: 135.497,
    updated_date: new Date().toISOString(),
  },
  {
    id: "signage_D",
    name: "芝田駐輪場",
    station_name: "大阪駅",
    address: "大阪市北区芝田",
    current_count: 0, // 満車
    total_capacity: 50,
    parking_type: "屋外",
    latitude: 34.707,
    longitude: 135.498,
    updated_date: new Date().toISOString(),
  }
];


export const firebaseClient = {
  BicycleParkingLot: {
    list: async (lat?: number, lng?: number): Promise<BicycleParkingLot[]> => {
      // Simulate network delay
      return new Promise((resolve) => setTimeout(() => resolve(mockData), 500));
    },
    subscribe: (callback: (data: BicycleParkingLot[]) => void) => {
      // Simulate real-time updates every 15 seconds
      const interval = setInterval(() => {
        // Randomly update some counts
        const updatedData = mockData.map(lot => {
          if (Math.random() > 0.5 && lot.total_capacity > 0) {
            // randomly fluctuate count, keep within bounds
            const change = Math.floor(Math.random() * 5) - 2; 
            const newCount = Math.max(0, Math.min(lot.total_capacity, lot.current_count + change));
            return { ...lot, current_count: newCount, updated_date: new Date().toISOString() };
          }
          return lot;
        });
        callback(updatedData);
      }, 15000);
      return () => clearInterval(interval);
    }
  }
};
