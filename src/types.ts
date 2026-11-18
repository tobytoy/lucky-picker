export interface Participant {
  id: string;
  code: string;       // e.g., "001", "1", "A-12"
  name?: string;      // optional display name, e.g., "張小明"
  weight?: number;    // default 1
  isWon?: boolean;    // whether already won a prize
  wonPrizeId?: string;
  wonAt?: string;
}

export interface Prize {
  id: string;
  name: string;       // e.g. "特獎：iPhone 16 Pro"
  count: number;      // total quantity
  remaining: number;  // remaining available
  color: string;      // slice/card color
  icon?: string;      // emoji or icon key
}

export interface DrawRecord {
  id: string;
  timestamp: string;
  participantId?: string;
  participantCode: string;
  participantName?: string;
  prizeId?: string;
  prizeName: string;
}

export type DrawMode = 'participants' | 'prizes'; // 'participants': 輪盤轉人抽選定獎項; 'prizes': 輪盤轉獎品
