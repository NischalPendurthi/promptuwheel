import backendEng from "@/data/backend_eng.json";
import ca from "@/data/ca.json";
import cpp from "@/data/c++.json";
import dbms from "@/data/dbms.json";
import distSys from "@/data/dist_sys.json";
import lld from "@/data/lld.json";
import networks from "@/data/networks.json";
import oops from "@/data/oops.json";
import os from "@/data/os.json";
import softwareEng from "@/data/software_eng.json";
import sysDesign from "@/data/sys_design.json";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Keyword {
  keyword: string;
  category: string;
  difficulty: Difficulty;
  topic: string;
  topicId: string;
}

export interface Topic {
  id: string;
  label: string;
  count: number;
}

const RAW_SOURCES: { id: string; label: string; data: { keyword: string; category: string; difficulty: string }[] }[] = [
  { id: "backend_eng", label: "Backend Engineering", data: backendEng as never },
  { id: "ca", label: "Computer Architecture", data: ca as never },
  { id: "cpp", label: "C++", data: cpp as never },
  { id: "dbms", label: "DBMS", data: dbms as never },
  { id: "dist_sys", label: "Distributed Systems", data: distSys as never },
  { id: "lld", label: "Low Level Design", data: lld as never },
  { id: "networks", label: "Networks", data: networks as never },
  { id: "oops", label: "OOP", data: oops as never },
  { id: "os", label: "Operating Systems", data: os as never },
  { id: "software_eng", label: "Software Engineering", data: softwareEng as never },
  { id: "sys_design", label: "System Design", data: sysDesign as never },
];

export const ALL_KEYWORDS: Keyword[] = RAW_SOURCES.flatMap(({ id, label, data }) =>
  data.map((item) => ({
    keyword: item.keyword,
    category: item.category,
    difficulty: item.difficulty as Difficulty,
    topic: label,
    topicId: id,
  }))
);

export const TOPICS: Topic[] = RAW_SOURCES.map(({ id, label, data }) => ({
  id,
  label,
  count: data.length,
}));

export function filterKeywords(
  topicIds: string[],
  difficulties: Difficulty[],
  seenIds: Set<string>
): Keyword[] {
  return ALL_KEYWORDS.filter(
    (k) =>
      (topicIds.length === 0 || topicIds.includes(k.topicId)) &&
      (difficulties.length === 0 || difficulties.includes(k.difficulty)) &&
      !seenIds.has(`${k.topicId}::${k.keyword}`)
  );
}

export function pickRandom(pool: Keyword[]): Keyword | null {
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function keyId(k: Keyword): string {
  return `${k.topicId}::${k.keyword}`;
}
