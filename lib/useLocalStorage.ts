"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // corrupted storage — fall back to initial
    }
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {}
        return resolved;
      });
    },
    [key]
  );

  function clear() {
    try {
      localStorage.removeItem(key);
    } catch {}
    setValue(initial);
  }

  return [value, set, clear, hydrated] as const;
}
