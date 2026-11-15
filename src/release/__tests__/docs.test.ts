import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../schema/load';
import { buildTables } from '../tables';

const root = path.resolve(__dirname, '../../..');
const read = (file: string): string => fs.readFileSync(path.join(root, file), 'utf-8');
const tables = buildTables(loadDataset().dataset, 'test').length;

describe('the docs that count the CSV tables', () => {
  it('say how many the release builds', () => {
    expect(/(\d+) flat tables/.exec(read('data/README.md'))?.[1], 'data/README.md says "N flat tables"').toBe(String(tables));
    expect(/(\d+) CSV tables/.exec(read('PRODUCT.md'))?.[1], 'PRODUCT.md says "N CSV tables"').toBe(String(tables));
  });
});
