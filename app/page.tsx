"use client";

import { useMemo, useCallback, useEffect } from "react";
import TopicSelector from "@/components/TopicSelector";
import DifficultySelector from "@/components/DifficultySelector";
import KeywordCard from "@/components/KeywordCard";
import LLMHelper from "@/components/LLMHelper";
import SessionHistory, { type HistoryEntry } from "@/components/SessionHistory";
import { filterKeywords, pickRandom, keyId, type Keyword, type Difficulty } from "@/lib/keywords";
import { useLocalStorage } from "@/lib/useLocalStorage";

const SPIN_DURATION_MS = 1200;
const STORAGE_KEYS = {
  history: "pw_history",
  topics: "pw_topics",
  difficulties: "pw_difficulties",
  activeTab: "pw_tab",
};

export default function Home() {
  const [history, setHistory, clearHistory, historyHydrated] = useLocalStorage<HistoryEntry[]>(STORAGE_KEYS.history, []);
  const [selectedTopics, setSelectedTopics] = useLocalStorage<string[]>(STORAGE_KEYS.topics, []);
  const [selectedDifficulties, setSelectedDifficulties] = useLocalStorage<Difficulty[]>(STORAGE_KEYS.difficulties, []);
  const [activeTab, setActiveTab] = useLocalStorage<"llm" | "history">(STORAGE_KEYS.activeTab, "history");

  // currentKeyword is ephemeral (not persisted — you were mid-spin when you left)
  const [currentKeyword, setCurrentKeyword] = useLocalStorage<Keyword | null>("pw_current", null);
  const [isSpinning, setIsSpinning] = useLocalStorage<boolean>("pw_spinning", false);
  const [mobilePanelOpen, setMobilePanelOpen] = useLocalStorage<boolean>("pw_mobile_panel", false);

  // Rebuild seenIds from persisted history
  const seenIds = useMemo(
    () => new Set(history.map((h) => keyId(h.keyword))),
    [history]
  );

  // Reset spinning state on mount (in case app was closed mid-spin)
  useEffect(() => {
    if (historyHydrated) setIsSpinning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyHydrated]);

  const pool = useMemo(
    () => filterKeywords(selectedTopics, selectedDifficulties, seenIds),
    [selectedTopics, selectedDifficulties, seenIds]
  );

  const spinPool = useMemo(
    () => pool.slice(0, 30).map((k) => k.keyword),
    [pool]
  );

  const spin = useCallback(() => {
    if (isSpinning || pool.length === 0) return;
    setIsSpinning(true);
    setCurrentKeyword(null);

    setTimeout(() => {
      const picked = pickRandom(pool);
      setIsSpinning(false);
      if (picked) {
        setCurrentKeyword(picked);
        setHistory((prev) => [
          ...prev,
          { keyword: picked, status: "seen", timestamp: Date.now() },
        ]);
      }
    }, SPIN_DURATION_MS);
  }, [isSpinning, pool, setHistory, setCurrentKeyword, setIsSpinning]);

  function handleSkip() {
    if (!currentKeyword) return;
    const id = keyId(currentKeyword);
    setHistory((prev) =>
      prev.map((h) =>
        keyId(h.keyword) === id && h.status === "seen"
          ? { ...h, status: "skipped" }
          : h
      )
    );
    setCurrentKeyword(null);
  }

  function handleMarkKnown() {
    if (!currentKeyword) return;
    const id = keyId(currentKeyword);
    setHistory((prev) =>
      prev.map((h) =>
        keyId(h.keyword) === id && h.status === "seen"
          ? { ...h, status: "known" }
          : h
      )
    );
    setCurrentKeyword(null);
  }

  function handleClearHistory() {
    clearHistory();
    setCurrentKeyword(null);
  }

  // Don't render history-dependent UI until localStorage is loaded
  // (prevents flash of empty state)
  if (!historyHydrated) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
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
            {/* Persistent progress badge */}
            {history.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {history.length} seen · {knownCount} known
              </div>
            )}
            <span className="text-xs text-gray-600 hidden sm:block">
              {pool.length} left in pool
            </span>
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
          {/* ── Left sidebar: filters ─────────────────────────────── */}
          <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-5 sticky top-20">
            <TopicSelector selected={selectedTopics} onChange={setSelectedTopics} />
            <div className="border-t border-[#2a2a3a]" />
            <DifficultySelector selected={selectedDifficulties} onChange={setSelectedDifficulties} />
          </aside>

          {/* ── Center: keyword card ──────────────────────────────── */}
          <main className="flex-1 flex flex-col gap-6">
            <div className="lg:hidden space-y-4">
              <TopicSelector selected={selectedTopics} onChange={setSelectedTopics} />
              <DifficultySelector selected={selectedDifficulties} onChange={setSelectedDifficulties} />
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

          {/* ── Right sidebar: LLM + history ──────────────────────── */}
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
