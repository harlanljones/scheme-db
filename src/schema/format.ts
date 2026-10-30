const LINE_WIDTH = 120;

const isPrimitive = (v: unknown): boolean => v === null || typeof v !== 'object';

/**
 * Canonical JSON formatting for data files: two-space indent, short flat arrays and
 * flat objects (a waypoint, a list of ids) on one line, everything else one entry per line.
 * Deterministic, so a data file can be checked byte for byte against its parsed content.
 */
export function formatJson(value: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  const inner = `${pad}  `;

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every(isPrimitive)) {
      const inline = `[${value.map((v) => JSON.stringify(v)).join(', ')}]`;
      if (pad.length + inline.length <= LINE_WIDTH) return inline;
    }
    return `[\n${value.map((v) => `${inner}${formatJson(v, depth + 1)}`).join(',\n')}\n${pad}]`;
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    if (entries.every(([, v]) => isPrimitive(v))) {
      const inline = `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`;
      if (pad.length + inline.length <= LINE_WIDTH) return inline;
    }
    return `{\n${entries.map(([k, v]) => `${inner}${JSON.stringify(k)}: ${formatJson(v, depth + 1)}`).join(',\n')}\n${pad}}`;
  }

  return JSON.stringify(value);
}

export const formatFile = (value: unknown): string => `${formatJson(value)}\n`;
