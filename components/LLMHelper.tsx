"use client";

import { useState, useEffect } from "react";
import type { Keyword } from "@/lib/keywords";

type Provider = "openai" | "anthropic" | "gemini";

interface Props {
  keyword: Keyword | null;
}

const PROVIDERS: { id: Provider; label: string; placeholder: string; models: string[] }[] = [
  {
    id: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
    models: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
  },
  {
    id: "gemini",
    label: "Gemini",
    placeholder: "AIza...",
    models: ["gemini-1.5-flash", "gemini-1.5-pro"],
  },
];

const BRAINSTORM_PROMPT = (keyword: string, topic: string, difficulty: string) =>
  `You are a technical study coach. The user is brainstorming what they know about the concept: "${keyword}" (Topic: ${topic}, Difficulty: ${difficulty}).

Generate exactly 5 concise, thought-provoking questions that help them recall and structure their knowledge. Questions should progress from basic recall to deeper understanding.

Format: Return ONLY a numbered list (1-5), one question per line. No intro, no explanation.`;

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

export default function LLMHelper({ keyword }: Props) {
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDERS[0].models[0]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastKeyword, setLastKeyword] = useState("");

  // Reset questions when keyword changes
  useEffect(() => {
    if (keyword && keyword.keyword !== lastKeyword) {
      setQuestions([]);
      setError("");
    }
  }, [keyword, lastKeyword]);

  function handleProviderChange(p: Provider) {
    setProvider(p);
    setModel(PROVIDERS.find((x) => x.id === p)!.models[0]);
    setQuestions([]);
    setError("");
  }

  async function generate() {
    if (!keyword || !apiKey.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    try {
      const prompt = BRAINSTORM_PROMPT(keyword.keyword, keyword.topic, keyword.difficulty);
      let raw = "";
      if (provider === "openai") raw = await callOpenAI(apiKey, model, prompt);
      else if (provider === "anthropic") raw = await callAnthropic(apiKey, model, prompt);
      else raw = await callGemini(apiKey, model, prompt);

      const lines = raw
        .split("\n")
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
      setQuestions(lines);
      setLastKeyword(keyword.keyword);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#1a1a24] p-4 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        AI Brainstorm Helper
      </h2>

      {/* Provider tabs */}
      <div className="flex gap-1 bg-[#13131a] rounded-lg p-1">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProviderChange(p.id)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all
              ${provider === p.id ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={currentProvider.placeholder}
          className="w-full bg-[#13131a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <p className="text-xs text-gray-600">Key is never sent to our servers — calls go directly to {currentProvider.label}.</p>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <label className="text-xs text-gray-500">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full bg-[#13131a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
        >
          {currentProvider.models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!keyword || !apiKey.trim() || loading}
        className={`
          w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200
          ${!keyword || !apiKey.trim() || loading
            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md hover:shadow-purple-500/25"
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : !keyword ? (
          "Spin a keyword first"
        ) : (
          `Generate questions for "${keyword.keyword}"`
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Brainstorm these questions about <span className="text-purple-400 font-medium">{lastKeyword}</span>:</p>
          <ol className="space-y-2">
            {questions.map((q, i) => (
              <li
                key={i}
                className="flex gap-2.5 bg-[#13131a] rounded-lg p-3 border border-[#2a2a3a]"
                style={{ animation: `bounce_in 0.3s ${i * 0.06}s both` }}
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
