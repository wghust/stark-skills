#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Command } from 'commander';

import { initGit, GitError } from './git/gitClient.js';
import { getCommitsSince, getCommitsBetweenTags } from './git/commitCollector.js';
import { getBranchDiff } from './git/diffParser.js';
import { summarizeCommits } from './analysis/summarizeCommits.js';
import { generateReleaseNotes } from './analysis/generateReleaseNotes.js';
import { detectRiskyPR } from './analysis/detectRiskyPR.js';
import { changeImpact } from './analysis/changeImpact.js';
import { suggestReviewers } from './analysis/suggestReviewers.js';
import { error } from './utils/logger.js';
import { section, riskBadge, bulletList } from './utils/markdown.js';
import type { AnalysisOptions, CommitSummary, RiskReport, ImpactReport, PRAnalysis } from './types.js';

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8')) as { version: string };

// ---- Output helpers ----

function print(text: string): void {
  process.stdout.write(text + '\n');
}

function printCommitSummary(summary: CommitSummary, since: string, format: string): void {
  if (format === 'json') {
    print(JSON.stringify({ since, summary }, null, 2));
    return;
  }
  const parts = [
    '## Commit Summary\n',
    section('Features', summary.features),
    section('Fixes', summary.fixes),
    section('Refactor', summary.refactor),
    section('Performance', summary.performance),
    section('Breaking Changes', summary.breaking),
  ].filter(Boolean);
  print(parts.join('\n'));
}

function printRiskReport(report: RiskReport, branch: string, format: string): void {
  if (format === 'json') {
    print(JSON.stringify({ branch, ...report }, null, 2));
    return;
  }
  print(`## Risk Assessment: ${branch}\n`);
  print(`**Risk Score**: ${riskBadge(report.score)}\n`);
  if (report.reasons.length > 0) {
    print('**Reasons**:\n');
    print(bulletList(report.reasons));
  }
}

function printImpactReport(report: ImpactReport, branch: string, format: string): void {
  if (format === 'json') {
    print(JSON.stringify({ branch, ...report }, null, 2));
    return;
  }
  print(`## Change Impact: ${branch}\n`);
  print(section('Modules Affected', report.modules));
  print(section('Potential Risks', report.risks));
}

function printPRAnalysis(analysis: PRAnalysis, format: string): void {
  if (format === 'json') {
    print(JSON.stringify(analysis, null, 2));
    return;
  }
  print(`## PR Analysis: ${analysis.branch}\n`);
  print(`### Summary\n${analysis.summary}\n`);
  print(section('Impacted Modules', analysis.impactedModules));
  print(`### Risk Score\n${riskBadge(analysis.riskScore)}\n`);
  print(section('Suggested Reviewers', analysis.suggestedReviewers));
  print(section('Suggested Tests', analysis.suggestedTests));
}

// ---- CLI ----

const program = new Command();

program
  .name('git-intelligence')
  .description('AI-powered git repository analysis')
  .version(pkg.version, '-v, --version')
  .option('--repo <path>', 'Path to git repository', process.cwd())
  .option('--output <format>', 'Output format: md or json', 'md')
  .option('--no-llm', 'Skip LLM analysis, use heuristics only');

// summarize-commits
program
  .command('summarize-commits')
  .description('Summarize commits since a given time')
  .requiredOption('--since <duration>', 'Time range: 7d, 2w, 1mo, or ISO date')
  .action(async (opts: { since: string }) => {
    const parent = program.opts<{ repo: string; output: string; llm: boolean }>();
    const options: AnalysisOptions = { useLLM: parent.llm, output: parent.output as 'md' | 'json' };
    try {
      const git = initGit(parent.repo);
      const commits = await getCommitsSince(git, opts.since);
      const summary = await summarizeCommits(commits, options);
      printCommitSummary(summary, opts.since, parent.output);
    } catch (err) {
      handleError(err);
    }
  });

// release-notes
program
  .command('release-notes')
  .description('Generate release notes between two tags')
  .requiredOption('--from <tag>', 'Start tag (exclusive)')
  .requiredOption('--to <tag>', 'End tag (inclusive)')
  .action(async (opts: { from: string; to: string }) => {
    const parent = program.opts<{ repo: string; output: string; llm: boolean }>();
    try {
      const git = initGit(parent.repo);
      const commits = await getCommitsBetweenTags(git, opts.from, opts.to);
      const notes = await generateReleaseNotes(commits, opts.from, opts.to);
      print(notes);
    } catch (err) {
      handleError(err);
    }
  });

// analyze-pr
program
  .command('analyze-pr')
  .description('Comprehensive PR analysis with risk, impact, and reviewer suggestions')
  .requiredOption('--branch <branch>', 'Feature branch to analyze')
  .option('--base <branch>', 'Base branch (default: auto-detected)')
  .action(async (opts: { branch: string; base?: string }) => {
    const parent = program.opts<{ repo: string; output: string; llm: boolean }>();
    const options: AnalysisOptions = { useLLM: parent.llm, output: parent.output as 'md' | 'json' };
    try {
      const git = initGit(parent.repo);
      const diff = await getBranchDiff(git, opts.branch, opts.base);
      const [impact, risk, reviewers] = await Promise.all([
        changeImpact(diff, options),
        detectRiskyPR(diff, options),
        suggestReviewers(git, diff),
      ]);

      // For test suggestions, use impact risks or LLM-derived items
      const suggestedTests = impact.risks.length > 0
        ? impact.risks.map(r => `Test scenario for: ${r}`)
        : ['Integration test for affected modules', 'Regression test on main user flows'];

      const analysis: PRAnalysis = {
        branch: opts.branch,
        summary: impact.modules.length > 0
          ? `Changes affect: ${impact.modules.join(', ')}`
          : `Branch ${opts.branch} contains ${diff.files.length} changed files`,
        impactedModules: impact.modules,
        riskScore: risk.score,
        suggestedReviewers: reviewers,
        suggestedTests,
      };
      printPRAnalysis(analysis, parent.output);
    } catch (err) {
      handleError(err);
    }
  });

// detect-risk
program
  .command('detect-risk')
  .description('Detect risky changes with heuristic and LLM analysis')
  .requiredOption('--branch <branch>', 'Feature branch to analyze')
  .option('--base <branch>', 'Base branch (default: auto-detected)')
  .action(async (opts: { branch: string; base?: string }) => {
    const parent = program.opts<{ repo: string; output: string; llm: boolean }>();
    const options: AnalysisOptions = { useLLM: parent.llm, output: parent.output as 'md' | 'json' };
    try {
      const git = initGit(parent.repo);
      const diff = await getBranchDiff(git, opts.branch, opts.base);
      const report = await detectRiskyPR(diff, options);
      printRiskReport(report, opts.branch, parent.output);
    } catch (err) {
      handleError(err);
    }
  });

// impact
program
  .command('impact')
  .description('Analyze module-level impact of branch changes')
  .requiredOption('--branch <branch>', 'Feature branch to analyze')
  .option('--base <branch>', 'Base branch (default: auto-detected)')
  .action(async (opts: { branch: string; base?: string }) => {
    const parent = program.opts<{ repo: string; output: string; llm: boolean }>();
    const options: AnalysisOptions = { useLLM: parent.llm, output: parent.output as 'md' | 'json' };
    try {
      const git = initGit(parent.repo);
      const diff = await getBranchDiff(git, opts.branch, opts.base);
      const report = await changeImpact(diff, options);
      printImpactReport(report, opts.branch, parent.output);
    } catch (err) {
      handleError(err);
    }
  });

function handleError(err: unknown): void {
  if (err instanceof GitError) {
    error(err.message);
  } else if (err instanceof Error) {
    error(err.message);
  } else {
    error(String(err));
  }
  process.exit(1);
}

program.parse();
