import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');
const zipPath = path.join(projectRoot, 'deploy-initial.zip');

describe('Build, Initial cPanel Zip & Loop Scripts', () => {
  it('builds production bundle and packages deploy-initial.zip with SPA, PHP API, and content/', () => {
    execFileSync('bash', [path.join(projectRoot, 'scripts/build-zip.sh')], {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    expect(fs.existsSync(zipPath)).toBe(true);
    const listing = execFileSync('unzip', ['-l', zipPath], {
      encoding: 'utf-8',
    });

    expect(listing).toContain('index.html');
    expect(listing).toContain('.htaccess');
    expect(listing).toContain('api/feed.php');
    expect(listing).toContain('api/exhausted.php');
    expect(listing).toContain('api/status.php');
    expect(listing).toContain('content/personas.json');
    expect(listing).toContain('content/posts/2026-11-12-sec7-colregs-009-nuc.json');
  });

  it('runs check-and-loop.sh locally against state.json and reports loop status', () => {
    const out = execFileSync(
      'bash',
      [path.join(projectRoot, 'scripts/check-and-loop.sh')],
      {
        cwd: projectRoot,
        encoding: 'utf-8',
      }
    );
    expect(out).toContain('needs_generation');
  });
});
