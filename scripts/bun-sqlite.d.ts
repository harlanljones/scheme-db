/** The slice of Bun's built-in SQLite driver that scripts/release.ts uses. Bun ships the module; this keeps `tsc` from needing @types/bun. */
declare module 'bun:sqlite' {
  type Value = string | number | boolean | null;
  interface Statement {
    run(...params: Value[]): void;
    get(...params: Value[]): unknown;
    all(...params: Value[]): unknown[];
  }
  export class Database {
    constructor(path: string, options?: { create?: boolean; readonly?: boolean });
    run(sql: string): void;
    prepare(sql: string): Statement;
    query(sql: string): Statement;
    transaction(fn: () => void): () => void;
    close(): void;
  }
}
