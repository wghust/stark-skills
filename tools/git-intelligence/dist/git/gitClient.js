import { simpleGit } from 'simple-git';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
export class GitError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GitError';
    }
}
export function initGit(repoPath = process.cwd()) {
    const absPath = resolve(repoPath);
    if (!existsSync(join(absPath, '.git'))) {
        throw new GitError(`Not a git repository: ${absPath}`);
    }
    return simpleGit(absPath, { binary: 'git', maxConcurrentProcesses: 4 });
}
//# sourceMappingURL=gitClient.js.map