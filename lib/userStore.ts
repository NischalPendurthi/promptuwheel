import { Redis } from "@upstash/redis";
import type { UserRecord, HistoryEntry, UserPreferences } from "@/lib/types";

// Vercel injects KV_REST_API_URL and KV_REST_API_TOKEN when you connect Upstash
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const key = (username: string) => `user:${username.toLowerCase()}`;

export async function getUser(username: string): Promise<UserRecord | null> {
  return redis.get<UserRecord>(key(username));
}

export async function getAllUsernames(): Promise<string[]> {
  const keys = await redis.keys("user:*");
  return keys.map((k) => k.replace("user:", ""));
}

export async function createUser(username: string): Promise<UserRecord> {
  const existing = await redis.get<UserRecord>(key(username));
  if (existing) return existing;

  const user: UserRecord = {
    username: username.toLowerCase(),
    createdAt: new Date().toISOString(),
    preferences: { topics: [], difficulties: [] },
    history: [],
  };
  await redis.set(key(username), user);
  return user;
}

export async function saveHistory(username: string, history: HistoryEntry[]): Promise<boolean> {
  const user = await redis.get<UserRecord>(key(username));
  if (!user) return false;
  await redis.set(key(username), { ...user, history });
  return true;
}

export async function savePreferences(username: string, preferences: UserPreferences): Promise<boolean> {
  const user = await redis.get<UserRecord>(key(username));
  if (!user) return false;
  await redis.set(key(username), { ...user, preferences });
  return true;
}
