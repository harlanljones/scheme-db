// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FilterGroups, activeLabels } from '../FilterGroups';

afterEach(cleanup);

const pills: Array<[string, string, number]> = [
  ['all', 'All', 10],
  ['offense', 'Offense', 6],
  ['defense', 'Defense', 4],
];

describe('activeLabels', () => {
  it('names only the filters that are not on "all", in order', () => {
    expect(activeLabels([['all', pills], ['all', pills]])).toEqual([]);
    expect(activeLabels([['offense', pills], ['defense', pills]])).toEqual(['Offense', 'Defense']);
  });

  it('skips a value that has no pill', () => {
    expect(activeLabels([['kicking', pills]])).toEqual([]);
  });
});

describe('FilterGroups', () => {
  it('keeps the chips in the page and opens and closes them from one button', () => {
    const { container } = render(
      <FilterGroups summary={['Offense']}>
        <button type="button">Offense</button>
      </FilterGroups>,
    );
    const toggle = container.querySelector<HTMLButtonElement>('.fgroups-toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent).toContain('Filters');
    expect(toggle.textContent).toContain('Offense');
    expect(container.querySelector(`#${CSS.escape(toggle.getAttribute('aria-controls')!)}`)!.textContent).toBe('Offense');
    act(() => toggle.click());
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('.fgroups')!.classList.contains('is-open')).toBe(true);
    act(() => toggle.click());
    expect(container.querySelector('.fgroups')!.classList.contains('is-open')).toBe(false);
  });
});
