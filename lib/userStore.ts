import { kv } from "@vercel/kv";
import type { UserRecord, HistoryEntry, UserPreferences } from "@/lib/types";

const key = (username: string) => `user:${username.toLowerCase()}`;

export async function getUser(username: string): Promise<UserRecord | null> {
  return kv.get<UserRecord>(key(username));
}

export async function getAllUsernames(): Promise<string[]> {
  const keys = await kv.keys("user:*");
  return keys.map((k) => k.replace("user:", ""));
}

export async function createUser(username: string): Promise<UserRecord> {
  const existing = await kv.get<UserRecord>(key(username));
  if (existing) return existing;

  const user: UserRecord = {
    username: username.toLowerCase(),
    createdAt: new Date().toISOString(),
    preferences: { topics: [], difficulties: [] },
    history: [],
  };
  await kv.set(key(username), user);
  return user;
}

export async function saveHistory(username: string, history: HistoryEntry[]): Promise<boolean> {
  const user = await kv.get<UserRecord>(key(username));
  if (!user) return false;
  await kv.set(key(username), { ...user, history });
  return true;
}

export async function savePreferences(username: string, preferences: UserPreferences): Promise<boolean> {
  const user = await kv.get<UserRecord>(key(username));
  if (!user) return false;
  await kv.set(key(username), { ...user, preferences });
  return true;
}
