import type { Commit } from '../types.js';
import { callLLM } from '../llm/llmClient.js';
import { buildReleaseNotesPrompt } from '../llm/prompts.js';
import { section } from '../utils/markdown.js';

interface ReleaseSection {
  features?: string[];
  fixes?: string[];
  performance?: string[];
  breaking?: string[];
}

function parseReleaseJSON(raw: string): ReleaseSection | null {
  try {
    return JSON.parse(raw) as ReleaseSection;
  } catch {
    return null;
  }
}

function formatReleaseNotes(data: ReleaseSection, from: string, to: string): string {
  const parts: string[] = [`## Release Notes: ${from} → ${to}`, ''];
  if (data.breaking?.length) parts.push(section('Breaking Changes', data.breaking));
  if (data.features?.length) parts.push(section('Features', data.features));
  if (data.fixes?.length) parts.push(section('Fixes', data.fixes));
  if (data.performance?.length) parts.push(section('Performance', data.performance));
  return parts.join('\n');
}

export async function generateReleaseNotes(commits: Commit[], from: string, to: string): Promise<string> {
  if (commits.length === 0) {
    return `## Release Notes: ${from} → ${to}\n\nNo commits found between these tags.`;
  }

  const prompt = buildReleaseNotesPrompt(commits, from, to);
  const raw = await callLLM(prompt);
  const data = raw ? parseReleaseJSON(raw) : null;

  if (!data) {
    // Fallback: use commit messages directly
    return formatReleaseNotes({ features: commits.map(c => c.message) }, from, to);
  }

  return formatReleaseNotes(data, from, to);
}
