import { describe, it, expect } from 'vitest';
import {
  buildCommitSummaryPrompt,
  buildReleaseNotesPrompt,
  buildRiskPrompt,
  buildImpactPrompt,
  buildPRAnalysisPrompt,
} from './prompts.js';
import type { Commit, ParsedDiff } from '../types.js';

function makeCommit(message: string): Commit {
  return { hash: 'abc123', author: 'Dev', date: '2024-01-01', message, files: [] };
}

function makeDiff(): ParsedDiff {
  return {
    branch: 'feature/test',
    base: 'master',
    files: [{ path: 'src/auth/login.ts', linesAdded: 50, linesRemoved: 10, sensitive: true }],
    linesAdded: 50,
    linesRemoved: 10,
    truncated: false,
  };
}

describe('buildCommitSummaryPrompt', () => {
  it('returns system and user prompts', () => {
    const commits = [makeCommit('feat: add login'), makeCommit('fix: resolve bug')];
    const prompt = buildCommitSummaryPrompt(commits);
    expect(prompt.system).toBeTruthy();
    expect(prompt.user).toContain('feat: add login');
    expect(prompt.user).toContain('fix: resolve bug');
  });

  it('requests JSON format', () => {
    const prompt = buildCommitSummaryPrompt([makeCommit('feat: add something')]);
    expect(prompt.user).toContain('"features"');
    expect(prompt.user).toContain('"fixes"');
  });
});

describe('buildReleaseNotesPrompt', () => {
  it('includes version tags', () => {
    const commits = [makeCommit('feat: new feature')];
    const prompt = buildReleaseNotesPrompt(commits, 'v1.0.0', 'v1.1.0');
    expect(prompt.user).toContain('v1.0.0');
    expect(prompt.user).toContain('v1.1.0');
  });
});

describe('buildRiskPrompt', () => {
  it('includes heuristic score', () => {
    const prompt = buildRiskPrompt(makeDiff(), 7);
    expect(prompt.user).toContain('7/10');
    expect(prompt.user).toContain('auth/login.ts');
  });
});

describe('buildImpactPrompt', () => {
  it('includes changed file paths', () => {
    const prompt = buildImpactPrompt(makeDiff());
    expect(prompt.user).toContain('auth/login.ts');
  });
});

describe('buildPRAnalysisPrompt', () => {
  it('includes branch name', () => {
    const prompt = buildPRAnalysisPrompt(makeDiff(), 'feature/test');
    expect(prompt.user).toContain('feature/test');
  });

  it('prompts for risk score and test suggestions', () => {
    const prompt = buildPRAnalysisPrompt(makeDiff(), 'feature/test');
    expect(prompt.user).toContain('riskScore');
    expect(prompt.user).toContain('suggestedTests');
  });
});
