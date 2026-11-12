import type {
  ExternalPost,
  FeedRequest,
  FeedResponse,
  Persona,
  ServerLoopState,
  StudyPost,
  TimelinePost,
} from '../types/post';

export function createSeededRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function smoothSectionStreaks(posts: StudyPost[]): StudyPost[] {
  const result = [...posts];
  for (let i = 2; i < result.length; i++) {
    if (
      result[i].section_id === result[i - 1].section_id &&
      result[i].section_id === result[i - 2].section_id
    ) {
      const swapIdx = result.findIndex(
        (candidate, idx) =>
          idx > i && candidate.section_id !== result[i].section_id
      );
      if (swapIdx !== -1) {
        [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
      }
    }
  }
  return result;
}

export function buildTimelineBatch(
  studyPosts: StudyPost[],
  externalPosts: ExternalPost[],
  personas: Persona[],
  request: FeedRequest,
  serverState?: ServerLoopState
): FeedResponse {
  const rng = createSeededRng(request.seed);
  const limit = request.limit ?? 10;
  const personaMap: Record<string, Persona> = {};
  for (const p of personas) {
    personaMap[p.id] = p;
  }

  const seenSet = new Set(request.seen_ids);
  const bookmarkSet = new Set(request.bookmarked_ids);

  const defaultState: ServerLoopState = serverState ?? {
    needs_generation: false,
    completed_cycles: 0,
    last_exhausted_at: null,
    last_generated_at: new Date().toISOString(),
    total_study_posts: studyPosts.length,
  };

  if (request.section_filter === 'external') {
    return {
      posts: seededShuffle(externalPosts, rng).slice(0, limit),
      personas: personaMap,
      unseen_remaining: studyPosts.filter((p) => !seenSet.has(p.id)).length,
      total_study_posts: studyPosts.length,
      cycle_reset_triggered: false,
      server_state: defaultState,
    };
  }

  if (request.section_filter === 'bookmarks') {
    const bookmarked = studyPosts.filter((p) => bookmarkSet.has(p.id));
    return {
      posts: smoothSectionStreaks(seededShuffle(bookmarked, rng)).slice(0, limit),
      personas: personaMap,
      unseen_remaining: studyPosts.filter((p) => !seenSet.has(p.id)).length,
      total_study_posts: studyPosts.length,
      cycle_reset_triggered: false,
      server_state: defaultState,
    };
  }

  if (request.section_filter !== 'all') {
    const sectionPool = studyPosts.filter(
      (p) => p.section_id === request.section_filter
    );
    const unseenInSection = sectionPool.filter((p) => !seenSet.has(p.id));
    const chosen =
      unseenInSection.length > 0
        ? seededShuffle(unseenInSection, rng)
        : seededShuffle(sectionPool, rng);

    return {
      posts: chosen.slice(0, limit),
      personas: personaMap,
      unseen_remaining: studyPosts.filter((p) => !seenSet.has(p.id)).length,
      total_study_posts: studyPosts.length,
      cycle_reset_triggered: false,
      server_state: defaultState,
    };
  }

  let unseenStudy = studyPosts.filter((p) => !seenSet.has(p.id));
  let cycleResetTriggered = false;

  if (studyPosts.length > 0 && unseenStudy.length === 0) {
    cycleResetTriggered = true;
    unseenStudy = [...studyPosts];
  }

  const prioritizedUnseen = [
    ...seededShuffle(
      unseenStudy.filter((p) => bookmarkSet.has(p.id)),
      rng
    ),
    ...seededShuffle(
      unseenStudy.filter((p) => !bookmarkSet.has(p.id)),
      rng
    ),
  ];

  const seenReviewPool = seededShuffle(
    studyPosts.filter(
      (p) => seenSet.has(p.id) && !prioritizedUnseen.some((u) => u.id === p.id)
    ),
    rng
  );

  const studyCount = externalPosts.length > 0 ? Math.max(1, limit - 2) : limit;
  const selectedStudy = smoothSectionStreaks(
    [...prioritizedUnseen, ...seenReviewPool].slice(0, studyCount)
  );

  const shuffledExternal = seededShuffle(externalPosts, rng);
  const combined: TimelinePost[] = [];
  let extIdx = 0;

  for (let i = 0; i < selectedStudy.length; i++) {
    combined.push(selectedStudy[i]);
    if ((i + 1) % 4 === 0 && extIdx < shuffledExternal.length) {
      combined.push(shuffledExternal[extIdx++]);
    }
  }

  return {
    posts: combined.slice(0, limit),
    personas: personaMap,
    unseen_remaining: cycleResetTriggered
      ? studyPosts.length
      : unseenStudy.length,
    total_study_posts: studyPosts.length,
    cycle_reset_triggered: cycleResetTriggered,
    server_state: cycleResetTriggered
      ? {
          ...defaultState,
          needs_generation: true,
          completed_cycles: defaultState.completed_cycles + 1,
          last_exhausted_at: new Date().toISOString(),
        }
      : defaultState,
  };
}
