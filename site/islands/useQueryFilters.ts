import { useEffect, useState } from 'react';

/**
 * Filter state that lives in the address, so Back returns to the same list and a link can share it.
 * A value equal to its default is left out of the address. `valid` drops values a hand edited link made up.
 * Both arguments are read on the first render only.
 */
export function useQueryFilters<K extends string>(defaults: Record<K, string>, valid: (key: K, value: string) => boolean = () => true) {
  const [initial] = useState(defaults);
  const [check] = useState(() => valid);
  const [values, setValues] = useState<Record<K, string>>(initial);
  const [ready, setReady] = useState(false);

  // Read after hydration, so the server and the first client render match.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = { ...initial };
    for (const key of Object.keys(initial) as K[]) {
      const value = params.get(key);
      if (value !== null && check(key, value)) next[key] = value;
    }
    setValues(next);
    setReady(true);
  }, [initial, check]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    for (const key of Object.keys(initial) as K[]) {
      const value = values[key].trim();
      if (value && value !== initial[key]) params.set(key, value);
    }
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(null, '', next);
  }, [ready, values, initial]);

  const set = (key: K, value: string): void => setValues((current) => ({ ...current, [key]: value }));
  const reset = (): void => setValues(initial);
  return { values, set, reset };
}
