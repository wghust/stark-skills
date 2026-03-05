import type { SimpleGit } from 'simple-git';
import type { Commit } from '../types.js';
export declare function parseDuration(duration: string): string;
export declare function getCommitsSince(git: SimpleGit, duration: string): Promise<Commit[]>;
export declare function getCommitsBetweenTags(git: SimpleGit, from: string, to: string): Promise<Commit[]>;
//# sourceMappingURL=commitCollector.d.ts.map