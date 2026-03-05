import type { Commit, ParsedDiff, LLMPrompt } from '../types.js';

const MAX_CHARS = 32_000; // ~8000 tokens at 4 chars/token

function truncate(text: string, label = 'items'): string {
  if (text.length <= MAX_CHARS) return text;
  const truncated = text.slice(0, MAX_CHARS);
  return truncated + `\n\n[truncated — some ${label} omitted to fit context window]`;
}

function formatCommits(commits: Commit[]): string {
  return truncate(
    commits.map((c, i) => `${i + 1}. ${c.message} (by ${c.author})`).join('\n'),
    'commits',
  );
}

function formatDiff(diff: ParsedDiff): string {
  const lines = [
    `Branch: ${diff.branch} (vs ${diff.base})`,
    `Files changed: ${diff.files.length}`,
    `Lines added: ${diff.linesAdded}, removed: ${diff.linesRemoved}`,
    diff.truncated ? '[Large diff — truncated]' : '',
    '',
    'Changed files:',
    ...diff.files.map(f => {
      const sensitive = f.sensitive ? ' [SENSITIVE]' : '';
      return `  ${f.path} (+${f.linesAdded}/-${f.linesRemoved})${sensitive}`;
    }),
  ].filter(l => l !== undefined);
  return truncate(lines.join('\n'), 'files');
}

export function buildCommitSummaryPrompt(commits: Commit[]): LLMPrompt {
  return {
    system: `You are a senior software engineer analyzing git commit history.
Classify the given commits into categories and return ONLY valid JSON — no markdown fences, no explanation.`,
    user: `Here are the commit messages:

${formatCommits(commits)}

Classify each commit into one of these categories:
- features
- fixes
- refactor
- performance
- breaking

Return JSON in this exact format:
{
  "features": ["commit message..."],
  "fixes": ["..."],
  "refactor": ["..."],
  "performance": ["..."],
  "breaking": ["..."]
}`,
  };
}

export function buildReleaseNotesPrompt(commits: Commit[], from: string, to: string): LLMPrompt {
  return {
    system: `You are a technical writer creating professional release notes for a software product.
Write concise, user-facing bullet points. Return ONLY valid JSON — no markdown fences.`,
    user: `Generate release notes for version ${from} → ${to}.

Commits:
${formatCommits(commits)}

Return JSON in this exact format (omit empty arrays):
{
  "features": ["User-facing description..."],
  "fixes": ["..."],
  "performance": ["..."],
  "breaking": ["..."]
}`,
  };
}

export function buildPRAnalysisPrompt(diff: ParsedDiff, branch: string): LLMPrompt {
  return {
    system: `You are a senior software engineer reviewing a pull request.
Analyze the diff and return ONLY valid JSON — no markdown fences, no explanation.`,
    user: `Analyze this pull request for branch "${branch}":

${formatDiff(diff)}

Return JSON in this exact format:
{
  "summary": "One paragraph describing what this PR does",
  "impactedModules": ["module name", "..."],
  "riskScore": 7,
  "suggestedTests": [
    "Test scenario description",
    "..."
  ]
}

Risk score is 1 (trivial) to 10 (critical). Be realistic.`,
  };
}

export function buildRiskPrompt(diff: ParsedDiff, heuristicScore: number): LLMPrompt {
  return {
    system: `You are a senior software engineer assessing the risk of a code change.
Return ONLY valid JSON — no markdown fences.`,
    user: `A heuristic analysis gave this PR a risk score of ${heuristicScore}/10.

Diff summary:
${formatDiff(diff)}

Review the diff and decide if the heuristic score is appropriate.
You may adjust it by ±2 based on code quality signals, test coverage, or change scope.

Return JSON:
{
  "score": ${heuristicScore},
  "adjustment": 0,
  "reasons": [
    "Specific reason 1",
    "Specific reason 2"
  ]
}`,
  };
}

export function buildImpactPrompt(diff: ParsedDiff): LLMPrompt {
  return {
    system: `You are a software architect analyzing the impact of code changes on a system.
Return ONLY valid JSON — no markdown fences.`,
    user: `Analyze which logical modules and system areas are affected by this change:

${formatDiff(diff)}

Map file paths to logical module names (e.g., "src/auth/login.ts" → "authentication").
Identify potential risks from these changes.

Return JSON:
{
  "modules": ["module name", "..."],
  "risks": [
    "Potential risk description",
    "..."
  ]
}`,
  };
}
