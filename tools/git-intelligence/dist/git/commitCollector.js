const DURATION_RE = /^(\d+)(d|w|mo)$/;
export function parseDuration(duration) {
    const match = DURATION_RE.exec(duration);
    if (!match)
        return duration; // treat as ISO date passthrough
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const date = new Date();
    if (unit === 'd')
        date.setDate(date.getDate() - amount);
    else if (unit === 'w')
        date.setDate(date.getDate() - amount * 7);
    else if (unit === 'mo')
        date.setMonth(date.getMonth() - amount);
    return date.toISOString().split('T')[0];
}
function toCommits(entries) {
    return entries.map(e => ({
        hash: e.hash,
        author: e.author_name,
        date: e.date,
        message: e.message,
        files: [],
    }));
}
export async function getCommitsSince(git, duration) {
    const since = parseDuration(duration);
    const log = await git.log({ '--since': since });
    return toCommits(log.all);
}
export async function getCommitsBetweenTags(git, from, to) {
    // Verify both tags exist before running log
    for (const tag of [from, to]) {
        try {
            await git.raw(['rev-parse', '--verify', `refs/tags/${tag}`]);
        }
        catch {
            throw new Error(`Tag not found: ${tag}`);
        }
    }
    const log = await git.log({ from, to });
    return toCommits(log.all);
}
//# sourceMappingURL=commitCollector.js.map