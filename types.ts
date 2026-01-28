
export interface DivinationInput {
  itemName: string;
  lostLocation: string;
  direction: string;
  lostTime: string;
  manualYao?: {
    val: number; // 6, 7, 8, 9
    isYang: boolean;
    isMoving: boolean;
  }[];
}

export type Language = 'en' | 'zh' | 'tw' | 'ko';

export interface DivinationResult {
  // Text results for all languages
  meihua: Record<Language, string>;
  xiaoliuren: Record<Language, string>;
  liuyao: Record<Language, string>;
  summary: Record<Language, string>;
  locationAnalysis: Record<Language, string>;
  
  probability: number; // Percentage of finding luck
  
  // Metaphysical Metadata (Language agnostic or EN default for logic)
  itemCategory: string; // e.g., 'Wealth', 'Parent'
  usefulGodElement: string; // 'Metal', 'Wood', etc.
}

export interface AiInsightResult {
  content: string;
  groundingSources?: {
    uri: string;
    title: string;
  }[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: DivinationInput;
  result: DivinationResult;
  aiInsight?: AiInsightResult;
  found?: boolean; // True if user confirmed they found it
}

export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  NORTHEAST = 'NORTHEAST',
  NORTHWEST = 'NORTHWEST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTHWEST = 'SOUTHWEST',
  CENTER = 'CENTER',
  UNKNOWN = 'UNKNOWN'
}
