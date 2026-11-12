import { useState, useEffect, useCallback } from 'react';
import { buildTimelineBatch } from '../lib/timelineEngine';
import { useStudyMemory } from './useStudyMemory';
import type {
  ExternalPost,
  FeedResponse,
  Persona,
  SectionFilter,
  ServerLoopState,
  StudyPost,
  TimelinePost,
} from '../types/post';

import personasData from '../../public/content/personas.json';
import stateData from '../../public/content/state.json';

const postModules = import.meta.glob('../../public/content/posts/*.json', { eager: true });
const extModules = import.meta.glob('../../public/content/external/*.json', { eager: true });

const BUNDLED_PERSONAS = personasData as Persona[];
const BUNDLED_STUDY_POSTS = Object.values(postModules).map((mod: any) => mod.default || mod) as StudyPost[];
const BUNDLED_EXTERNAL_POSTS = Object.values(extModules).map((mod: any) => mod.default || mod) as ExternalPost[];
const BUNDLED_STATE = stateData as ServerLoopState;

export function useTimeline() {
  const memory = useStudyMemory();
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');

  const initialFeed = buildTimelineBatch(
    BUNDLED_STUDY_POSTS,
    BUNDLED_EXTERNAL_POSTS,
    BUNDLED_PERSONAS,
    {
      seed: memory.seed,
      section_filter: 'all',
      seen_ids: memory.seenIds,
      bookmarked_ids: memory.bookmarkedIds,
      limit: 12,
    },
    BUNDLED_STATE
  );

  const [posts, setPosts] = useState<TimelinePost[]>(() => initialFeed.posts);
  const [personas, setPersonas] = useState<Record<string, Persona>>(() => initialFeed.personas);
  const [serverState, setServerState] = useState<ServerLoopState>(() => initialFeed.server_state);
  const [loopBanner, setLoopBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const notifyServerExhausted = useCallback(async () => {
    try {
      const res = await fetch('./api/exhausted.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_client_cycle: memory.cycleCount }),
      });
      if (res.ok) {
        const updated = (await res.json()) as ServerLoopState;
        setServerState(updated);
      }
    } catch {
      // Static/offline mode fallback
      setServerState((prev) => ({
        ...prev,
        needs_generation: true,
        completed_cycles: prev.completed_cycles + 1,
        last_exhausted_at: new Date().toISOString(),
      }));
    }
  }, [memory.cycleCount]);

  const loadFeed = useCallback(
    async (customSeed?: number) => {
      setLoading(true);
      const activeSeed = customSeed ?? memory.seed;
      const payload = {
        seed: activeSeed,
        section_filter: sectionFilter,
        seen_ids: memory.seenIds,
        bookmarked_ids: memory.bookmarkedIds,
        limit: 12,
      };

      let feed: FeedResponse | null = null;
      try {
        const res = await fetch('./api/feed.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            feed = (await res.json()) as FeedResponse;
          }
        }
      } catch {
        // Fallback to local engine
      }

      if (!feed) {
        feed = buildTimelineBatch(
          BUNDLED_STUDY_POSTS,
          BUNDLED_EXTERNAL_POSTS,
          BUNDLED_PERSONAS,
          payload,
          serverState
        );
      }

      setPosts(feed.posts);
      setPersonas(feed.personas);
      setServerState(feed.server_state);

      if (feed.cycle_reset_triggered) {
        memory.resetCycleSeen();
        void notifyServerExhausted();
        setLoopBanner(
          `Ciclo #${memory.cycleCount} concluído! Timeline reembaralhada e geração de novos posts sinalizada.`
        );
      }
      setLoading(false);
    },
    [
      memory.seed,
      memory.seenIds,
      memory.bookmarkedIds,
      memory.cycleCount,
      memory.resetCycleSeen,
      sectionFilter,
      serverState,
      notifyServerExhausted,
    ]
  );

  useEffect(() => {
    void loadFeed();
  }, [sectionFilter, memory.seed]);

  const shuffleTimeline = useCallback(() => {
    const nextSeed = Math.floor(Math.random() * 900000) + 100000;
    memory.randomizeSeed();
    setLoopBanner('Timeline reembaralhada com prioridade para revisão espaçada.');
    void loadFeed(nextSeed);
  }, [memory, loadFeed]);

  const completeAndLoopTimeline = useCallback(() => {
    memory.resetCycleSeen();
    void notifyServerExhausted();
    const nextSeed = Math.floor(Math.random() * 900000) + 100000;
    setLoopBanner(
      `Ciclo #${memory.cycleCount} finalizado! Novos posts solicitados ao loop local e timeline renovada.`
    );
    void loadFeed(nextSeed);
  }, [memory, notifyServerExhausted, loadFeed]);

  return {
    posts,
    personas,
    sectionFilter,
    setSectionFilter,
    serverState,
    loopBanner,
    dismissBanner: () => setLoopBanner(null),
    loading,
    seenIds: memory.seenIds,
    bookmarkedIds: memory.bookmarkedIds,
    likedIds: memory.likedIds,
    cycleCount: memory.cycleCount,
    totalStudyPosts: BUNDLED_STUDY_POSTS.length,
    markSeen: memory.markSeen,
    toggleBookmark: memory.toggleBookmark,
    toggleLike: memory.toggleLike,
    shuffleTimeline,
    completeAndLoopTimeline,
  };
}
