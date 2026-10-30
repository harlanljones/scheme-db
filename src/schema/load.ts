import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECORD_KINDS, type Dataset, type RecordKind } from './schema';

export const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');

export const RECORD_KIND_NAMES = Object.keys(RECORD_KINDS) as RecordKind[];

/** Data files for each kind, as paths relative to the data directory (`concepts/foo/bar.json`). */
export type RecordFiles = Record<RecordKind, string[]>;

export interface LoadResult {
  dataset: Dataset;
  /** Parallel to `dataset`: the file each record was read from, in the same order. */
  files: RecordFiles;
  /** Files that could not be read or failed schema validation. */
  problems: string[];
}

function listJson(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJson(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out.sort();
}

export function loadDataset(dataDir: string = DATA_DIR): LoadResult {
  const problems: string[] = [];
  const dataset: Dataset = { schemes: [], concepts: [], tracks: [], coaches: [], lineages: [], glossary: [] };
  const files: RecordFiles = { schemes: [], concepts: [], tracks: [], coaches: [], lineages: [], glossary: [] };

  for (const kind of RECORD_KIND_NAMES) {
    const schema = RECORD_KINDS[kind];
    for (const full of listJson(path.join(dataDir, kind))) {
      const rel = path.relative(dataDir, full).split(path.sep).join('/');
      let raw: unknown;
      try {
        raw = JSON.parse(fs.readFileSync(full, 'utf-8'));
      } catch (err) {
        problems.push(`${rel}: invalid JSON (${(err as Error).message})`);
        continue;
      }
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          problems.push(`${rel}: ${issue.path.join('.') || '(root)'}: ${issue.message}`);
        }
        continue;
      }
      (dataset[kind] as unknown[]).push(parsed.data);
      files[kind].push(rel);
    }
  }

  return { dataset, files, problems };
}
