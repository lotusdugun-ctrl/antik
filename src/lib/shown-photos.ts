import { useSyncExternalStore } from "react";

/**
 * The photographs on screen right now, so their credits can be listed on the
 * same page (Wikimedia's CC BY / BY-SA licences ask for attribution where the
 * work is used). Every <Photo> registers its source while it is mounted; the
 * page footer lists the credits of whatever is registered.
 */
const counts = new Map<string, number>();
const listeners = new Set<() => void>();
let snapshot: string[] = [];

function emit() {
  snapshot = [...counts.keys()];
  for (const listener of listeners) listener();
}

export function registerShownPhoto(src: string): () => void {
  counts.set(src, (counts.get(src) ?? 0) + 1);
  emit();
  return () => {
    const n = (counts.get(src) ?? 1) - 1;
    if (n <= 0) counts.delete(src);
    else counts.set(src, n);
    emit();
  };
}

const EMPTY: string[] = [];

export function useShownPhotos(): string[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => EMPTY,
  );
}
