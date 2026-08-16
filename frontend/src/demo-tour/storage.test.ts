import { describe, expect, it } from 'vitest';
import { createTourStorage, memoryStorage } from './storage';

describe('tour storage', () => {
  it('stores skip and complete reasons', () => {
    const storage = createTourStorage('test.tour', memoryStorage);
    storage.clear();
    expect(storage.hasBeenSeen()).toBe(false);
    storage.markSeen('skipped');
    expect(storage.hasBeenSeen()).toBe(true);
    expect(storage.readReason()).toBe('skipped');
  });
});
