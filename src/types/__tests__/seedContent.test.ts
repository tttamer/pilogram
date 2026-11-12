import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  isValidStudyPost,
  isValidExternalPost,
  type Persona,
  type ServerLoopState,
  type SectionId,
} from '../post';

const contentRoot = path.resolve(__dirname, '../../../public/content');

describe('Seed Content & Schema Validators', () => {
  it('validates personas covering all 7 PSCPP sections', () => {
    const raw = fs.readFileSync(path.join(contentRoot, 'personas.json'), 'utf-8');
    const personas = JSON.parse(raw) as Persona[];
    expect(Array.isArray(personas)).toBe(true);
    expect(personas.length).toBeGreaterThanOrEqual(7);

    const sections = new Set(personas.map((p) => p.section_id));
    for (let i = 1; i <= 7; i++) {
      expect(sections.has(`sec-${i}` as SectionId)).toBe(true);
    }
  });

  it('validates all seed study posts in public/content/posts/*.json', () => {
    const postsDir = path.join(contentRoot, 'posts');
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThanOrEqual(1);

    const formats = new Set<string>();
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf-8'));
      expect(isValidStudyPost(data)).toBe(true);
      formats.add(data.format);
    }

    expect(formats.has('flashcard_flip')).toBe(true);
  });

  it('rejects malformed study post objects', () => {
    expect(isValidStudyPost(null)).toBe(false);
    expect(isValidStudyPost({ id: 'bad-post' })).toBe(false);
    expect(isValidExternalPost({ id: 'missing-fields' })).toBe(false);
  });

  it('validates seed external posts and server state.json', () => {
    const extDir = path.join(contentRoot, 'external');
    const extFiles = fs.readdirSync(extDir).filter((f) => f.endsWith('.json'));
    expect(extFiles.length).toBeGreaterThanOrEqual(2);

    for (const file of extFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(extDir, file), 'utf-8'));
      expect(isValidExternalPost(data)).toBe(true);
    }

    const state = JSON.parse(
      fs.readFileSync(path.join(contentRoot, 'state.json'), 'utf-8')
    ) as ServerLoopState;
    expect(typeof state.needs_generation).toBe('boolean');
    expect(typeof state.completed_cycles).toBe('number');
  });
});
