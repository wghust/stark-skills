import { describe, it, expect } from 'vitest';
import { detectRiskyPR } from './detectRiskyPR.js';
import type { ParsedDiff, AnalysisOptions } from '../types.js';

function makeDiff(overrides: Partial<ParsedDiff> = {}): ParsedDiff {
  return {
    branch: 'feature/test',
    base: 'master',
    files: [],
    linesAdded: 0,
    linesRemoved: 0,
    truncated: false,
    ...overrides,
  };
}

const noLLM: AnalysisOptions = { useLLM: false, output: 'md' };

describe('detectRiskyPR (heuristic)', () => {
  it('gives low score for small, clean PR', async () => {
    const diff = makeDiff({
      files: [{ path: 'src/utils/helper.ts', linesAdded: 10, linesRemoved: 5, sensitive: false }],
      linesAdded: 10,
      linesRemoved: 5,
    });
    const result = await detectRiskyPR(diff, noLLM);
    expect(result.score).toBeLessThanOrEqual(4);
  });

  it('adds +3 for files > 50', async () => {
    const files = Array.from({ length: 55 }, (_, i) => ({
      path: `src/file${i}.ts`,
      linesAdded: 5,
      linesRemoved: 2,
      sensitive: false,
    }));
    const diff = makeDiff({ files, linesAdded: 275, linesRemoved: 110 });
    const result = await detectRiskyPR(diff, noLLM);
    expect(result.reasons.some(r => r.includes('files'))).toBe(true);
  });

  it('adds +3 for lines > 1000', async () => {
    const diff = makeDiff({
      files: [{ path: 'src/big.ts', linesAdded: 800, linesRemoved: 300, sensitive: false }],
      linesAdded: 800,
      linesRemoved: 300,
    });
    const result = await detectRiskyPR(diff, noLLM);
    expect(result.reasons.some(r => r.includes('1100') || r.includes('lines'))).toBe(true);
  });

  it('adds score for sensitive paths', async () => {
    const diff = makeDiff({
      files: [{ path: 'src/auth/login.ts', linesAdded: 50, linesRemoved: 10, sensitive: true }],
      linesAdded: 50,
      linesRemoved: 10,
    });
    const result = await detectRiskyPR(diff, noLLM);
    expect(result.reasons.some(r => r.toLowerCase().includes('auth'))).toBe(true);
  });

  it('clamps score to maximum of 10', async () => {
    const files = Array.from({ length: 60 }, (_, i) => ({
      path: `src/auth/file${i}.ts`,
      linesAdded: 30,
      linesRemoved: 10,
      sensitive: true,
    }));
    const diff = makeDiff({ files, linesAdded: 1800, linesRemoved: 600 });
    const result = await detectRiskyPR(diff, noLLM);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.score).toBeGreaterThanOrEqual(1);
  });
});
