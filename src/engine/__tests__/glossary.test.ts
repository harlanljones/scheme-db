import { describe, it, expect } from 'vitest';
import { FOOTBALL_GLOSSARY, findGlossaryTerm } from '../../data/glossary';

describe('Football Glossary Dictionary & Lookup', () => {
  it('contains comprehensive NFL tactical terms including all required concepts', () => {
    const requiredTerms = [
      'Wham',
      'Apex Defender',
      'Tite Front',
      'Mesh Point',
      'Simulated Pressure',
      'Cloud Coverage',
      'Two-High Shell',
      'Psycho Front',
      'Duo',
      'Zone Read',
      'Conflict Defender',
      'Underneath Dropper',
    ];

    requiredTerms.forEach((term) => {
      const found = findGlossaryTerm(term);
      expect(found).toBeDefined();
      expect(found?.shortDef.length).toBeGreaterThan(10);
      expect(found?.tacticalNote.length).toBeGreaterThan(10);
    });
  });

  it('correctly matches terms case-insensitively and by aliases', () => {
    expect(findGlossaryTerm('wham')?.id).toBe('wham');
    expect(findGlossaryTerm('Wham Block')?.id).toBe('wham');
    expect(findGlossaryTerm('apex')?.id).toBe('apex-defender');
    expect(findGlossaryTerm('2-high shell')?.id).toBe('two-high-shell');
    expect(findGlossaryTerm('sim pressure')?.id).toBe('simulated-pressure');
  });

  it('all glossary entries have valid categories and non-empty definitions', () => {
    const validCategories = [
      'Blocking Scheme',
      'Run Concept',
      'Pass Concept',
      'Defensive Front',
      'Coverage & Shell',
      'Read & Assignment',
      'Scheme & Concept',
    ];

    FOOTBALL_GLOSSARY.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.term).toBeTruthy();
      expect(validCategories).toContain(item.category);
      expect(item.shortDef.trim().length).toBeGreaterThan(15);
      expect(item.tacticalNote.trim().length).toBeGreaterThan(15);
    });
  });
});
