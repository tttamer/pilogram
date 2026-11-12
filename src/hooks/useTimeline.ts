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
import post1 from '../../public/content/posts/2026-11-11-sec1-crenshaw-001.json';
import post2 from '../../public/content/posts/2026-11-11-sec1-pna-002.json';
import post3 from '../../public/content/posts/2026-11-11-sec2-artenaval-003.json';
import post4 from '../../public/content/posts/2026-11-11-sec3-squat-004.json';
import post5 from '../../public/content/posts/2026-11-11-sec4-normam-005.json';
import post6 from '../../public/content/posts/2026-11-11-sec5-bowditch-006.json';
import post7 from '../../public/content/posts/2026-11-11-sec6-cis-007.json';
import post8 from '../../public/content/posts/2026-11-11-sec7-colregs-008.json';
import ext1 from '../../public/content/external/ext-linkedin-pilot-001.json';
import ext2 from '../../public/content/external/ext-ig-shiphandling-002.json';

const BUNDLED_PERSONAS = personasData as Persona[];
const BUNDLED_STUDY_POSTS = [
  post1,
  post2,
  post3,
  post4,
  post5,
  post6,
  post7,
  post8,
] as StudyPost[];
const BUNDLED_EXTERNAL_POSTS = [ext1, ext2] as ExternalPost[];
const BUNDLED_STATE = stateData as ServerLoopState;

export function useTimeline() {
  const memory = useStudyMemory();
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [personas, setPersonas] = useState<Record<string, Persona>>({});
  const [serverState, setServerState] = useState<ServerLoopState>(BUNDLED_STATE);
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
