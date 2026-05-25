"use client";

import { useState, useEffect } from "react";
import type { UserRecord } from "@/lib/types";

const LOCAL_KEY = "pw_username";

interface Props {
  children: (user: UserRecord, logout: () => void) => React.ReactNode;
}

export default function UserGate({ children }: Props) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingNames, setExistingNames] = useState<string[]>([]);

  // On mount: try to restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      fetchUser(saved).finally(() => setLoading(false));
    } else {
      loadExistingNames();
      setLoading(false);
    }
  }, []);

  async function fetchUser(username: string) {
    try {
      const res = await fetch(`/api/user?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data: UserRecord = await res.json();
        setUser(data);
        localStorage.setItem(LOCAL_KEY, data.username);
      } else {
        // Saved username no longer exists — clear it
        localStorage.removeItem(LOCAL_KEY);
        loadExistingNames();
      }
    } catch {
      localStorage.removeItem(LOCAL_KEY);
      loadExistingNames();
    }
  }

  async function loadExistingNames() {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setExistingNames(data.usernames ?? []);
      }
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setUser(data as UserRecord);
        localStorage.setItem(LOCAL_KEY, data.username);
      }
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem(LOCAL_KEY);
    setUser(null);
    setInput("");
    setError("");
    loadExistingNames();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold mb-4">
              P
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              PromptU<span className="text-purple-400">Wheel</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Enter a username to track your progress</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Username
              </label>
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                placeholder="e.g. nischal"
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <p className="text-xs text-gray-600">
                New username? We&apos;ll create your account automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className={`
                w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${submitting || !input.trim()
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.01]"
                }
              `}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                "Continue →"
              )}
            </button>
          </form>

          {/* Existing users quick-pick */}
          {existingNames.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-gray-600 mb-2 text-center">or pick an existing profile</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {existingNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => { setInput(name); }}
                    className="px-3 py-1.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-sm text-gray-400 hover:border-purple-500 hover:text-gray-200 transition-all"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children(user, logout)}</>;
}
