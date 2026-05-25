"use client";

import { useState, useEffect, useRef } from "react";
import type { Keyword } from "@/lib/keywords";

interface Props {
  keyword: Keyword | null;
  isSpinning: boolean;
  spinPool: string[];
  onSpin: () => void;
  onSkip: () => void;
  onMarkKnown: () => void;
  poolSize: number;
}

const DIFFICULTY_STYLE: Record<string, { label: string; classes: string }> = {
  beginner:     { label: "Beginner",     classes: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" },
  intermediate: { label: "Intermediate", classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" },
  advanced:     { label: "Advanced",     classes: "bg-red-500/20 text-red-400 border border-red-500/40" },
};

export default function KeywordCard({
  keyword,
  isSpinning,
  spinPool,
  onSpin,
  onSkip,
  onMarkKnown,
  poolSize,
}: Props) {
  const [displayWord, setDisplayWord] = useState<string>("???");
  const [revealed, setRevealed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpinning && spinPool.length > 0) {
      setRevealed(false);
      let i = 0;
      intervalRef.current = setInterval(() => {
        setDisplayWord(spinPool[i % spinPool.length]);
        i++;
      }, 80);
    } else if (!isSpinning && keyword) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayWord(keyword.keyword);
      setRevealed(true);
    } else if (!isSpinning && !keyword) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayWord("???");
      setRevealed(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, keyword, spinPool]);

  const diff = keyword ? DIFFICULTY_STYLE[keyword.difficulty] : null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        className={`
          w-full min-h-[220px] rounded-2xl border flex flex-col items-center justify-center gap-4 p-8
          transition-all duration-300
          ${isSpinning
            ? "border-purple-500/60 bg-gradient-to-br from-purple-900/30 to-[#1a1a24] shadow-purple-500/20 shadow-2xl"
            : revealed && keyword
            ? "border-[#3a3a5a] bg-gradient-to-br from-[#1a1a2e] to-[#1a1a24] shadow-xl"
            : "border-[#2a2a3a] bg-[#1a1a24]"
          }
        `}
      >
        {/* Spinning indicator */}
        {isSpinning && (
          <div className="flex gap-1 mb-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Main keyword text */}
        <div
          key={displayWord + String(isSpinning)}
          className={`
            text-center font-bold text-white transition-all
            ${isSpinning ? "text-2xl blur-[1px] opacity-70 animate-pulse" : "text-3xl sm:text-4xl"}
            ${revealed && !isSpinning ? "animate-bounce_in" : ""}
          `}
          style={revealed && !isSpinning ? { animation: "bounce_in 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards" } : {}}
        >
          {displayWord}
        </div>

        {/* Metadata */}
        {revealed && keyword && !isSpinning && (
          <div
            className="flex flex-wrap gap-2 items-center justify-center"
            style={{ animation: "bounce_in 0.5s 0.1s both" }}
          >
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diff?.classes}`}>
              {diff?.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-[#252535] text-gray-400 border border-[#2a2a3a]">
              {keyword.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30">
              {keyword.topic}
            </span>
          </div>
        )}

        {!revealed && !isSpinning && (
          <p className="text-gray-500 text-sm">Select topics and hit Spin!</p>
        )}
      </div>

      {/* Pool info */}
      <p className="text-xs text-gray-600">
        {poolSize} keyword{poolSize !== 1 ? "s" : ""} remaining in pool
      </p>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onSpin}
          disabled={isSpinning || poolSize === 0}
          className={`
            flex-1 py-3.5 rounded-xl font-bold text-base transition-all duration-200
            ${isSpinning || poolSize === 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
            }
          `}
        >
          {isSpinning ? "Spinning..." : poolSize === 0 ? "Pool empty" : "⟳ Spin"}
        </button>

        {revealed && keyword && (
          <>
            <button
              onClick={onSkip}
              title="Skip this keyword"
              className="px-4 py-3.5 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-all duration-200"
            >
              Skip
            </button>
            <button
              onClick={onMarkKnown}
              title="Mark as known — won't appear again this session"
              className="px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200"
            >
              ✓ Known
            </button>
          </>
        )}
      </div>
    </div>
  );
}
