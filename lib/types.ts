import type { Keyword, Difficulty } from "@/lib/keywords";

export type { Keyword, Difficulty };

export type HistoryStatus = "seen" | "known" | "skipped";

export interface HistoryEntry {
  keyword: Keyword;
  status: HistoryStatus;
  timestamp: number;
}

export interface UserPreferences {
  topics: string[];
  difficulties: Difficulty[];
}

export interface UserRecord {
  username: string;
  createdAt: string;
  preferences: UserPreferences;
  history: HistoryEntry[];
}
