function write(level: string, message: string): void {
  process.stderr.write(`[git-intelligence] ${level}: ${message}\n`);
}

export function info(message: string): void {
  write('INFO', message);
}

export function warn(message: string): void {
  write('WARN', message);
}

export function error(message: string): void {
  write('ERROR', message);
}
