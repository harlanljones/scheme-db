import { describe, expect, it } from 'vitest';
import { MOTION_ENFORCED } from '../../engine/limits';
import { PRESNAP_MAX_SECONDS } from '../../engine/presnap';
import { loadDataset } from '../load';
import { Beat, PlayerTrack, Tracks } from '../schema';
import { validateDataset } from '../validate-dataset';

const { dataset, files } = loadDataset();

const player = (waypoints: { t: number; x: number; y: number }[]) => ({ id: 'Z', label: 'Z', side: 'offense', role: 'wr', trail: 'route', waypoints });
const ok = (waypoints: { t: number; x: number; y: number }[]) => PlayerTrack.safeParse(player(waypoints)).success;

describe('tracks with time before the snap', () => {
  it('accepts a waypoint down to six seconds before the snap and rejects anything earlier', () => {
    expect(ok([{ t: -PRESNAP_MAX_SECONDS, x: 40, y: -1 }, { t: 0, x: 30, y: -1 }])).toBe(true);
    expect(ok([{ t: -6.5, x: 40, y: -1 }, { t: 0, x: 30, y: -1 }])).toBe(false);
  });

  it('still accepts a track that starts at the snap', () => {
    expect(ok([{ t: 0, x: 40, y: -1 }, { t: 1, x: 30, y: -1 }])).toBe(true);
  });

  it('requires a waypoint at exactly the snap', () => {
    expect(ok([{ t: -1, x: 40, y: -1 }, { t: 1, x: 30, y: -1 }])).toBe(false);
    expect(ok([{ t: 0.5, x: 40, y: -1 }, { t: 1, x: 30, y: -1 }])).toBe(false);
    const result = PlayerTrack.safeParse(player([{ t: -1, x: 40, y: -1 }, { t: 1, x: 30, y: -1 }]));
    expect(result.success ? '' : result.error.issues[0].message).toContain('waypoint at the snap');
  });

  it('requires strictly ascending times, before the snap as after', () => {
    expect(ok([{ t: -1, x: 40, y: -1 }, { t: -1.5, x: 38, y: -1 }, { t: 0, x: 30, y: -1 }])).toBe(false);
    expect(ok([{ t: -1, x: 40, y: -1 }, { t: -1, x: 38, y: -1 }, { t: 0, x: 30, y: -1 }])).toBe(false);
    expect(ok([{ t: 0, x: 40, y: -1 }, { t: 1, x: 38, y: -1 }, { t: 0.5, x: 30, y: -1 }])).toBe(false);
  });

  it('keeps beats at or after the snap: they describe the play, not the shift', () => {
    const beat = { title: 'The Mike commits', text: 'He steps up.' };
    expect(Beat.safeParse({ ...beat, t: 0 }).success).toBe(true);
    expect(Beat.safeParse({ ...beat, t: -0.5 }).success).toBe(false);
  });

  it('is a whole Tracks record with a lead in that parses', () => {
    const base = structuredClone(dataset.tracks[0]);
    base.offense[0].waypoints = [{ t: -1.2, x: base.offense[0].waypoints[0].x + 4, y: -1 }, ...base.offense[0].waypoints];
    expect(Tracks.safeParse(base).success).toBe(true);
  });
});

describe('movement findings in the dataset report', () => {
  const report = validateDataset(dataset, files);

  it('fails validation on a finding at the error line, and the library has none', () => {
    expect(MOTION_ENFORCED).toBe(true);
    expect(report.errors).toEqual([]);
    // The gate: nobody in data/ runs, speeds up or stops faster than a person can, or is in motion toward the line.
    expect(report.movement.filter((finding) => finding.level === 'error')).toEqual([]);
  });

  it('keeps findings at the warn line out of the errors', () => {
    expect(report.warnings.some((warning) => warning.includes('yd/s'))).toBe(false);
    expect(Array.isArray(report.movement)).toBe(true);
  });

  it('names the concept and the player for each finding', () => {
    for (const finding of report.movement) {
      expect(dataset.concepts.some((concept) => concept.id === finding.conceptId)).toBe(true);
      expect(finding.playerId.length).toBeGreaterThan(0);
      expect(['warn', 'error']).toContain(finding.level);
    }
  });

  it('reports a track that jumps across the field as an error-level speed finding', () => {
    const ds = structuredClone(dataset);
    ds.tracks[0].offense[0].waypoints = [{ t: 0, x: 40, y: -1 }, { t: 0.5, x: 10, y: -1 }, { t: 1, x: 10, y: -1 }];
    const found = validateDataset(ds).movement.filter((finding) => finding.conceptId === ds.tracks[0].conceptId && finding.playerId === ds.tracks[0].offense[0].id && finding.check === 'speed');
    expect(found.map((finding) => finding.level)).toEqual(['error']);
    expect(validateDataset(ds).errors.some((error) => error.includes(`Concept "${ds.tracks[0].conceptId}"`) && error.includes('yd/s'))).toBe(true);
  });
});
