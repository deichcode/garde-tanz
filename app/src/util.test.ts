import { describe, expect, it } from 'vitest';
import { ago, daysSince } from './util';

describe('Zeitangaben', () => {
  const t0 = Date.parse('2026-11-22T12:00:00Z');
  it('relativ auf Deutsch', () => {
    expect(ago('2026-11-22T11:59:30Z', t0)).toBe('gerade eben');
    expect(ago('2026-11-22T11:55:00Z', t0)).toBe('vor 5 Min.');
    expect(ago('2026-11-22T09:00:00Z', t0)).toBe('vor 3 Std.');
    expect(ago('2026-11-21T10:00:00Z', t0)).toBe('gestern');
    expect(ago('2026-11-18T12:00:00Z', t0)).toBe('vor 4 Tagen');
    expect(ago('2026-10-01T12:00:00Z', t0)).toBe('am 01.10.2026');
  });
  it('Tage seit', () => expect(daysSince('2026-10-23T12:00:00Z', t0)).toBe(30));
});
