import type { Commit, CommitSummary, AnalysisOptions } from '../types.js';
import { callLLM } from '../llm/llmClient.js';
import { buildCommitSummaryPrompt } from '../llm/prompts.js';

const KEYWORD_MAP: Array<{ keywords: RegExp; category: keyof CommitSummary }> = [
  { keywords: /BREAKING[\s_]CHANGE|!:/i, category: 'breaking' },
  { keywords: /\b(fix|bug|patch|resolve|hotfix|repair)\b/i, category: 'fixes' },
  { keywords: /\b(refactor|clean|move|rename|reorganize|restructure)\b/i, category: 'refactor' },
  { keywords: /\b(perf|performance|optim|speed|fast|slow|latency|cache)\b/i, category: 'performance' },
  { keywords: /\b(feat|feature|add|new|implement|support)\b/i, category: 'features' },
];

function classifyByKeyword(message: string): keyof CommitSummary {
  for (const { keywords, category } of KEYWORD_MAP) {
    if (keywords.test(message)) return category;
  }
  return 'features'; // default bucket
}

export function classifyHeuristic(commits: Commit[]): CommitSummary {
  const summary: CommitSummary = { features: [], fixes: [], refactor: [], performance: [], breaking: [] };
  for (const c of commits) {
    summary[classifyByKeyword(c.message)].push(c.message);
  }
  return summary;
}

function parseLLMSummary(raw: string): CommitSummary | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CommitSummary>;
    return {
      features: parsed.features ?? [],
      fixes: parsed.fixes ?? [],
      refactor: parsed.refactor ?? [],
      performance: parsed.performance ?? [],
      breaking: parsed.breaking ?? [],
    };
  } catch {
    return null;
  }
}

export async function summarizeCommits(commits: Commit[], options: AnalysisOptions): Promise<CommitSummary> {
  if (commits.length === 0) {
    return { features: [], fixes: [], refactor: [], performance: [], breaking: [] };
  }

  if (!options.useLLM) {
    return classifyHeuristic(commits);
  }

  const prompt = buildCommitSummaryPrompt(commits);
  const raw = await callLLM(prompt);
  const parsed = raw ? parseLLMSummary(raw) : null;
  return parsed ?? classifyHeuristic(commits);
}
