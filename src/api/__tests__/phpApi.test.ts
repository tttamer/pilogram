import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const apiDir = path.resolve(__dirname, '../../../public/api');
const contentDir = path.resolve(__dirname, '../../../public/content');
const fixturePostsDir = path.resolve(__dirname, '../../../tests/fixtures/posts');
const corruptFixtureFile = path.join(fixturePostsDir, 'corrupt_temp.json');
const originalState = fs.readFileSync(path.join(contentDir, 'state.json'), 'utf-8');

afterEach(() => {
  if (fs.existsSync(corruptFixtureFile)) {
    fs.unlinkSync(corruptFixtureFile);
  }
  fs.writeFileSync(path.join(contentDir, 'state.json'), originalState, 'utf-8');
});

describe('PHP 8 cPanel Backend Endpoints', () => {
  it('feed.php skips corrupt JSON files in posts directory and returns valid FeedResponse (Review Focus #1)', () => {
    fs.writeFileSync(corruptFixtureFile, '{not-valid-json', 'utf-8');

    const stdout = execFileSync(
      'php',
      [
        path.join(apiDir, 'feed.php'),
        JSON.stringify({
          seed: 1234,
          section_filter: 'all',
          seen_ids: [],
          bookmarked_ids: [],
          limit: 10,
          custom_posts_dir: fixturePostsDir,
        }),
      ],
      { encoding: 'utf-8' }
    );

    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed.posts)).toBe(true);
    expect(parsed.posts.length).toBeGreaterThanOrEqual(8);
    expect(parsed.total_study_posts).toBe(8);
  });

  it('exhausted.php sets needs_generation=true and increments completed_cycles, and status.php resets it', () => {
    const exhaustedOut = execFileSync(
      'php',
      [path.join(apiDir, 'exhausted.php')],
      { encoding: 'utf-8' }
    );
    const stateAfterExhaust = JSON.parse(exhaustedOut);
    expect(stateAfterExhaust.needs_generation).toBe(true);
    expect(stateAfterExhaust.completed_cycles).toBeGreaterThanOrEqual(1);

    const resetOut = execFileSync(
      'php',
      [
        path.join(apiDir, 'status.php'),
        JSON.stringify({ action: 'ack_generated' }),
      ],
      { encoding: 'utf-8' }
    );
    const stateAfterReset = JSON.parse(resetOut);
    expect(stateAfterReset.needs_generation).toBe(false);
  });
});
