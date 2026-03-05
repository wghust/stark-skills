import type { SimpleGit } from 'simple-git';
import type { ParsedDiff, DiffFile } from '../types.js';

const SENSITIVE_PATHS = ['auth/', 'payment/', 'infra/', 'middleware/', 'cache/'];
const MAX_LINES_BEFORE_TRUNCATE = 5000;

function isSensitive(filePath: string): boolean {
  return SENSITIVE_PATHS.some(p => filePath.includes(p));
}

async function detectBaseBranch(git: SimpleGit): Promise<string> {
  try {
    const ref = await git.raw(['symbolic-ref', 'refs/remotes/origin/HEAD']);
    const trimmed = ref.trim();
    // e.g. "refs/remotes/origin/master" → "master"
    const parts = trimmed.split('/');
    return parts[parts.length - 1] ?? 'master';
  } catch {
    return 'master';
  }
}

function parseNumstat(numstat: string): DiffFile[] {
  return numstat
    .split('\n')
    .filter(l => l.trim().length > 0)
    .map(line => {
      const parts = line.split('\t');
      if (parts.length < 3) return null;
      const [added, removed, ...rest] = parts;
      const filePath = rest.join('\t').trim();
      return {
        path: filePath,
        linesAdded: added === '-' ? 0 : parseInt(added, 10),
        linesRemoved: removed === '-' ? 0 : parseInt(removed, 10),
        sensitive: isSensitive(filePath),
      } satisfies DiffFile;
    })
    .filter((f): f is DiffFile => f !== null && f.path.length > 0);
}

export async function getBranchDiff(git: SimpleGit, branch: string, base?: string): Promise<ParsedDiff> {
  const resolvedBase = base ?? (await detectBaseBranch(git));

  const numstat = await git.raw(['diff', `${resolvedBase}...${branch}`, '--numstat']);
  const files = parseNumstat(numstat);

  const linesAdded = files.reduce((s, f) => s + f.linesAdded, 0);
  const linesRemoved = files.reduce((s, f) => s + f.linesRemoved, 0);

  return {
    branch,
    base: resolvedBase,
    files,
    linesAdded,
    linesRemoved,
    truncated: linesAdded + linesRemoved > MAX_LINES_BEFORE_TRUNCATE,
  };
}
