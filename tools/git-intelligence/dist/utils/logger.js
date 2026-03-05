function write(level, message) {
    process.stderr.write(`[git-intelligence] ${level}: ${message}\n`);
}
export function info(message) {
    write('INFO', message);
}
export function warn(message) {
    write('WARN', message);
}
export function error(message) {
    write('ERROR', message);
}
//# sourceMappingURL=logger.js.map