import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildTimelineBatch } from '../timelineEngine';
import type { Persona, StudyPost, ExternalPost } from '../../types/post';

const contentRoot = path.resolve(__dirname, '../../../public/content');
const personas: Persona[] = JSON.parse(
  fs.readFileSync(path.join(contentRoot, 'personas.json'), 'utf-8')
);
const studyPosts: StudyPost[] = fs
  .readdirSync(path.join(contentRoot, 'posts'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(contentRoot, 'posts', f), 'utf-8')));
const externalPosts: ExternalPost[] = fs
  .readdirSync(path.join(contentRoot, 'external'))
  .filter((f) => f.endsWith('.json'))
  .map((f) =>
    JSON.parse(fs.readFileSync(path.join(contentRoot, 'external', f), 'utf-8'))
  );

describe('timelineEngine — Weighted Randomization & Loop Logic', () => {
  it('mixes unseen study posts with external social posts and varies order by seed', () => {
    const batchA = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 101,
      section_filter: 'all',
      seen_ids: [],
      bookmarked_ids: [],
      limit: 10,
    });
    const batchB = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 9999,
      section_filter: 'all',
      seen_ids: [],
      bookmarked_ids: [],
      limit: 10,
    });

    expect(batchA.posts.length).toBeGreaterThan(0);
    expect(batchA.posts.some((p) => p.is_external === true)).toBe(true);
    expect(batchA.posts.map((p) => p.id)).not.toEqual(
      batchB.posts.map((p) => p.id)
    );
  });

  it('triggers cycle_reset_triggered when all study posts have been seen in global feed (Review Focus #2)', () => {
    const allIds = studyPosts.map((p) => p.id);
    const result = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 42,
      section_filter: 'all',
      seen_ids: allIds,
      bookmarked_ids: [allIds[0]],
      limit: 10,
    });

    expect(result.cycle_reset_triggered).toBe(true);
    expect(result.posts.length).toBeGreaterThanOrEqual(8);
  });

  it('handles section_filter when all section posts were already seen without triggering global cycle reset (Review Focus #4)', () => {
    const sec1Ids = studyPosts
      .filter((p) => p.section_id === 'sec-1')
      .map((p) => p.id);
    const result = buildTimelineBatch(studyPosts, externalPosts, personas, {
      seed: 77,
      section_filter: 'sec-1',
      seen_ids: sec1Ids,
      bookmarked_ids: [],
      limit: 10,
    });

    expect(result.cycle_reset_triggered).toBe(false);
    expect(result.posts.length).toBe(sec1Ids.length);
    expect(
      result.posts.every((p) => !p.is_external && p.section_id === 'sec-1')
    ).toBe(true);
  });

  it('avoids placing 3+ consecutive posts from the same section when multiple sections exist (Review Focus #5)', () => {
    const result = buildTimelineBatch(studyPosts, [], personas, {
      seed: 2026,
      section_filter: 'all',
      seen_ids: [],
      bookmarked_ids: [],
      limit: 8,
    });

    let consecutiveSameSection = 1;
    let maxStreak = 1;
    for (let i = 1; i < result.posts.length; i++) {
      const prev = result.posts[i - 1];
      const curr = result.posts[i];
      if (!prev.is_external && !curr.is_external && prev.section_id === curr.section_id) {
        consecutiveSameSection++;
        maxStreak = Math.max(maxStreak, consecutiveSameSection);
      } else {
        consecutiveSameSection = 1;
      }
    }
    expect(maxStreak).toBeLessThan(3);
  });
});
