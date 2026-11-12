import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStudyMemory, STORAGE_KEY } from '../useStudyMemory';

describe('useStudyMemory — localStorage persistence & resilience', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('recovers gracefully when localStorage contains corrupted JSON (Review Focus #3)', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken-json');
    const { result } = renderHook(() => useStudyMemory());
    expect(result.current.seenIds).toEqual([]);
    expect(result.current.bookmarkedIds).toEqual([]);
    expect(result.current.cycleCount).toBe(1);
  });

  it('tracks seen, liked, bookmarked posts and increments cycle on resetCycleSeen', () => {
    const { result } = renderHook(() => useStudyMemory());

    act(() => {
      result.current.markSeen('post-1');
      result.current.toggleBookmark('post-1');
      result.current.toggleLike('post-2');
    });

    expect(result.current.seenIds).toContain('post-1');
    expect(result.current.bookmarkedIds).toContain('post-1');
    expect(result.current.likedIds).toContain('post-2');

    act(() => {
      result.current.resetCycleSeen();
    });

    expect(result.current.seenIds).toEqual([]);
    expect(result.current.bookmarkedIds).toContain('post-1');
    expect(result.current.cycleCount).toBe(2);
  });
});
