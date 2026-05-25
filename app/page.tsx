"use client";

import { useState, useMemo, useCallback } from "react";
import TopicSelector from "@/components/TopicSelector";
import DifficultySelector from "@/components/DifficultySelector";
import KeywordCard from "@/components/KeywordCard";
import LLMHelper from "@/components/LLMHelper";
import SessionHistory, { type HistoryEntry } from "@/components/SessionHistory";
import { filterKeywords, pickRandom, keyId, type Keyword, type Difficulty } from "@/lib/keywords";

const SPIN_DURATION_MS = 1200;

export default function Home() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState<Keyword | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"llm" | "history">("history");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const pool = useMemo(
    () => filterKeywords(selectedTopics, selectedDifficulties, seenIds),
    [selectedTopics, selectedDifficulties, seenIds]
  );

  // A small rotating sample of keywords for the spin animation
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
        setSeenIds((prev) => new Set(prev).add(keyId(picked)));
        setHistory((prev) => [
          ...prev,
          { keyword: picked, status: "seen", timestamp: Date.now() },
        ]);
      }
    }, SPIN_DURATION_MS);
  }, [isSpinning, pool]);

  function handleSkip() {
    if (!currentKeyword) return;
    setHistory((prev) =>
      prev.map((h) =>
        h.keyword === currentKeyword && h.status === "seen"
          ? { ...h, status: "skipped" }
          : h
      )
    );
    setCurrentKeyword(null);
  }

  function handleMarkKnown() {
    if (!currentKeyword) return;
    setHistory((prev) =>
      prev.map((h) =>
        h.keyword === currentKeyword && h.status === "seen"
          ? { ...h, status: "known" }
          : h
      )
    );
    setCurrentKeyword(null);
  }

  function clearHistory() {
    setHistory([]);
    setSeenIds(new Set());
    setCurrentKeyword(null);
  }

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
            <span className="text-xs text-gray-500 hidden sm:block">
              {pool.length} keywords in pool
            </span>
            {/* Mobile right panel toggle */}
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
            {/* Mobile filters */}
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

            {/* LLM helper visible inline on mobile when panel is open */}
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
                <SessionHistory history={history} onClearHistory={clearHistory} />
              )}
            </div>
          </main>

          {/* ── Right sidebar: LLM + history ──────────────────────── */}
          <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-4 sticky top-20">
            {/* Tab switcher */}
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
              <SessionHistory history={history} onClearHistory={clearHistory} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
