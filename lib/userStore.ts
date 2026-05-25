import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { UserRecord, HistoryEntry, UserPreferences } from "@/lib/types";

const DB_PATH = join(process.cwd(), "data", "users.json");

interface UsersDB {
  users: Record<string, UserRecord>;
}

function readDB(): UsersDB {
  if (!existsSync(DB_PATH)) {
    return { users: {} };
  }
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8")) as UsersDB;
  } catch {
    return { users: {} };
  }
}

function writeDB(db: UsersDB): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function getUser(username: string): UserRecord | null {
  const db = readDB();
  return db.users[username.toLowerCase()] ?? null;
}

export function getAllUsernames(): string[] {
  const db = readDB();
  return Object.keys(db.users);
}

export function createUser(username: string): UserRecord {
  const db = readDB();
  const key = username.toLowerCase();
  if (db.users[key]) return db.users[key];
  const user: UserRecord = {
    username: key,
    createdAt: new Date().toISOString(),
    preferences: { topics: [], difficulties: [] },
    history: [],
  };
  db.users[key] = user;
  writeDB(db);
  return user;
}

export function saveHistory(username: string, history: HistoryEntry[]): boolean {
  const db = readDB();
  const key = username.toLowerCase();
  if (!db.users[key]) return false;
  db.users[key].history = history;
  writeDB(db);
  return true;
}

export function savePreferences(username: string, preferences: UserPreferences): boolean {
  const db = readDB();
  const key = username.toLowerCase();
  if (!db.users[key]) return false;
  db.users[key].preferences = preferences;
  writeDB(db);
  return true;
}
