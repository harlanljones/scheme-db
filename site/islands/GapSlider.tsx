import { useState } from 'react';
import { DISGUISE_HOLD_PERCENT, NO_RESEMBLANCE_YARDS } from '../../src/engine/disguise';

/** The similarity rule on its own: the score falls in a straight line from 100 at 0 yards to 0 at 6 yards. */
export default function GapSlider() {
  const [tenths, setTenths] = useState(20);
  const gap = tenths / 10;
  const score = Math.round(100 * (1 - Math.min(gap, NO_RESEMBLANCE_YARDS) / NO_RESEMBLANCE_YARDS));
  return (
    <>
      <label htmlFor="gap" className="small" style={{ fontSize: 14, lineHeight: '20px' }}>
        Mean gap between the two plays, in yards: <span className="type" style={{ fontWeight: 700, color: 'var(--fg)' }}>{gap.toFixed(1)} yd</span>
      </label>
      <input id="gap" type="range" min={0} max={60} value={tenths} onChange={(e) => setTenths(Number(e.target.value))} />
      <output htmlFor="gap" aria-live="polite" className="type" style={{ fontSize: 15, lineHeight: '22px', color: 'var(--fg)' }}>
        A mean gap of {gap.toFixed(1)} yards scores {score}
        {score >= DISGUISE_HOLD_PERCENT ? ', above the 80% line.' : ', below the 80% line.'}
      </output>
    </>
  );
}
