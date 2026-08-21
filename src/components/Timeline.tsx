import React, { useEffect, useCallback, useMemo, useState, useRef, memo } from 'react';
import type { Beat } from '../engine/types';
import { formatTimecode, type PlaybackSpeed } from '../engine/playback';

export interface TimelineProps {
  t: number;
  duration: number;
  playing: boolean;
  speed: PlaybackSpeed;
  beats: Beat[];
  loop?: boolean;
  onToggle: () => void;
  onSeek: (t: number) => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onReset: () => void;
  onToggleLoop?: () => void;
}

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 1.5];

export const Timeline: React.FC<TimelineProps> = memo(({
  t,
  duration,
  playing,
  speed,
  beats,
  loop = false,
  onToggle,
  onSeek,
  onSetSpeed,
  onReset,
  onToggleLoop,
}) => {

  const [hoveredBeat, setHoveredBeat] = useState<{ beat: Beat; xPct: number } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  const stepTime = useCallback(
    (delta: number) => {
      onSeek(Math.max(0, Math.min(duration, Number((t + delta).toFixed(2)))));
    },
    [duration, onSeek, t]
  );

  const currentBeatIndex = useMemo(() => {
    let active = 0;
    for (let i = 0; i < beats.length; i++) {
      if (t >= beats[i].t - 0.05) {
        active = i;
      }
    }
    return active;
  }, [beats, t]);

  const handlePrevBeat = useCallback(() => {
    if (beats.length === 0) return;
    const prevIdx = Math.max(0, currentBeatIndex - 1);
    onSeek(beats[prevIdx].t);
  }, [beats, currentBeatIndex, onSeek]);

  const handleNextBeat = useCallback(() => {
    if (beats.length === 0) return;
    const nextIdx = Math.min(beats.length - 1, currentBeatIndex + 1);
    onSeek(beats[nextIdx].t);
  }, [beats, currentBeatIndex, onSeek]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ' || e.code === 'KeyK') {
        e.preventDefault();
        onToggle();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyJ') {
        e.preventDefault();
        stepTime(-0.1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        e.preventDefault();
        stepTime(0.1);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        onReset();
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        handlePrevBeat();
      } else if (e.code === 'KeyN') {
        e.preventDefault();
        handleNextBeat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle, stepTime, onReset, handlePrevBeat, handleNextBeat]);

  // Close shortcuts popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
        setShowShortcutsModal(false);
      }
    };
    if (showShortcutsModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShortcutsModal]);

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (t / duration) * 100)) : 0;

  return (
    <div className="pro-timeline-deck" role="region" aria-label="Film Playback Control Deck">
      {/* Row 1: Scrubber Rail with embedded timecode HUD */}
      <div className="timeline-rail-row">
        <div className="timeline-scrub-track-container">
          {/* Base Background Rail */}
          <div className="timeline-rail-bg">
            <div
              className="timeline-rail-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Beat Markers along the track */}
          {duration > 0 &&
            beats.map((b, idx) => {
              const leftPct = (b.t / duration) * 100;
              const isPast = t >= b.t;
              const isActive = idx === currentBeatIndex;

              return (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  aria-label={`Jump to beat: ${b.title} at ${b.t.toFixed(1)}s`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(b.t);
                  }}
                  onMouseEnter={() => setHoveredBeat({ beat: b, xPct: leftPct })}
                  onMouseLeave={() => setHoveredBeat(null)}
                  className={`timeline-beat-pin ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}`}
                  style={{ left: `${leftPct}%` }}
                >
                  <div className="beat-pin-diamond" />
                </div>
              );
            })}

          {/* Hover Beat Tooltip */}
          {hoveredBeat && (
            <div
              className="timeline-beat-hover-tooltip"
              style={{ left: `${Math.min(85, Math.max(15, hoveredBeat.xPct))}%` }}
            >
              <span className="tooltip-time">[T={hoveredBeat.beat.t.toFixed(2)}s]</span>
              <span className="tooltip-title">{hoveredBeat.beat.title}</span>
            </div>
          )}

          {/* Native Range Slider Input for smooth Scrubbing */}
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={t}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            aria-label="Playhead Timeline Scrubber"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={t}
            aria-valuetext={`${t.toFixed(2)}s of ${duration.toFixed(2)}s`}
            className="timeline-slider-input"
          />

          {/* Custom Playhead Handle (Needle & Cap) */}
          <div
            aria-hidden="true"
            className="timeline-playhead-needle"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="needle-cap" />
            <div className="needle-line" />
          </div>
        </div>

        {/* Master Film Timecode Display */}
        <div className="timeline-timecode-badge">
          <span className="tc-status-dot" style={{ backgroundColor: playing ? '#22c55e' : '#eab308' }} aria-hidden="true" />
          <span className="tc-current">{formatTimecode(t)}</span>
          <span className="tc-slash">/</span>
          <span className="tc-total">{formatTimecode(duration)}</span>
        </div>
      </div>

      {/* Row 2: Streamlined Single-Row Controls Toolbar */}
      <div className="timeline-controls-row">
        {/* Left: Playback & Frame Stepping */}
        <div className="controls-left-cluster">
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? 'Pause Playback (Space / K)' : 'Play Animation (Space / K)'}
            title={playing ? 'Pause [Space / K]' : 'Play [Space / K]'}
            className={`timeline-play-btn ${playing ? 'playing' : ''}`}
          >
            {playing ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="4" width="4" height="16" rx="1" />
                  <rect x="15" y="4" width="4" height="16" rx="1" />
                </svg>
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Frame Steppers */}
          <div className="button-group-unified">
            <button
              type="button"
              onClick={() => stepTime(-0.1)}
              aria-label="Step Back 0.1s (Left Arrow / J)"
              title="Step Back 0.1s [← / J]"
              className="ctrl-subtle-btn"
            >
              -0.1s
            </button>
            <button
              type="button"
              onClick={() => stepTime(0.1)}
              aria-label="Step Forward 0.1s (Right Arrow / L)"
              title="Step Forward 0.1s [→ / L]"
              className="ctrl-subtle-btn"
            >
              +0.1s
            </button>
          </div>

          {/* Beat Steppers */}
          <div className="button-group-unified">
            <button
              type="button"
              onClick={handlePrevBeat}
              disabled={currentBeatIndex === 0}
              aria-label="Previous Key Beat (B)"
              title="Previous Key Beat [B]"
              className="ctrl-subtle-btn"
            >
              ‹ Beat
            </button>
            <button
              type="button"
              onClick={handleNextBeat}
              disabled={currentBeatIndex >= beats.length - 1}
              aria-label="Next Key Beat (N)"
              title="Next Key Beat [N]"
              className="ctrl-subtle-btn"
            >
              Beat ›
            </button>
          </div>

          {/* Reset / Snap */}
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset to Snap T=0.0s (R)"
            title="Snap Reset T=0.0s [R]"
            className="ctrl-subtle-btn snap"
          >
            ↺ SNAP
          </button>
        </div>

        {/* Right: Loop, Speed Multiplier & Shortcuts Popover */}
        <div className="controls-right-cluster">
          {/* Loop Toggle Pill */}
          {onToggleLoop && (
            <button
              type="button"
              onClick={onToggleLoop}
              aria-pressed={loop}
              title={`Loop Playback: ${loop ? 'ON' : 'OFF'}`}
              className={`ctrl-loop-btn ${loop ? 'active' : ''}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
              <span>LOOP</span>
            </button>
          )}

          {/* Speed Selector Pills */}
          <div className="speed-pills-group" role="group" aria-label="Playback speed">
            {PLAYBACK_SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetSpeed(s)}
                aria-pressed={speed === s}
                className={`speed-btn ${speed === s ? 'active' : ''}`}
                title={`Speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Keyboard Shortcuts Trigger */}
          <div style={{ position: 'relative' }} ref={shortcutsRef}>
            <button
              type="button"
              onClick={() => setShowShortcutsModal(!showShortcutsModal)}
              aria-label="View Keyboard Shortcuts"
              title="Keyboard Shortcuts Guide"
              className={`ctrl-subtle-btn ${showShortcutsModal ? 'active' : ''}`}
            >
              ⌨ Keys
            </button>

            {showShortcutsModal && (
              <div className="shortcuts-popover-menu" role="dialog" aria-label="Keyboard Shortcuts">
                <div className="shortcuts-popover-title">Film Room Shortcuts</div>
                <div className="shortcuts-list">
                  <div className="shortcut-row"><kbd>Space</kbd> / <kbd>K</kbd> <span>Play / Pause</span></div>
                  <div className="shortcut-row"><kbd>←</kbd> / <kbd>→</kbd> <span>±0.1s Frame Step</span></div>
                  <div className="shortcut-row"><kbd>B</kbd> / <kbd>N</kbd> <span>Prev / Next Key Beat</span></div>
                  <div className="shortcut-row"><kbd>[</kbd> / <kbd>]</kbd> <span>Prev / Next Play in Scheme</span></div>
                  <div className="shortcut-row"><kbd>Shift</kbd>+<kbd>[</kbd> / <kbd>]</kbd> <span>Prev / Next Scheme System</span></div>
                  <div className="shortcut-row"><kbd>R</kbd> <span>Snap to T=0.0s</span></div>
                  <div className="shortcut-row"><kbd>T</kbd> / <kbd>F</kbd> <span>Full-Field Theater Mode</span></div>
                  <div className="shortcut-row"><kbd>1</kbd>–<kbd>4</kbd> <span>Switch Main View Tabs</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});


