import { describe, expect, it } from 'vitest';
import { library } from '../data';

/** Every string in a record, with its path. */
function* strings(value: unknown, path = ''): Generator<[string, string]> {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, `${path}/${k}`);
}

describe('claims in the data', () => {
  /**
   * SchemeDB scores how alike two plays look over the first 1.2 seconds, and the best pairs score 96 or 97, not 100.
   * Copy that says the plays are identical or indistinguishable for that window contradicts the numbers beside it.
   */
  it('never says two plays are identical or indistinguishable over the first 1.2 seconds or first second', () => {
    const lib = library();
    const offenders: string[] = [];
    for (const [kind, records] of Object.entries(lib.dataset)) {
      for (const [i, record] of (records as unknown[]).entries()) {
        for (const [path, text] of strings(record)) {
          const claims = /identical|indistinguishable|exactly the same|exact same/i.test(text);
          const window = /1\.2|first (full )?second|0\.0\s?s/i.test(text);
          if (claims && window) offenders.push(`${kind}[${i}]${path}: ${text.slice(0, 120)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
