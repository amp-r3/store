import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from './safeRedirectPath';

describe('safeRedirectPath', () => {
  it('falls back to / for null, undefined, or empty input', () => {
    expect(safeRedirectPath(null)).toBe('/');
    expect(safeRedirectPath(undefined)).toBe('/');
    expect(safeRedirectPath('')).toBe('/');
  });

  it('falls back to / for an absolute external URL', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/');
    expect(safeRedirectPath('evil.com')).toBe('/');
  });

  it('falls back to / for a protocol-relative URL', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/');
  });

  it('falls back to / for a backslash-prefixed path', () => {
    expect(safeRedirectPath('/\\evil.com')).toBe('/');
  });

  it('passes through a legitimate same-app path unchanged', () => {
    expect(safeRedirectPath('/user/orders?tab=1#x')).toBe('/user/orders?tab=1#x');
  });

  it('blocks a tab embedded before a protocol-relative path (stripped like a browser would)', () => {
    expect(safeRedirectPath('/\t//evil.com')).toBe('/');
    expect(safeRedirectPath('/\n//evil.com')).toBe('/');
    expect(safeRedirectPath('/\r//evil.com')).toBe('/');
  });

  it('blocks a leading-whitespace variant of an external URL', () => {
    expect(safeRedirectPath('  //evil.com')).toBe('/');
    expect(safeRedirectPath('\t//evil.com')).toBe('/');
  });

  it('trims incidental leading/trailing whitespace off an otherwise-safe path', () => {
    expect(safeRedirectPath('  /user/orders  ')).toBe('/user/orders');
  });
});
