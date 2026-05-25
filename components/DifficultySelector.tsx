"use client";

import type { Difficulty } from "@/lib/keywords";

interface Props {
  selected: Difficulty[];
  onChange: (difficulties: Difficulty[]) => void;
}

const LEVELS: { id: Difficulty; label: string; color: string; bg: string }[] = [
  { id: "beginner", label: "Beginner", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500" },
  { id: "intermediate", label: "Intermediate", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500" },
  { id: "advanced", label: "Advanced", color: "text-red-400", bg: "bg-red-500/20 border-red-500" },
];

export default function DifficultySelector({ selected, onChange }: Props) {
  function toggle(id: Difficulty) {
    if (selected.includes(id)) {
      onChange(selected.filter((d) => d !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const allSelected = selected.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Difficulty</h2>
        {!allSelected && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            All
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {LEVELS.map((level) => {
          const isSelected = selected.includes(level.id);
          return (
            <button
              key={level.id}
              onClick={() => toggle(level.id)}
              className={`
                flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                ${isSelected ? `${level.bg} ${level.color}` : "bg-[#1a1a24] text-gray-500 border-[#2a2a3a] hover:border-gray-500"}
              `}
            >
              {level.label}
            </button>
          );
        })}
      </div>
      {allSelected && (
        <p className="text-xs text-gray-500">All difficulties included</p>
      )}
    </div>
  );
}
