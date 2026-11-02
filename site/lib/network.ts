/**
 * The coaching network: who worked directly under whom, and whose ideas passed on through a lineage tree.
 *
 * Two kinds of line, kept apart on purpose:
 *   worked     a coach's `mentorId` and `disciples`. It means worked directly under, in any role.
 *   influence  a parent and child in a `data/lineages/` tree, when the two did not also work together.
 *              It means the scheme passed on, with no claim about who worked for whom.
 *
 * `layoutNetwork` draws the graph as columns, earliest in a chain at the left. Everything here is pure, so the
 * same code builds the chart on the lineages page and the smaller chart on a scheme page.
 */
import type { Coach, Lineage, LineageNode } from '../../src/schema/schema';
import { coachHref, library } from './data';
import { nameFromId } from './format';

export type EdgeKind = 'worked' | 'influence';

export interface NetNode {
  id: string;
  name: string;
  /** False for a person that coach records name as a mentor or disciple but that has no record of their own. */
  known: boolean;
  side?: 'offense' | 'defense';
  /** The page of the coach's first scheme, when there is one. */
  href?: string;
}

export interface NetEdge {
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface Network {
  nodes: NetNode[];
  edges: NetEdge[];
}

function walk(node: LineageNode, parent: string | undefined, out: Array<[string, string]>): void {
  if (parent) out.push([parent, node.coachId]);
  for (const child of node.children) walk(child, node.coachId, out);
}

/** Builds the network from coach and lineage records. Only people with at least one line are included. */
export function buildNetwork(coaches: Coach[], lineages: Lineage[], hrefOf: (coach: Coach) => string | undefined = () => undefined): Network {
  const byId = new Map(coaches.map((coach) => [coach.id, coach]));
  const edges = new Map<string, NetEdge>();
  const add = (from: string, to: string, kind: EdgeKind): void => {
    if (from === to) return;
    // A pair already joined by a worked line, in either direction, needs no second line.
    if (edges.has(`${from}>${to}`) || edges.has(`${to}>${from}`)) return;
    edges.set(`${from}>${to}`, { from, to, kind });
  };
  for (const coach of coaches) {
    if (coach.mentorId) add(coach.mentorId, coach.id, 'worked');
    for (const disciple of coach.disciples ?? []) add(coach.id, disciple, 'worked');
  }
  for (const lineage of lineages) {
    const pairs: Array<[string, string]> = [];
    for (const root of lineage.rootNodes) walk(root, undefined, pairs);
    for (const [from, to] of pairs) add(from, to, 'influence');
  }
  const used = new Set<string>();
  for (const edge of edges.values()) {
    used.add(edge.from);
    used.add(edge.to);
  }
  const nodes: NetNode[] = [...used]
    .sort()
    .map((id) => {
      const coach = byId.get(id);
      return coach
        ? { id, name: coach.name, known: true, side: coach.side, href: hrefOf(coach) }
        : { id, name: nameFromId(id), known: false };
    });
  return { nodes, edges: [...edges.values()] };
}

/** The whole network of the loaded dataset. */
let cachedNetwork: Network | undefined;
export function network(): Network {
  if (cachedNetwork) return cachedNetwork;
  const lib = library();
  cachedNetwork = buildNetwork(lib.dataset.coaches, lib.dataset.lineages, coachHref);
  return cachedNetwork;
}

/** A coach, everyone above them in either kind of line, and everyone one step below. Undefined when they have no lines. */
export function egoNetwork(net: Network, id: string): Network | undefined {
  if (!net.nodes.some((node) => node.id === id)) return undefined;
  const keep = new Set<string>([id]);
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of net.edges) {
      if (edge.to === current && !keep.has(edge.from)) {
        keep.add(edge.from);
        queue.push(edge.from);
      }
    }
  }
  for (const edge of net.edges) if (edge.from === id) keep.add(edge.to);
  return {
    nodes: net.nodes.filter((node) => keep.has(node.id)),
    edges: net.edges.filter((edge) => keep.has(edge.from) && keep.has(edge.to)),
  };
}

/** The text alternative of a chart: every line, in words. */
export function describeNetwork(net: Network, focusId?: string): string {
  const name = new Map(net.nodes.map((node) => [node.id, node.name]));
  const lines: string[] = [];
  const kinds: Array<[EdgeKind, string]> = [
    ['worked', 'worked directly under'],
    ['influence', 'passed on to'],
  ];
  for (const [kind, phrase] of kinds) {
    const groups = new Map<string, string[]>();
    for (const edge of net.edges) {
      if (edge.kind !== kind) continue;
      groups.set(edge.from, [...(groups.get(edge.from) ?? []), name.get(edge.to)!]);
    }
    for (const [from, targets] of groups) {
      lines.push(kind === 'worked' ? `${targets.join(', ')} worked directly under ${name.get(from)}` : `${name.get(from)}'s scheme ${phrase} ${targets.join(', ')}, with no job link recorded`);
    }
  }
  const lead = focusId && name.has(focusId) ? `Coaching network around ${name.get(focusId)}. ` : 'Coaching network. ';
  return `${lead}${lines.join('. ')}.`;
}

// ---------------------------------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------------------------------

export interface LayoutOptions {
  /** Width of one column of names, in drawing units. */
  colW: number;
  /** Space between columns, where the lines run. */
  gap: number;
  /** Height of one name. */
  rowH: number;
  pad: number;
  /** The widest a drawing may grow before small groups start a new row. */
  maxWidth: number;
}

export const DEFAULT_LAYOUT: LayoutOptions = { colW: 128, gap: 40, rowH: 30, pad: 12, maxWidth: 1150 };

export interface PlacedNode extends NetNode {
  x: number;
  y: number;
  /** Estimated width of the name and marker, used for the hit area and to start lines after the text. */
  w: number;
  layer: number;
}

export interface PlacedEdge extends NetEdge {
  d: string;
}

export interface Layout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
}

/** Marker radius and the room the marker and its gap take before the name starts. */
export const MARK_R = 5;
export const LABEL_X = 18;
const CHAR_W = 7;
const DUMMY_SEP = 0.4;

export const labelWidth = (name: string): number => LABEL_X + Math.ceil(name.length * CHAR_W) + 10;

interface Item {
  key: string;
  layer: number;
  /** A stand in for a long line, so it keeps clear of the names in the columns it crosses. */
  dummy: boolean;
  y: number;
  order: number;
}

function components(net: Network): Network[] {
  const adj = new Map<string, string[]>(net.nodes.map((node) => [node.id, []]));
  for (const edge of net.edges) {
    adj.get(edge.from)!.push(edge.to);
    adj.get(edge.to)!.push(edge.from);
  }
  const seen = new Set<string>();
  const out: Network[] = [];
  for (const node of net.nodes) {
    if (seen.has(node.id)) continue;
    const group = new Set<string>();
    const stack = [node.id];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (group.has(id)) continue;
      group.add(id);
      stack.push(...adj.get(id)!);
    }
    for (const id of group) seen.add(id);
    out.push({
      nodes: net.nodes.filter((n) => group.has(n.id)),
      edges: net.edges.filter((e) => group.has(e.from)),
    });
  }
  return out.sort((a, b) => b.nodes.length - a.nodes.length || a.nodes[0]!.name.localeCompare(b.nodes[0]!.name));
}

/** Places `targets` as close as possible to the wanted positions while keeping `sep` between neighbours. */
function separate(targets: number[], seps: number[]): number[] {
  const offsets: number[] = [0];
  for (let i = 1; i < targets.length; i++) offsets.push(offsets[i - 1]! + seps[i - 1]!);
  // Pool adjacent violators on the targets with the offsets taken out.
  const blocks: Array<{ sum: number; n: number }> = [];
  targets.forEach((t, i) => {
    blocks.push({ sum: t - offsets[i]!, n: 1 });
    while (blocks.length > 1 && blocks[blocks.length - 2]!.sum / blocks[blocks.length - 2]!.n > blocks[blocks.length - 1]!.sum / blocks[blocks.length - 1]!.n) {
      const last = blocks.pop()!;
      const prev = blocks[blocks.length - 1]!;
      prev.sum += last.sum;
      prev.n += last.n;
    }
  });
  const out: number[] = [];
  let i = 0;
  for (const block of blocks) for (let k = 0; k < block.n; k++, i++) out.push(block.sum / block.n + offsets[i]!);
  return out;
}

function layoutComponent(net: Network, o: LayoutOptions): Layout {
  const ids = net.nodes.map((n) => n.id);
  const nodeById = new Map(net.nodes.map((n) => [n.id, n]));
  const out = new Map<string, string[]>(ids.map((id) => [id, []]));
  const inn = new Map<string, string[]>(ids.map((id) => [id, []]));

  // Drop the lines that would close a loop, so the rest can be put in columns. They are drawn straight at the end.
  const state = new Map<string, 0 | 1 | 2>();
  const back = new Set<string>();
  const post: string[] = [];
  const succAll = new Map<string, string[]>(ids.map((id) => [id, net.edges.filter((e) => e.from === id).map((e) => e.to).sort((a, b) => nodeById.get(a)!.name.localeCompare(nodeById.get(b)!.name))]));
  const visit = (id: string): void => {
    state.set(id, 1);
    for (const to of succAll.get(id)!) {
      if (state.get(to) === 1) back.add(`${id}>${to}`);
      else if (!state.get(to)) visit(to);
    }
    state.set(id, 2);
    post.push(id);
  };
  for (const id of [...ids].sort()) if (!state.get(id)) visit(id);
  const dag = net.edges.filter((e) => !back.has(`${e.from}>${e.to}`));
  for (const e of dag) {
    out.get(e.from)!.push(e.to);
    inn.get(e.to)!.push(e.from);
  }

  // Columns: the longest chain of lines that ends at each name.
  const layer = new Map<string, number>();
  for (const id of [...post].reverse()) {
    layer.set(id, Math.max(0, ...inn.get(id)!.map((p) => layer.get(p)! + 1)));
  }
  // A name with nothing above it sits just before its first line, not at the far left.
  for (const id of ids) {
    if (inn.get(id)!.length === 0 && out.get(id)!.length > 0) layer.set(id, Math.min(...out.get(id)!.map((c) => layer.get(c)!)) - 1);
  }
  const minLayer = Math.min(...layer.values());
  for (const id of ids) layer.set(id, layer.get(id)! - minLayer);

  // Long lines get a stand in for every column they cross.
  const items = new Map<string, Item>();
  for (const id of ids) items.set(id, { key: id, layer: layer.get(id)!, dummy: false, y: 0, order: 0 });
  const chains = new Map<string, string[]>();
  const links: Array<[string, string]> = [];
  for (const e of dag) {
    const a = layer.get(e.from)!;
    const b = layer.get(e.to)!;
    const chain = [e.from];
    for (let l = a + 1; l < b; l++) {
      const key = `~${e.from}>${e.to}~${l}`;
      items.set(key, { key, layer: l, dummy: true, y: 0, order: 0 });
      chain.push(key);
    }
    chain.push(e.to);
    chains.set(`${e.from}>${e.to}`, chain);
    for (let i = 0; i + 1 < chain.length; i++) links.push([chain[i]!, chain[i + 1]!]);
  }
  const succ = new Map<string, string[]>();
  const pred = new Map<string, string[]>();
  for (const key of items.keys()) {
    succ.set(key, []);
    pred.set(key, []);
  }
  for (const [a, b] of links) {
    succ.get(a)!.push(b);
    pred.get(b)!.push(a);
  }

  const maxLayer = Math.max(...[...items.values()].map((i) => i.layer));
  const columns: Item[][] = Array.from({ length: maxLayer + 1 }, () => []);
  // First order: depth first from the earliest names, so a family sits together.
  let counter = 0;
  const placed = new Set<string>();
  const place = (key: string): void => {
    if (placed.has(key)) return;
    placed.add(key);
    items.get(key)!.order = counter++;
    const next = [...succ.get(key)!].sort((a, b) => {
      const na = nodeById.get(a)?.name ?? a;
      const nb = nodeById.get(b)?.name ?? b;
      return na.localeCompare(nb);
    });
    for (const n of next) place(n);
  };
  const roots = [...items.keys()].filter((k) => pred.get(k)!.length === 0).sort((a, b) => (nodeById.get(a)?.name ?? a).localeCompare(nodeById.get(b)?.name ?? b));
  for (const r of roots) place(r);
  for (const key of items.keys()) place(key);
  for (const item of items.values()) columns[item.layer]!.push(item);
  for (const column of columns) column.sort((a, b) => a.order - b.order);

  // Fewer crossings: move each name toward the average place of its neighbours, column by column, a few times.
  const rank = (column: Item[]): void => column.forEach((item, i) => (item.order = i));
  columns.forEach(rank);
  const average = (neighbours: string[]): number | undefined =>
    neighbours.length === 0 ? undefined : neighbours.reduce((sum, k) => sum + items.get(k)!.order, 0) / neighbours.length;
  for (let pass = 0; pass < 6; pass++) {
    const down = pass % 2 === 0;
    const range = down ? columns.slice(1) : columns.slice(0, -1).reverse();
    for (const column of range) {
      const keyed = column.map((item, i) => ({ item, i, b: average(down ? pred.get(item.key)! : succ.get(item.key)!) ?? item.order }));
      keyed.sort((a, b) => a.b - b.b || a.i - b.i);
      column.splice(0, column.length, ...keyed.map((k) => k.item));
      rank(column);
    }
  }

  // Heights: start evenly spaced, then pull each name toward the middle of its lines, keeping the spacing.
  const sepOf = (a: Item, b: Item): number => o.rowH * ((a.dummy ? DUMMY_SEP : 1) + (b.dummy ? DUMMY_SEP : 1)) / 2;
  for (const column of columns) column.forEach((item, i) => (item.y = i * o.rowH));
  const settle = (column: Item[], neighbours: (k: string) => string[]): void => {
    const want = column.map((item) => {
      const n = neighbours(item.key);
      return n.length === 0 ? item.y : n.reduce((sum, k) => sum + items.get(k)!.y, 0) / n.length;
    });
    const seps = column.slice(1).map((item, i) => sepOf(column[i]!, item));
    const ys = separate(want, seps);
    column.forEach((item, i) => (item.y = ys[i]!));
  };
  for (let pass = 0; pass < 8; pass++) {
    for (const column of columns.slice(1)) settle(column, (k) => pred.get(k)!);
    for (const column of columns.slice(0, -1).reverse()) settle(column, (k) => succ.get(k)!);
  }
  const top = Math.min(...[...items.values()].map((i) => i.y));
  const bottom = Math.max(...[...items.values()].filter((i) => !i.dummy).map((i) => i.y));
  const shift = o.pad + o.rowH / 2 - top;
  for (const item of items.values()) item.y += shift;

  const colX = (l: number): number => o.pad + l * (o.colW + o.gap);
  const nodes: PlacedNode[] = net.nodes.map((n) => {
    const item = items.get(n.id)!;
    return { ...n, x: colX(item.layer), y: item.y, w: Math.min(o.colW, labelWidth(n.name)), layer: item.layer };
  });
  const placedById = new Map(nodes.map((n) => [n.id, n]));

  const curve = (x1: number, y1: number, x2: number, y2: number): string => {
    if (Math.abs(y1 - y2) < 0.5) return ` L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    const mx = (x1 + x2) / 2;
    return ` C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const edges: PlacedEdge[] = net.edges.map((e) => {
    const from = placedById.get(e.from)!;
    const to = placedById.get(e.to)!;
    const chain = chains.get(`${e.from}>${e.to}`);
    let x = from.x + from.w;
    let y = from.y;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    if (!chain) {
      // A loop breaking line: drawn straight, since it cannot go left to right.
      d += ` L${(to.x - 2).toFixed(1)} ${to.y.toFixed(1)}`;
    } else {
      for (const key of chain.slice(1, -1)) {
        const item = items.get(key)!;
        const enter = colX(item.layer);
        d += curve(x, y, enter, item.y);
        x = enter + o.colW;
        y = item.y;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      d += curve(x, y, to.x - 2, to.y);
    }
    return { ...e, d };
  });

  const width = colX(maxLayer) + o.colW + o.pad;
  const height = bottom + shift + o.rowH / 2 + o.pad;
  return { width, height, nodes, edges };
}

/** Lays out a network in columns. Groups with no line between them are packed side by side, largest first. */
export function layoutNetwork(net: Network, options: Partial<LayoutOptions> = {}): Layout {
  const o = { ...DEFAULT_LAYOUT, ...options };
  if (net.nodes.length === 0) return { width: 0, height: 0, nodes: [], edges: [] };
  const parts = components(net).map((part) => layoutComponent(part, o));
  const out: Layout = { width: 0, height: 0, nodes: [], edges: [] };
  const space = 28;
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const part of parts) {
    if (x > 0 && x + part.width > o.maxWidth) {
      y += rowH + space;
      x = 0;
      rowH = 0;
    }
    for (const n of part.nodes) out.nodes.push({ ...n, x: n.x + x, y: n.y + y });
    for (const e of part.edges) out.edges.push({ ...e, d: translatePath(e.d, x, y) });
    x += part.width + space;
    rowH = Math.max(rowH, part.height);
    out.width = Math.max(out.width, x - space);
    out.height = y + rowH;
  }
  return out;
}

/** Moves every point of a path made of M, L and C commands. */
function translatePath(d: string, dx: number, dy: number): string {
  if (dx === 0 && dy === 0) return d;
  return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, px: string, py: string) => `${(parseFloat(px) + dx).toFixed(1)} ${(parseFloat(py) + dy).toFixed(1)}`);
}
