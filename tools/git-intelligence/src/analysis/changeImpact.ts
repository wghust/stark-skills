import type { ParsedDiff, ImpactReport, AnalysisOptions } from '../types.js';
import { callLLM } from '../llm/llmClient.js';
import { buildImpactPrompt } from '../llm/prompts.js';

function parseLLMImpact(raw: string): ImpactReport | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ImpactReport>;
    return {
      modules: parsed.modules ?? [],
      risks: parsed.risks ?? [],
    };
  } catch {
    return null;
  }
}

function inferModulesHeuristic(diff: ParsedDiff): ImpactReport {
  const moduleSet = new Set<string>();
  const risks: string[] = [];

  for (const file of diff.files) {
    const parts = file.path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      moduleSet.add(`${parts[0]}/${parts[1]}`);
    } else if (parts.length === 1) {
      moduleSet.add(parts[0]);
    }

    if (file.sensitive) {
      risks.push(`Sensitive module modified: ${file.path}`);
    }
  }

  if (diff.truncated) {
    risks.push('Large diff — some impact areas may not be listed');
  }

  return {
    modules: [...moduleSet].slice(0, 10),
    risks: [...new Set(risks)],
  };
}

export async function changeImpact(diff: ParsedDiff, options: AnalysisOptions): Promise<ImpactReport> {
  if (!options.useLLM) {
    return inferModulesHeuristic(diff);
  }

  const prompt = buildImpactPrompt(diff);
  const raw = await callLLM(prompt);
  const parsed = raw ? parseLLMImpact(raw) : null;
  return parsed ?? inferModulesHeuristic(diff);
}
