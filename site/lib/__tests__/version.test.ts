import { describe, expect, it } from 'vitest';
import { readDataVersion } from '../../../src/release/version';
import { dataVersion } from '../data';

describe('the version the Data page names', () => {
  it('is the version the downloads carry, which comes from data/VERSION', () => {
    expect(dataVersion()).toBe(process.env.DATA_VERSION?.trim() || readDataVersion());
    expect(dataVersion()).not.toBe('dev');
  });
});
