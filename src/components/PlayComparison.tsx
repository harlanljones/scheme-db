import React, { useMemo, useState, useCallback } from 'react';
import type { Play, SchemeFamily } from '../engine/types';
import { usePlayback, formatTimecode } from '../engine/playback';
import { mergeComparisonBeats } from '../engine/beats';
import { PlayCanvas } from './PlayCanvas';
import { Timeline } from './Timeline';

export interface PlayComparisonProps {
  initialPlayA: Play;
  initialPlayB: Play;
  allFamilies: SchemeFamily[];
}

interface SideSelector {
  familyId: string;
  playId: string;
}

/**
 * Dual-play comparison scrubber: renders two plays side by side on a single synchronized
 * timeline. Both canvases share one `t`, so routing the scrub cursor across the disguise
 * window (0.0s–1.2s) makes complementary concepts visibly mirror each other.
 */
export const PlayComparison: React.FC<PlayComparisonProps> = ({
  initialPlayA,
  initialPlayB,
  allFamilies,
}) => {
  const allPlays = useMemo(
    () => allFamilies.flatMap((f) => f.plays),
    [allFamilies]
  );

  const initialA = useMemo(
    () => ({
      familyId: familyOf(initialPlayA.id, allFamilies),
      playId: initialPlayA.id,
    }),
    [initialPlayA.id, allFamilies]
  );
  const initialB = useMemo(
    () => ({
      familyId: familyOf(initialPlayB.id, allFamilies),
      playId: initialPlayB.id,
    }),
    [initialPlayB.id, allFamilies]
  );

  const [selA, setSelA] = useState<SideSelector>(initialA);
  const [selB, setSelB] = useState<SideSelector>(initialB);
  const [showGhost, setShowGhost] = useState<boolean>(true);

  const playA = useMemo(
    () => allPlays.find((p) => p.id === selA.playId) ?? allPlays[0],
    [allPlays, selA.playId]
  );
  const playB = useMemo(
    () => allPlays.find((p) => p.id === selB.playId) ?? allPlays[1] ?? allPlays[0],
    [allPlays, selB.playId]
  );

  const masterDuration = Math.max(playA.duration, playB.duration);
  const playback = usePlayback(masterDuration);

  const familyPlayOptions = useCallback(
    (familyId: string) => allFamilies.find((f) => f.id === familyId)?.plays ?? [],
    [allFamilies]
  );

  const setSide = useCallback(
    (side: 'A' | 'B', patch: Partial<SideSelector>) => {
      const setter = side === 'A' ? setSelA : setSelB;
      setter((prev) => {
        const next = { ...prev, ...patch };
        // Avoid comparing a play against itself.
        if (side === 'A' && next.playId === selB.playId) {
          const options = familyPlayOptions(next.familyId);
          const different = options.find((p) => p.id !== selB.playId);
          next.playId = different?.id ?? next.playId;
        }
        if (side === 'B' && next.playId === selA.playId) {
          const options = familyPlayOptions(next.familyId);
          const different = options.find((p) => p.id !== selA.playId);
          next.playId = different?.id ?? next.playId;
        }
        playback.reset();
        return next;
      });
    },
    [selA.playId, selB.playId, playback, familyPlayOptions]
  );

  const swap = useCallback(() => {
    setSelA(() => selB);
    setSelB(() => selA);
    playback.reset();
  }, [selA, selB, playback]);

  const mergedBeats = useMemo(
    () => mergeComparisonBeats(playA, playB),
    [playA, playB]
  );

  const sidePanel = (label: string, play: Play, accent: string, ghost: Play) => (
    <section className="compare-panel" aria-label={`Play ${label}: ${play.name}`}>
      <div className="compare-panel-head" style={{ ['--side-accent' as string]: accent }}>
        <span className="compare-panel-tag">{label}</span>
        <div className="compare-panel-title-wrap">
          <h3 className="compare-panel-title">{play.name}</h3>
          <span className="compare-panel-meta">
            {play.coach.toUpperCase()} · {play.coverage} · {play.duration.toFixed(1)}s
          </span>
        </div>
        {showGhost && (
          <span className="compare-ghost-note" title={`Ghost overlay: ${ghost.name}`}>
            ⟳ ghost: {ghost.name}
          </span>
        )}
      </div>
      <div className="compare-panel-canvas">
        <PlayCanvas play={play} t={playback.t} ghostPlay={showGhost ? ghost : undefined} />
      </div>
    </section>
  );

  return (
    <div className="compare-view custom-scrollbar" role="region" aria-label="Dual-play comparison scrubber">
      {/* Play selection command bar */}
      <div className="compare-picker-bar" role="toolbar" aria-label="Comparison play selectors">
        {(['A', 'B'] as const).map((side) => {
          const sel = side === 'A' ? selA : selB;
          const setSel = side === 'A' ? setSelA : setSelB;
          const family = allFamilies.find((f) => f.id === sel.familyId);
          return (
            <div className="compare-pick" key={side}>
              <span className={`compare-pick-tag ${side === 'A' ? 'a' : 'b'}`}>Play {side}</span>
              <label className="compare-select-group">
                <span className="select-label">Scheme</span>
                <select
                  className="native-select"
                  value={sel.familyId}
                  aria-label={`Play ${side} scheme system`}
                  onChange={(e) => {
                    const famId = e.target.value;
                    const fam = allFamilies.find((f) => f.id === famId)!;
                    setSel({ familyId: famId, playId: fam.plays[0].id });
                    playback.reset();
                  }}
                >
                  {allFamilies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.coach} — {f.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="compare-select-group">
                <span className="select-label">Concept</span>
                <select
                  className="native-select"
                  value={sel.playId}
                  aria-label={`Play ${side} concept`}
                  onChange={(e) => setSide(side, { playId: e.target.value })}
                >
                  {family?.plays.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}

        <button
          type="button"
          className="compare-swap-btn"
          onClick={swap}
          aria-label="Swap Play A and Play B"
          title="Swap the two plays"
        >
          ⇄ Swap
        </button>
      </div>

      {/* Synchronized side-by-side canvases */}
      <div className="compare-grid">
        {sidePanel('A', playA, 'var(--accent-offense)', playB)}
        {sidePanel('B', playB, 'var(--accent-defense)', playA)}
      </div>

      {/* Shared synchronized timeline + scrub cursor */}
      <div className="compare-timeline-wrap">
        <div className="compare-timeline-meta">
          <span className="compare-sync-badge">
            <span className="sync-dot" aria-hidden="true" />
            SYNCED TIMELINE
          </span>
          <span className="compare-timeline-readout">
            t = <strong>{formatTimecode(playback.t)}</strong> · A {playA.duration.toFixed(1)}s / B {playB.duration.toFixed(1)}s
          </span>
          <button
            type="button"
            className={`compare-ghost-toggle ${showGhost ? 'active' : ''}`}
            onClick={() => setShowGhost((prev) => !prev)}
            aria-pressed={showGhost}
            aria-label="Toggle the other play's ghost overlay on both fields"
            title="Overlay the other play as a translucent ghost"
          >
            <span className="ghost-toggle-swatch" aria-hidden="true" />
            Ghost Overlay
          </button>
          <span className="compare-timeline-hint">Both field renders lock to one scrub cursor</span>
        </div>
        <Timeline
          t={playback.t}
          duration={masterDuration}
          playing={playback.playing}
          speed={playback.speed}
          beats={mergedBeats}
          loop={playback.loop}
          onToggle={playback.toggle}
          onSeek={playback.seek}
          onSetSpeed={playback.setSpeed}
          onReset={playback.reset}
          onToggleLoop={playback.toggleLoop}
        />
      </div>
    </div>
  );
};

function familyOf(playId: string, families: SchemeFamily[]): string {
  const found = families.find((f) => f.plays.some((p) => p.id === playId));
  return found?.id ?? families[0]?.id ?? '';
}
