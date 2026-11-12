import { useState, useCallback } from 'react';

export const STORAGE_KEY = 'pscpp_gram_memory_v1';

interface StoredMemory {
  seenIds: string[];
  bookmarkedIds: string[];
  likedIds: string[];
  cycleCount: number;
  seed: number;
}

const DEFAULT_MEMORY: StoredMemory = {
  seenIds: [],
  bookmarkedIds: [],
  likedIds: [],
  cycleCount: 1,
  seed: 20261111,
};

function readStorage(): StoredMemory {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MEMORY;
    const parsed = JSON.parse(raw) as Partial<StoredMemory>;
    return {
      seenIds: Array.isArray(parsed.seenIds) ? parsed.seenIds : [],
      bookmarkedIds: Array.isArray(parsed.bookmarkedIds)
        ? parsed.bookmarkedIds
        : [],
      likedIds: Array.isArray(parsed.likedIds) ? parsed.likedIds : [],
      cycleCount:
        typeof parsed.cycleCount === 'number' && parsed.cycleCount >= 1
          ? parsed.cycleCount
          : 1,
      seed: typeof parsed.seed === 'number' ? parsed.seed : 20261111,
    };
  } catch {
    return DEFAULT_MEMORY;
  }
}

function writeStorage(next: StoredMemory): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or Safari Private Browsing write errors
  }
}

export function useStudyMemory() {
  const [memory, setMemory] = useState<StoredMemory>(() => readStorage());

  const update = useCallback((updater: (prev: StoredMemory) => StoredMemory) => {
    setMemory((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  const markSeen = useCallback(
    (postId: string) => {
      update((prev) =>
        prev.seenIds.includes(postId)
          ? prev
          : { ...prev, seenIds: [...prev.seenIds, postId] }
      );
    },
    [update]
  );

  const toggleBookmark = useCallback(
    (postId: string) => {
      update((prev) => ({
        ...prev,
        bookmarkedIds: prev.bookmarkedIds.includes(postId)
          ? prev.bookmarkedIds.filter((id) => id !== postId)
          : [...prev.bookmarkedIds, postId],
      }));
    },
    [update]
  );

  const toggleLike = useCallback(
    (postId: string) => {
      update((prev) => ({
        ...prev,
        likedIds: prev.likedIds.includes(postId)
          ? prev.likedIds.filter((id) => id !== postId)
          : [...prev.likedIds, postId],
      }));
    },
    [update]
  );

  const randomizeSeed = useCallback(() => {
    update((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 900000) + 100000,
    }));
  }, [update]);

  const resetCycleSeen = useCallback(() => {
    update((prev) => ({
      ...prev,
      seenIds: [],
      cycleCount: prev.cycleCount + 1,
      seed: Math.floor(Math.random() * 900000) + 100000,
    }));
  }, [update]);

  return {
    seenIds: memory.seenIds,
    bookmarkedIds: memory.bookmarkedIds,
    likedIds: memory.likedIds,
    cycleCount: memory.cycleCount,
    seed: memory.seed,
    markSeen,
    toggleBookmark,
    toggleLike,
    randomizeSeed,
    resetCycleSeen,
  };
}
