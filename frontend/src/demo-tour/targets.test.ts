import { describe, expect, it } from 'vitest';
import { findTourTarget, tourTargetSelector } from './targets';

describe('tour targets', () => {
  it('builds a data-demo-tour selector', () => {
    expect(tourTargetSelector('hero')).toBe('[data-demo-tour="hero"]');
  });

  it('returns null without a document root', () => {
    expect(findTourTarget('hero', null)).toBeNull();
  });
});
