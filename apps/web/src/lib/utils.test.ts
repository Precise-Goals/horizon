import { describe, expect, it } from 'bun:test';
import { cn } from './utils';

describe('UI Utilities (apps/web/src/lib/utils.ts)', () => {
  it('merges class names correctly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('handles conditional expressions and falsey values', () => {
    const isPrimary = false;
    const isSecondary = true;
    expect(cn('btn', isPrimary && 'btn-primary', isSecondary && 'btn-secondary', null, undefined)).toBe(
      'btn btn-secondary'
    );
  });

  it('resolves conflicting tailwind utility classes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
