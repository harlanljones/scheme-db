import { describe, it, expect } from 'vitest';
import { ALL_COACHES, COACH_PROFILES, COACHING_TREES, getCoachById, getTreeByBranch } from '../../data/coaches/index';
import { ALL_SCHEME_FAMILIES } from '../../data/schemes/index';

describe('2026 coaching trees and profiles validation', () => {
  it('contains valid coach profiles with non-empty fields', () => {
    expect(ALL_COACHES.length).toBeGreaterThanOrEqual(15);

    for (const coach of ALL_COACHES) {
      expect(coach.id).toBeTruthy();
      expect(coach.name).toBeTruthy();
      expect(coach.role2026).toBeTruthy();
      expect(coach.team).toBeTruthy();
      expect(coach.treeBranch).toBeTruthy();
      expect(coach.philosophy.length).toBeGreaterThan(15);
      expect(coach.keyConcepts.length).toBeGreaterThanOrEqual(2);
      expect(['offense', 'defense']).toContain(coach.category);
    }
  });

  it('validates that all schemeFamilyIds in coach profiles exist in ALL_SCHEME_FAMILIES', () => {
    const validFamilyIds = new Set(ALL_SCHEME_FAMILIES.map((f) => f.id));

    for (const coach of ALL_COACHES) {
      for (const schemeId of coach.schemeFamilyIds) {
        expect(
          validFamilyIds.has(schemeId),
          `Coach "${coach.name}" references non-existent scheme family "${schemeId}"`
        ).toBe(true);
      }
    }
  });

  it('validates tree branch structures and root nodes', () => {
    expect(COACHING_TREES.length).toBeGreaterThanOrEqual(6);

    for (const tree of COACHING_TREES) {
      expect(tree.id).toBeTruthy();
      expect(tree.name).toBeTruthy();
      expect(tree.patriarch).toBeTruthy();
      expect(tree.description.length).toBeGreaterThan(20);
      expect(tree.rootNodes.length).toBeGreaterThan(0);

      for (const rootNode of tree.rootNodes) {
        expect(rootNode.coach).toBeDefined();
        expect(COACH_PROFILES[rootNode.coach.id]).toBeDefined();

        for (const child of rootNode.children) {
          expect(child.coach).toBeDefined();
          expect(COACH_PROFILES[child.coach.id]).toBeDefined();
        }
      }
    }
  });

  it('getCoachById and getTreeByBranch retrieve correct records', () => {
    const shanahan = getCoachById('kyle-shanahan');
    expect(shanahan).toBeDefined();
    expect(shanahan?.name).toBe('Kyle Shanahan');
    expect(shanahan?.isHeadCoach2026).toBe(true);

    const tree = getTreeByBranch('shanahan-kubiak');
    expect(tree).toBeDefined();
    expect(tree?.patriarch).toContain('Shanahan');
  });
});
