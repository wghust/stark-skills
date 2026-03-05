export function section(title, items) {
    if (items.length === 0)
        return '';
    return `### ${title}\n${items.map(i => `- ${i}`).join('\n')}\n`;
}
export function heading(level, title) {
    return `${'#'.repeat(level)} ${title}`;
}
export function bulletList(items) {
    return items.map(i => `- ${i}`).join('\n');
}
export function keyValue(key, value) {
    return `**${key}**: ${value}`;
}
export function riskBadge(score) {
    if (score >= 8)
        return `🔴 ${score}/10`;
    if (score >= 5)
        return `🟡 ${score}/10`;
    return `🟢 ${score}/10`;
}
//# sourceMappingURL=markdown.js.map