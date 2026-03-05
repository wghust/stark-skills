import type { Commit, ParsedDiff, LLMPrompt } from '../types.js';
export declare function buildCommitSummaryPrompt(commits: Commit[]): LLMPrompt;
export declare function buildReleaseNotesPrompt(commits: Commit[], from: string, to: string): LLMPrompt;
export declare function buildPRAnalysisPrompt(diff: ParsedDiff, branch: string): LLMPrompt;
export declare function buildRiskPrompt(diff: ParsedDiff, heuristicScore: number): LLMPrompt;
export declare function buildImpactPrompt(diff: ParsedDiff): LLMPrompt;
//# sourceMappingURL=prompts.d.ts.map