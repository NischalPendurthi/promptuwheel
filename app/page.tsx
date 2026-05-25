"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import TopicSelector from "@/components/TopicSelector";
import DifficultySelector from "@/components/DifficultySelector";
import KeywordCard from "@/components/KeywordCard";
import LLMHelper from "@/components/LLMHelper";
import SessionHistory from "@/components/SessionHistory";
import UserGate from "@/components/UserGate";
import { filterKeywords, pickRandom, keyId, type Keyword } from "@/lib/keywords";
import type { HistoryEntry, UserRecord, Difficulty } from "@/lib/types";

const SPIN_DURATION_MS = 1200;

async function patchUser(payload: Record<string, unknown>) {
  await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function AppContent({ user, logout }: { user: UserRecord; logout: () => void }) {
  const [history, setHistory] = useState<HistoryEntry[]>(user.history);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(user.preferences.topics);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(user.preferences.difficulties);
  const [currentKeyword, setCurrentKeyword] = useState<Keyword | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState<"llm" | "history">("history");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Track save state
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seenIds = useMemo(() => new Set(history.map((h) => keyId(h.keyword))), [history]);

  const pool = useMemo(
    () => filterKeywords(selectedTopics, selectedDifficulties, seenIds),
    [selectedTopics, selectedDifficulties, seenIds]
  );

  const spinPool = useMemo(() => pool.slice(0, 30).map((k) => k.keyword), [pool]);

  // Debounced save to server
  function scheduleSave(username: string, patch: Record<string, unknown>) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await patchUser({ username, ...patch });
      setSaving(false);
    }, 600);
  }

  function updateHistory(next: HistoryEntry[]) {
    setHistory(next);
    scheduleSave(user.username, { history: next });
  }

  function updateTopics(topics: string[]) {
    setSelectedTopics(topics);
    scheduleSave(user.username, {
      preferences: { topics, difficulties: selectedDifficulties },
    });
  }

  function updateDifficulties(difficulties: Difficulty[]) {
    setSelectedDifficulties(difficulties);
    scheduleSave(user.username, {
      preferences: { topics: selectedTopics, difficulties },
    });
  }

  const spin = useCallback(() => {
    if (isSpinning || pool.length === 0) return;
    setIsSpinning(true);
    setCurrentKeyword(null);

    setTimeout(() => {
      const picked = pickRandom(pool);
      setIsSpinning(false);
      if (picked) {
        setCurrentKeyword(picked);
        const entry: HistoryEntry = { keyword: picked, status: "seen", timestamp: Date.now() };
        updateHistory([...history, entry]);
      }
    }, SPIN_DURATION_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, pool, history]);

  function handleSkip() {
    if (!currentKeyword) return;
    const id = keyId(currentKeyword);
    const next = history.map((h) =>
      keyId(h.keyword) === id && h.status === "seen" ? { ...h, status: "skipped" as const } : h
    );
    updateHistory(next);
    setCurrentKeyword(null);
  }

  function handleMarkKnown() {
    if (!currentKeyword) return;
    const id = keyId(currentKeyword);
    const next = history.map((h) =>
      keyId(h.keyword) === id && h.status === "seen" ? { ...h, status: "known" as const } : h
    );
    updateHistory(next);
    setCurrentKeyword(null);
  }

  function handleClearHistory() {
    updateHistory([]);
    setCurrentKeyword(null);
  }

  const knownCount = history.filter((h) => h.status === "known").length;

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] bg-[#0f0f13]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold">
              P
            </div>
            <span className="font-bold text-lg tracking-tight">
              PromptU<span className="text-purple-400">Wheel</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Save indicator */}
            {saving && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                Saving...
              </span>
            )}

            {/* Progress badge */}
            {history.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {history.length} seen · {knownCount} known
              </div>
            )}

            <span className="text-xs text-gray-600 hidden sm:block">{pool.length} left</span>

            {/* User badge + logout */}
            <div className="flex items-center gap-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-1.5">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs font-bold">
                {user.username[0].toUpperCase()}
              </span>
              <span className="text-xs text-gray-300">{user.username}</span>
              <button
                onClick={logout}
                className="text-xs text-gray-600 hover:text-red-400 transition-colors ml-1"
                title="Switch user"
              >
                ×
              </button>
            </div>

            <button
              onClick={() => setMobilePanelOpen((o) => !o)}
              className="lg:hidden px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-gray-400"
            >
              {mobilePanelOpen ? "Close" : "History / AI"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          {/* ── Left sidebar ─────────────────────────────── */}
          <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-5 sticky top-20">
            <TopicSelector selected={selectedTopics} onChange={updateTopics} />
            <div className="border-t border-[#2a2a3a]" />
            <DifficultySelector selected={selectedDifficulties} onChange={updateDifficulties} />
          </aside>

          {/* ── Center ──────────────────────────────── */}
          <main className="flex-1 flex flex-col gap-6">
            <div className="lg:hidden space-y-4">
              <TopicSelector selected={selectedTopics} onChange={updateTopics} />
              <DifficultySelector selected={selectedDifficulties} onChange={updateDifficulties} />
              <div className="border-t border-[#2a2a3a]" />
            </div>

            <KeywordCard
              keyword={currentKeyword}
              isSpinning={isSpinning}
              spinPool={spinPool}
              onSpin={spin}
              onSkip={handleSkip}
              onMarkKnown={handleMarkKnown}
              poolSize={pool.length}
            />

            <div className={`lg:hidden ${mobilePanelOpen ? "block" : "hidden"}`}>
              <div className="flex gap-1 bg-[#13131a] rounded-lg p-1 mb-3">
                <button
                  onClick={() => setActiveTab("llm")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "llm" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  AI Helper
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "history" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  History ({history.length})
                </button>
              </div>
              {activeTab === "llm" ? (
                <LLMHelper keyword={currentKeyword} />
              ) : (
                <SessionHistory history={history} onClearHistory={handleClearHistory} />
              )}
            </div>
          </main>

          {/* ── Right sidebar ──────────────────────────────── */}
          <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-4 sticky top-20">
            <div className="flex gap-1 bg-[#13131a] rounded-lg p-1">
              <button
                onClick={() => setActiveTab("llm")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "llm" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                AI Helper
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "history" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                History ({history.length})
              </button>
            </div>
            {activeTab === "llm" ? (
              <LLMHelper keyword={currentKeyword} />
            ) : (
              <SessionHistory history={history} onClearHistory={handleClearHistory} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <UserGate>
      {(user, logout) => <AppContent user={user} logout={logout} />}
    </UserGate>
  );
}
