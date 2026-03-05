export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  files: string[];
}

export interface DiffFile {
  path: string;
  linesAdded: number;
  linesRemoved: number;
  sensitive: boolean;
}

export interface ParsedDiff {
  branch: string;
  base: string;
  files: DiffFile[];
  linesAdded: number;
  linesRemoved: number;
  truncated: boolean;
}

export interface CommitSummary {
  features: string[];
  fixes: string[];
  refactor: string[];
  performance: string[];
  breaking: string[];
}

export interface RiskReport {
  score: number;
  reasons: string[];
}

export interface ImpactReport {
  modules: string[];
  risks: string[];
}

export interface PRAnalysis {
  branch: string;
  summary: string;
  impactedModules: string[];
  riskScore: number;
  suggestedReviewers: string[];
  suggestedTests: string[];
}

export interface LLMPrompt {
  system: string;
  user: string;
}

export interface AnalysisOptions {
  useLLM: boolean;
  output: 'md' | 'json';
}
