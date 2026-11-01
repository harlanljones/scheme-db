import { describe, expect, it } from 'vitest';
import type { Coach, Lineage } from '../../../src/schema/schema';
import { library } from '../data';
import { buildNetwork, describeNetwork, egoNetwork, layoutNetwork, network } from '../network';
import { nameFromId } from '../format';

const coach = (id: string, extra: Partial<Coach> = {}): Coach =>
  ({ id, name: nameFromId(id), role2026: '', team: '', lineage: 'x', side: 'offense', philosophy: '', keyConcepts: [], schemeIds: [], isHeadCoach2026: false, notableAchievements: [], ...extra }) as unknown as Coach;
const lineage = (rootNodes: Lineage['rootNodes']): Lineage =>
  ({ id: 'l', name: 'L', patriarch: 'A', side: 'offense', description: '', rootNodes }) as unknown as Lineage;

describe('building the network', () => {
  const coaches = [coach('a', { disciples: ['b'] }), coach('b'), coach('c', { mentorId: 'z' }), coach('lonely')];

  it('draws a solid line from a mentor or a disciple list, once', () => {
    const net = buildNetwork([...coaches, coach('d', { mentorId: 'a', disciples: [] })], []);
    expect(net.edges).toEqual(expect.arrayContaining([
      { from: 'a', to: 'b', kind: 'worked' },
      { from: 'z', to: 'c', kind: 'worked' },
      { from: 'a', to: 'd', kind: 'worked' },
    ]));
    expect(net.edges).toHaveLength(3);
    // Stating the same link from both ends does not draw it twice.
    const both = buildNetwork([coach('a', { disciples: ['b'] }), coach('b', { mentorId: 'a' })], []);
    expect(both.edges).toEqual([{ from: 'a', to: 'b', kind: 'worked' }]);
  });

  it('draws a dashed line for a lineage step only when the two did not work together', () => {
    const tree = lineage([{ coachId: 'a', children: [{ coachId: 'b', children: [] }, { coachId: 'c', children: [] }] }]);
    const net = buildNetwork(coaches, [tree]);
    expect(net.edges.find((e) => e.from === 'a' && e.to === 'b')!.kind).toBe('worked');
    expect(net.edges.find((e) => e.from === 'a' && e.to === 'c')!.kind).toBe('influence');
  });

  it('leaves out people with no line and names people who have no record', () => {
    const net = buildNetwork(coaches, []);
    expect(net.nodes.map((n) => n.id)).toEqual(['a', 'b', 'c', 'z']);
    expect(net.nodes.find((n) => n.id === 'z')).toEqual({ id: 'z', name: 'Z', known: false });
    expect(net.nodes.find((n) => n.id === 'a')!.known).toBe(true);
  });

  it('names an ego network after the coach, their ancestors and one step down', () => {
    const chain = [coach('a', { disciples: ['b'] }), coach('b', { disciples: ['c', 'x'] }), coach('c', { disciples: ['d'] }), coach('d'), coach('x'), coach('y', { disciples: ['b'] })];
    const net = buildNetwork(chain, []);
    const ego = egoNetwork(net, 'c')!;
    expect(ego.nodes.map((n) => n.id).sort()).toEqual(['a', 'b', 'c', 'd', 'y']);
    expect(ego.edges.some((e) => e.to === 'x')).toBe(false);
    expect(egoNetwork(net, 'nobody')).toBeUndefined();
  });

  it('says every line in words', () => {
    const net = buildNetwork([coach('a', { disciples: ['b'] }), coach('b')], [lineage([{ coachId: 'b', children: [{ coachId: 'a', children: [] }] }])]);
    expect(describeNetwork(net, 'a')).toMatch(/^Coaching network around A\. B worked directly under A\./);
  });
});

describe('laying out the network', () => {
  const net = network();
  const layout = layoutNetwork(net);
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));

  it('places every person once, inside the drawing', () => {
    expect(layout.nodes).toHaveLength(net.nodes.length);
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThan(0);
      expect(n.x + n.w).toBeLessThanOrEqual(layout.width);
      expect(n.y).toBeLessThan(layout.height);
    }
  });

  it('puts the earlier person of every line to the left of the later one', () => {
    for (const e of layout.edges) expect(byId.get(e.from)!.x, `${e.from} to ${e.to}`).toBeLessThan(byId.get(e.to)!.x);
  });

  it('never stacks two names closer than a row', () => {
    for (const a of layout.nodes) {
      for (const b of layout.nodes) {
        if (a.id >= b.id || Math.abs(a.x - b.x) > 1) continue;
        expect(Math.abs(a.y - b.y), `${a.id} and ${b.id}`).toBeGreaterThanOrEqual(29);
      }
    }
  });

  it('draws one path per line and one marker per kind of person', () => {
    expect(layout.edges).toHaveLength(net.edges.length);
    for (const e of layout.edges) expect(e.d).toMatch(/^M[\d. -]+/);
  });

  it('keeps all worked lines from the coach records', () => {
    const lib = library();
    const pairs = new Set<string>();
    for (const c of lib.dataset.coaches) {
      if (c.mentorId) pairs.add(`${c.mentorId}>${c.id}`);
      for (const d of c.disciples ?? []) pairs.add(`${c.id}>${d}`);
    }
    const worked = net.edges.filter((e) => e.kind === 'worked').map((e) => `${e.from}>${e.to}`);
    expect(new Set(worked)).toEqual(pairs);
  });

  it('has a page for every known coach who has a scheme', () => {
    const lib = library();
    for (const n of net.nodes) {
      if (!n.known) continue;
      const hasScheme = lib.coachById.get(n.id)!.schemeIds.some((id) => lib.schemeById.has(id));
      expect(Boolean(n.href), n.id).toBe(hasScheme);
    }
  });

  it('builds an ego network for a coach in the middle of the tree', () => {
    const ego = egoNetwork(net, 'kyle-shanahan')!;
    const ids = ego.nodes.map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining(['mike-shanahan', 'george-seifert', 'bill-walsh', 'paul-brown', 'mike-mcdaniel']));
    expect(ids).not.toContain('andy-reid');
    expect(layoutNetwork(ego).nodes).toHaveLength(ids.length);
  });
});
