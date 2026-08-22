import { describe, it, expect } from 'vitest';
import { getPlayerAriaLabel } from '../../components/PlayerMarker';
import { getClusterForFamily, TREE_CLUSTERS } from '../../components/PlayPicker';
import { ALL_SCHEME_FAMILIES } from '../../data/schemes/index';

describe('PlayerMarker aria-label and accessibility helper', () => {
  it('generates correct aria-label for QB with default passer role', () => {
    const label = getPlayerAriaLabel('offense', 'QB', 'QB', 'qb', undefined, false, true);
    expect(label).toBe('Offense QB - Primary Passer');
  });

  it('generates correct aria-label for key conflict defender', () => {
    const label = getPlayerAriaLabel('defense', 'WILL', 'WILL', 'lb', undefined, true, false);
    expect(label).toBe('Defense WILL - Read Key Conflict Defender');
  });

  it('generates correct aria-label when assignment is provided', () => {
    const label = getPlayerAriaLabel(
      'offense',
      'Z',
      'Z',
      'wr',
      'sell the seam, break flat',
      false,
      false
    );
    expect(label).toBe('Offense Z - sell the seam, break flat');
  });

  it('generates correct aria-label for key conflict defender with assignment', () => {
    const label = getPlayerAriaLabel(
      'defense',
      'MIKE',
      'MIKE',
      'lb',
      'flow hard to frontside B-gap',
      true,
      false
    );
    expect(label).toBe('Defense MIKE - flow hard to frontside B-gap (Read Key Conflict Defender)');
  });

  it('fallbacks to full role title when assignment is not provided', () => {
    const label = getPlayerAriaLabel('offense', 'LT', 'LT', 'ol', undefined, false, false);
    expect(label).toBe('Offense LT - Offensive Lineman');

    const dbLabel = getPlayerAriaLabel('defense', 'FS', 'FS', 'db', undefined, false, false);
    expect(dbLabel).toBe('Defense FS - Defensive Back');
  });
});

describe('PlayPicker coaching tree cluster classification', () => {
  it('defines all 6 coaching tree clusters with valid metadata and badges', () => {
    const clusterKeys = Object.keys(TREE_CLUSTERS);
    expect(clusterKeys).toContain('shanahan-kubiak');
    expect(clusterKeys).toContain('reid-west-coast');
    expect(clusterKeys).toContain('carroll-saleh-wide9');
    expect(clusterKeys).toContain('macdonald-pressure');
    expect(clusterKeys).toContain('fangio-two-high');
    expect(clusterKeys).toContain('belichick-flores');

    for (const key of clusterKeys) {
      const cluster = TREE_CLUSTERS[key];
      expect(cluster.id).toBe(key);
      expect(cluster.name).toBeTruthy();
      expect(cluster.badge).toBeTruthy();
      expect(cluster.badgeColor).toBeTruthy();
      expect(['offense', 'defense', 'hybrid']).toContain(cluster.category);
    }
  });

  it('maps all 25 scheme families into organized coaching tree clusters', () => {
    expect(ALL_SCHEME_FAMILIES.length).toBe(25);

    const clusterCountMap = new Map<string, number>();

    for (const family of ALL_SCHEME_FAMILIES) {
      const cluster = getClusterForFamily(family);
      expect(cluster).toBeDefined();
      expect(cluster.name).toBeTruthy();
      expect(cluster.badge).toBeTruthy();

      clusterCountMap.set(cluster.id, (clusterCountMap.get(cluster.id) || 0) + 1);
    }

    // Verify all major tree clusters have assigned schemes
    expect(clusterCountMap.get('shanahan-kubiak')).toBe(9); // Shanahan, Kubiak, McVay, McDaniel, Stefanski, LaFleur, Johnson, O'Connell, Coen
    expect(clusterCountMap.get('reid-west-coast')).toBe(6); // Reid, Steichen, Sirianni, Spagnuolo, Payton, Kelly
    expect(clusterCountMap.get('carroll-saleh-wide9')).toBe(3); // Saleh, Ryans, Quinn
    expect(clusterCountMap.get('macdonald-pressure')).toBe(2); // Macdonald, Minter
    expect(clusterCountMap.get('fangio-two-high')).toBe(2); // Fangio, Shula
    expect(clusterCountMap.get('belichick-flores')).toBe(2); // Flores, Bowles
    expect(clusterCountMap.get('power-gap-duo')).toBe(1); // Roman
  });
});
