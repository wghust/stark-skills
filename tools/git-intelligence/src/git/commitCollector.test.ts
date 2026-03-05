import { describe, it, expect } from 'vitest';
import { parseDuration } from './commitCollector.js';

describe('parseDuration', () => {
  it('parses days correctly', () => {
    const result = parseDuration('7d');
    const date = new Date(result);
    const expected = new Date();
    expected.setDate(expected.getDate() - 7);
    expect(date.toDateString()).toBe(expected.toDateString());
  });

  it('parses weeks correctly', () => {
    const result = parseDuration('2w');
    const date = new Date(result);
    const expected = new Date();
    expected.setDate(expected.getDate() - 14);
    expect(date.toDateString()).toBe(expected.toDateString());
  });

  it('parses months correctly', () => {
    const result = parseDuration('1mo');
    const date = new Date(result);
    const expected = new Date();
    expected.setMonth(expected.getMonth() - 1);
    expect(date.toDateString()).toBe(expected.toDateString());
  });

  it('passes through ISO date unchanged', () => {
    expect(parseDuration('2024-01-15')).toBe('2024-01-15');
  });

  it('passes through unknown strings unchanged', () => {
    expect(parseDuration('yesterday')).toBe('yesterday');
  });
});
