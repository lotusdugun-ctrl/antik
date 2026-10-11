import { useCallback, useEffect, useState } from "react";

const KEY = "antik-tr-story-endings";

/**
 * Which endings this reader has reached, per story. A per-browser nicety, so
 * it lives in localStorage on its own rather than in the backed-up progress
 * record: losing it costs nothing but a tick mark.
 */
function read(): Record<string, string[]> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

export function useStoryEndings() {
  const [found, setFound] = useState<Record<string, string[]>>({});
  useEffect(() => setFound(read()), []);

  const record = useCallback((storyId: string, endingId: string) => {
    setFound((current) => {
      const list = current[storyId] ?? [];
      if (list.includes(endingId)) return current;
      const next = { ...current, [storyId]: [...list, endingId] };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode: keep it for this visit only */
      }
      return next;
    });
  }, []);

  return { found, record };
}
