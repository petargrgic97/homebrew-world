import { describe, it, expect } from 'vitest';
import { isAllowedDmUid, parseAllowlist } from '@/lib/auth/allowlist';

describe('parseAllowlist', () => {
  it('returns [] for undefined', () => {
    expect(parseAllowlist(undefined)).toEqual([]);
  });
  it('splits comma-separated, trims whitespace, filters empties', () => {
    expect(parseAllowlist('abc, def , ,ghi')).toEqual(['abc', 'def', 'ghi']);
  });
});

describe('isAllowedDmUid', () => {
  it('returns false for null uid', () => {
    expect(isAllowedDmUid(null, ['abc'])).toBe(false);
  });
  it('returns false when uid not in list', () => {
    expect(isAllowedDmUid('zzz', ['abc', 'def'])).toBe(false);
  });
  it('returns true when uid in list', () => {
    expect(isAllowedDmUid('abc', ['abc', 'def'])).toBe(true);
  });
  it('returns false when allowlist empty', () => {
    expect(isAllowedDmUid('abc', [])).toBe(false);
  });
});
