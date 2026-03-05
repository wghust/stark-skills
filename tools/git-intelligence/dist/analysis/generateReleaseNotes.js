import { callLLM } from '../llm/llmClient.js';
import { buildReleaseNotesPrompt } from '../llm/prompts.js';
import { section } from '../utils/markdown.js';
function parseReleaseJSON(raw) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function formatReleaseNotes(data, from, to) {
    const parts = [`## Release Notes: ${from} → ${to}`, ''];
    if (data.breaking?.length)
        parts.push(section('Breaking Changes', data.breaking));
    if (data.features?.length)
        parts.push(section('Features', data.features));
    if (data.fixes?.length)
        parts.push(section('Fixes', data.fixes));
    if (data.performance?.length)
        parts.push(section('Performance', data.performance));
    return parts.join('\n');
}
export async function generateReleaseNotes(commits, from, to) {
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
//# sourceMappingURL=generateReleaseNotes.js.map