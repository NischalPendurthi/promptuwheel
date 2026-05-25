"use client";

import { TOPICS } from "@/lib/keywords";

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const TOPIC_COLORS: Record<string, string> = {
  backend_eng: "from-blue-600 to-blue-800",
  ca: "from-orange-600 to-orange-800",
  cpp: "from-purple-600 to-purple-800",
  dbms: "from-green-600 to-green-800",
  dist_sys: "from-cyan-600 to-cyan-800",
  lld: "from-pink-600 to-pink-800",
  networks: "from-yellow-600 to-yellow-800",
  oops: "from-indigo-600 to-indigo-800",
  os: "from-red-600 to-red-800",
  software_eng: "from-teal-600 to-teal-800",
  sys_design: "from-violet-600 to-violet-800",
};

export default function TopicSelector({ selected, onChange }: Props) {
  const allSelected = selected.length === 0;

  function toggle(id: string) {
    if (selected.includes(id)) {
      const next = selected.filter((s) => s !== id);
      onChange(next);
    } else {
      onChange([...selected, id]);
    }
  }

  function selectAll() {
    onChange([]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Topics</h2>
        {!allSelected && (
          <button
            onClick={selectAll}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Select all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          const gradient = TOPIC_COLORS[topic.id] ?? "from-gray-600 to-gray-800";
          return (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              className={`
                relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                ${
                  isSelected
                    ? `bg-gradient-to-r ${gradient} text-white border-transparent shadow-lg scale-105`
                    : "bg-[#1a1a24] text-gray-400 border-[#2a2a3a] hover:border-purple-500 hover:text-gray-200"
                }
              `}
            >
              {topic.label}
              <span className={`ml-1.5 text-xs ${isSelected ? "text-white/70" : "text-gray-600"}`}>
                {topic.count}
              </span>
            </button>
          );
        })}
      </div>
      {allSelected && (
        <p className="text-xs text-gray-500">All topics selected — click to narrow down</p>
      )}
    </div>
  );
}
