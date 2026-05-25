import { NextRequest, NextResponse } from "next/server";
import {
  getUser,
  createUser,
  saveHistory,
  savePreferences,
  getAllUsernames,
} from "@/lib/userStore";
import type { HistoryEntry, UserPreferences } from "@/lib/types";

// GET /api/user?username=xxx  — fetch user (or list all usernames)
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ usernames: getAllUsernames() });
  }

  const user = getUser(username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

// POST /api/user  — register (or re-login) a user
// body: { username: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username: string = (body.username ?? "").trim();

  if (!username || username.length < 2) {
    return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return NextResponse.json(
      { error: "Username can only contain letters, numbers, _ and -" },
      { status: 400 }
    );
  }

  const user = createUser(username);
  return NextResponse.json(user, { status: 200 });
}

// PATCH /api/user  — save history or preferences for a user
// body: { username, history? } | { username, preferences? }
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username: string = (body.username ?? "").trim();

  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  if (body.history !== undefined) {
    const ok = saveHistory(username, body.history as HistoryEntry[]);
    if (!ok) return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.preferences !== undefined) {
    const ok = savePreferences(username, body.preferences as UserPreferences);
    if (!ok) return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
