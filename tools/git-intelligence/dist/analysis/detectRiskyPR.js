import { callLLM } from '../llm/llmClient.js';
import { buildRiskPrompt } from '../llm/prompts.js';
const SENSITIVE_FOLDERS = ['auth/', 'payment/', 'infra/', 'middleware/', 'cache/'];
function computeHeuristicScore(diff) {
    let score = 1;
    const reasons = [];
    const totalLines = diff.linesAdded + diff.linesRemoved;
    if (diff.files.length > 50) {
        score += 3;
        reasons.push(`Large number of files changed (${diff.files.length} files)`);
    }
    if (totalLines > 1000) {
        score += 3;
        reasons.push(`Large diff (${totalLines} lines)`);
    }
    const sensitiveHit = new Set();
    for (const file of diff.files) {
        for (const folder of SENSITIVE_FOLDERS) {
            if (file.path.includes(folder) && !sensitiveHit.has(folder)) {
                sensitiveHit.add(folder);
            }
        }
    }
    const sensitiveScore = Math.min(sensitiveHit.size * 2, 4);
    if (sensitiveScore > 0) {
        score += sensitiveScore;
        for (const folder of sensitiveHit) {
            const label = folder.replace('/', '');
            reasons.push(`${label.charAt(0).toUpperCase() + label.slice(1)} module modified`);
        }
    }
    const testFiles = diff.files.filter(f => /\.(test|spec)\.|__tests__/.test(f.path));
    const testRatio = diff.files.length > 0 ? testFiles.length / diff.files.length : 1;
    if (testRatio < 0.1) {
        score += 1;
        reasons.push('Low test coverage for changed files (<10% test files)');
    }
    return { score: Math.min(Math.max(score, 1), 10), reasons };
}
function parseLLMRisk(raw) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export async function detectRiskyPR(diff, options) {
    const heuristic = computeHeuristicScore(diff);
    if (!options.useLLM) {
        return heuristic;
    }
    const prompt = buildRiskPrompt(diff, heuristic.score);
    const raw = await callLLM(prompt);
    const llmResult = raw ? parseLLMRisk(raw) : null;
    if (!llmResult)
        return heuristic;
    const adjustment = Math.max(-2, Math.min(2, llmResult.adjustment ?? 0));
    const finalScore = Math.min(Math.max(heuristic.score + adjustment, 1), 10);
    const reasons = [...heuristic.reasons, ...(llmResult.reasons ?? [])];
    return { score: finalScore, reasons };
}
//# sourceMappingURL=detectRiskyPR.js.map