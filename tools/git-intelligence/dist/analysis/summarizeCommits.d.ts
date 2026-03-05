import type { Commit, CommitSummary, AnalysisOptions } from '../types.js';
export declare function classifyHeuristic(commits: Commit[]): CommitSummary;
export declare function summarizeCommits(commits: Commit[], options: AnalysisOptions): Promise<CommitSummary>;
//# sourceMappingURL=summarizeCommits.d.ts.map