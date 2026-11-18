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
  mode?: DrawMode;
}

export type DrawMode = 'participants' | 'prizes' | 'qa'; // 'participants': 抽參與者; 'prizes': 抽獎項; 'qa': 上台回答問題

export interface QAModeConfig {
  type: 'range' | 'custom';
  rangeStart: number;
  rangeEnd: number;
  customInput: string; // e.g. "1, 3, 7, 10"
  padDigits: number;
  prefix: string;
  excludeCalled: boolean;
  calledCodes: string[];
  questionTitle: string; // e.g. "第 1 題回答者"
}

