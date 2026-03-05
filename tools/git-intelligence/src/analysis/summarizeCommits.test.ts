import { describe, it, expect } from 'vitest';
import { classifyHeuristic } from './summarizeCommits.js';
import type { Commit } from '../types.js';

function makeCommit(message: string): Commit {
  return { hash: 'abc', author: 'Test', date: '2024-01-01', message, files: [] };
}

describe('classifyHeuristic', () => {
  it('classifies feature commits', () => {
    const result = classifyHeuristic([makeCommit('feat: add user authentication')]);
    expect(result.features).toContain('feat: add user authentication');
  });

  it('classifies fix commits', () => {
    const result = classifyHeuristic([makeCommit('fix: resolve login redirect bug')]);
    expect(result.fixes).toContain('fix: resolve login redirect bug');
  });

  it('classifies refactor commits', () => {
    const result = classifyHeuristic([makeCommit('refactor: clean up auth module')]);
    expect(result.refactor).toContain('refactor: clean up auth module');
  });

  it('classifies performance commits', () => {
    const result = classifyHeuristic([makeCommit('perf: optimize news list rendering')]);
    expect(result.performance).toContain('perf: optimize news list rendering');
  });

  it('classifies breaking change commits', () => {
    const result = classifyHeuristic([makeCommit('feat!: BREAKING CHANGE remove v1 API')]);
    expect(result.breaking).toContain('feat!: BREAKING CHANGE remove v1 API');
  });

  it('handles empty commit list', () => {
    const result = classifyHeuristic([]);
    expect(result.features).toHaveLength(0);
    expect(result.fixes).toHaveLength(0);
  });

  it('defaults unknown commits to features', () => {
    const result = classifyHeuristic([makeCommit('chore: update CI config')]);
    expect(result.features).toContain('chore: update CI config');
  });
});
