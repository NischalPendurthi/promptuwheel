"use client";

import type { HistoryEntry } from "@/lib/types";

interface Props {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const STATUS_STYLE: Record<string, { dot: string; badge: string; label: string }> = {
  seen:    { dot: "bg-blue-500",    badge: "text-blue-400 bg-blue-500/10 border-blue-500/30",    label: "Seen" },
  known:   { dot: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", label: "Known" },
  skipped: { dot: "bg-gray-500",    badge: "text-gray-400 bg-gray-500/10 border-gray-500/30",    label: "Skip" },
};

const DIFF_COLOR: Record<string, string> = {
  beginner: "text-emerald-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

export default function SessionHistory({ history, onClearHistory }: Props) {
  const knownCount = history.filter((h) => h.status === "known").length;
  const seenCount = history.filter((h) => h.status === "seen").length;

  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#1a1a24] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Session History
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="flex gap-3 text-xs">
          <span className="text-gray-400">{history.length} total</span>
          <span className="text-emerald-400">{knownCount} known</span>
          <span className="text-blue-400">{seenCount} reviewed</span>
        </div>
      )}

      {/* List */}
      {history.length === 0 ? (
        <p className="text-xs text-gray-600 py-2">No keywords yet — spin to start!</p>
      ) : (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
          {[...history].reverse().map((entry) => {
            const s = STATUS_STYLE[entry.status];
            return (
              <div
                key={`${entry.keyword.topicId}::${entry.keyword.keyword}::${entry.timestamp}`}
                className="flex items-center gap-2.5 bg-[#13131a] rounded-lg px-3 py-2 border border-[#1e1e2e]"
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{entry.keyword.keyword}</p>
                  <p className={`text-xs ${DIFF_COLOR[entry.keyword.difficulty]}`}>
                    {entry.keyword.topic}
                  </p>
                </div>
                <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${s.badge}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export type { HistoryEntry } from "@/lib/types";
