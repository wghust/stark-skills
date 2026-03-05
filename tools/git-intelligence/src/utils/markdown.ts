export function section(title: string, items: string[]): string {
  if (items.length === 0) return '';
  return `### ${title}\n${items.map(i => `- ${i}`).join('\n')}\n`;
}

export function heading(level: number, title: string): string {
  return `${'#'.repeat(level)} ${title}`;
}

export function bulletList(items: string[]): string {
  return items.map(i => `- ${i}`).join('\n');
}

export function keyValue(key: string, value: string | number): string {
  return `**${key}**: ${value}`;
}

export function riskBadge(score: number): string {
  if (score >= 8) return `🔴 ${score}/10`;
  if (score >= 5) return `🟡 ${score}/10`;
  return `🟢 ${score}/10`;
}
