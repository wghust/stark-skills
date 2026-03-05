import { simpleGit, type SimpleGit } from 'simple-git';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

export function initGit(repoPath: string = process.cwd()): SimpleGit {
  const absPath = resolve(repoPath);
  if (!existsSync(join(absPath, '.git'))) {
    throw new GitError(`Not a git repository: ${absPath}`);
  }
  return simpleGit(absPath, { binary: 'git', maxConcurrentProcesses: 4 });
}
