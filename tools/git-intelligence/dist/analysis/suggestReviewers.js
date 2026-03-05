import { warn } from '../utils/logger.js';
const MAX_FILES_TO_BLAME = 20;
const SENSITIVE_ROLE_MAP = [
    { path: 'auth/', role: 'security team' },
    { path: 'payment/', role: 'payments team' },
    { path: 'infra/', role: 'infra team' },
    { path: 'middleware/', role: 'backend team' },
    { path: 'cache/', role: 'infrastructure team' },
];
function parseBlame(blame, scores) {
    const lines = blame.split('\n');
    let currentEmail = '';
    let currentName = '';
    for (const line of lines) {
        if (line.startsWith('author-mail ')) {
            currentEmail = line.slice(12).replace(/[<>]/g, '').trim();
        }
        else if (line.startsWith('author ') && !line.startsWith('author-')) {
            currentName = line.slice(7).trim();
        }
        else if (/^[0-9a-f]{40} \d+ \d+/.test(line)) {
            if (!currentEmail || currentEmail === 'not.committed.yet')
                continue;
            const existing = scores.get(currentEmail);
            if (existing) {
                existing.score++;
            }
            else {
                scores.set(currentEmail, { name: currentName, score: 1 });
            }
        }
    }
}
export async function suggestReviewers(git, diff) {
    const scores = new Map();
    const filesToBlame = diff.files
        .filter(f => f.linesAdded + f.linesRemoved > 0 && !f.path.endsWith('/'))
        .slice(0, MAX_FILES_TO_BLAME);
    for (const file of filesToBlame) {
        try {
            const blame = await git.raw(['blame', '--porcelain', '--', file.path]);
            parseBlame(blame, scores);
        }
        catch {
            warn(`Could not blame ${file.path} — skipping`);
        }
    }
    const topAuthors = [...scores.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(a => a.name)
        .filter(Boolean);
    if (topAuthors.length >= 2)
        return topAuthors;
    // Sensitive-path role fallback when not enough blame authors found
    const roleFallbacks = [];
    const addedRoles = new Set();
    for (const file of diff.files.filter(f => f.sensitive)) {
        for (const { path, role } of SENSITIVE_ROLE_MAP) {
            if (file.path.includes(path) && !addedRoles.has(role)) {
                addedRoles.add(role);
                roleFallbacks.push(role);
            }
        }
    }
    return [...topAuthors, ...roleFallbacks].slice(0, 5);
}
//# sourceMappingURL=suggestReviewers.js.map