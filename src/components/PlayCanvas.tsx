import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import type { Play, PlayerTrack } from '../engine/types';
import { Field } from './Field';
import { PlayerMarker } from './PlayerMarker';
import { Trail } from './Trail';
import { positionAt } from '../engine/interpolate';
import { activeBeatIndex, isFocused } from '../engine/beats';

export interface PlayCanvasProps {
  play: Play;
  t: number;
}

/**
 * Determines whether a defender is the designated conflict read key for the current play/beat.
 */
function isKeyConflictDefender(play: Play, track: PlayerTrack, activeFocus?: string[]): boolean {
  if (track.side !== 'defense') {
    return false;
  }

  const kd = play.summary?.keyDefender || '';
  const idRegex = new RegExp(`\\b${track.id}\\b`, 'i');
  const inSummary = idRegex.test(kd);
  const inActiveBeatFocus = Boolean(activeFocus?.includes(track.id));

  return inSummary && (inActiveBeatFocus || !activeFocus || activeFocus.length === 0);
}

/**
 * Calculates current movement heading (in SVG degrees) and motion state from interpolated positions.
 */
function getPlayerMovement(track: PlayerTrack, t: number, duration: number): { heading: number; isMoving: boolean } {
  const dt = 0.08;
  const tNext = Math.min(duration, t + dt);
  const tPrev = Math.max(0, t - dt);

  const p1 = positionAt(track, tPrev);
  const p2 = positionAt(track, tNext);

  const dx = p2.x - p1.x;
  const dy = -(p2.y - p1.y); // Field y is inverted in SVG y
  const dist = Math.hypot(dx, dy);

  if (dist > 0.05 && t > 0.05) {
    return {
      heading: (Math.atan2(dy, dx) * 180) / Math.PI,
      isMoving: true,
    };
  }

  // Pre-snap alignment: Offense faces downfield (-90 deg), Defense faces backfield (+90 deg)
  return {
    heading: track.side === 'offense' ? -90 : 90,
    isMoving: false,
  };
}

export const PlayCanvas: React.FC<PlayCanvasProps> = memo(({ play, t }) => {
  const [showLegend, setShowLegend] = useState(false);
  const [showOverlaysMenu, setShowOverlaysMenu] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [showGhostRoutes, setShowGhostRoutes] = useState(true);
  const [showConflictVector, setShowConflictVector] = useState(true);
  const [showBall, setShowBall] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const overlaysMenuRef = useRef<HTMLDivElement>(null);

  const activeIdx = activeBeatIndex(play.beats, t);
  const activeBeat = activeIdx >= 0 ? play.beats[activeIdx] : undefined;
  const hasActiveFocus = Boolean(activeBeat?.focus && activeBeat.focus.length > 0);

  // Stable track lists memoized per play
  const allTracks = useMemo(() => [...play.offense, ...play.defense], [play.offense, play.defense]);
  const qbTrack = useMemo(() => play.offense.find((tr) => tr.id === 'QB' || tr.role === 'qb') || play.offense[0], [play.offense]);
  const carrierTrack = useMemo(() => play.offense.find((tr) => tr.trail === 'carry'), [play.offense]);

  // Find QB / Primary ball-handler position
  const qbPos = qbTrack ? positionAt(qbTrack, t) : undefined;
  let ballPos = qbPos;

  if (carrierTrack && qbTrack && carrierTrack.id !== qbTrack.id) {
    const meshTime = 1.1; // Typical Shanahan/NFL mesh handoff time
    if (t < meshTime) {
      ballPos = qbPos;
    } else {
      const carrierPos = positionAt(carrierTrack, t);
      ballPos = carrierPos;
    }
  }

  // Find active key conflict defender(s)
  const conflictTracks = play.defense.filter((tr) =>
    isKeyConflictDefender(play, tr, activeBeat?.focus)
  );


  // Close overlays dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlaysMenuRef.current && !overlaysMenuRef.current.contains(e.target as Node)) {
        setShowOverlaysMenu(false);
      }
    };
    if (showOverlaysMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOverlaysMenu]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Floating Canvas HUD Overlay (Top-Left) */}
      <div className="canvas-hud-top-left">
        <div className="canvas-hud-badge">
          <span>LOS @ +40 YD</span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#f8fafc' }}>{play.personnel}</span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#94a3b8' }}>{play.coverage}</span>
        </div>
      </div>

      {/* Floating Controls (Top-Right): Overlays Menu & Tactical Key */}
      <div className="canvas-hud-top-right">
        {/* Layer Overlays Dropdown Button */}
        <div style={{ position: 'relative' }} ref={overlaysMenuRef}>
          <button
            type="button"
            onClick={() => setShowOverlaysMenu(!showOverlaysMenu)}
            aria-expanded={showOverlaysMenu}
            aria-label="Toggle visual overlays menu"
            className={`canvas-hud-btn ${showOverlaysMenu ? 'active' : ''}`}
          >
            <span>👁 Overlays</span>
            <span style={{ fontSize: '0.6rem' }}>▾</span>
          </button>

          {/* Overlays Popover Menu */}
          {showOverlaysMenu && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                right: 0,
                backgroundColor: '#0a101d',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '8px',
                minWidth: '190px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', padding: '2px 4px' }}>
                All-22 Visual Layers
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#f8fafc', cursor: 'pointer', padding: '3px 4px' }}>
                <input
                  type="checkbox"
                  checked={showGhostRoutes}
                  onChange={(e) => setShowGhostRoutes(e.target.checked)}
                />
                Pre-Snap Play Art (Routes)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#f8fafc', cursor: 'pointer', padding: '3px 4px' }}>
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                />
                Live Movement Trails
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#f8fafc', cursor: 'pointer', padding: '3px 4px' }}>
                <input
                  type="checkbox"
                  checked={showBall}
                  onChange={(e) => setShowBall(e.target.checked)}
                />
                Football Tracking
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#f8fafc', cursor: 'pointer', padding: '3px 4px' }}>
                <input
                  type="checkbox"
                  checked={showConflictVector}
                  onChange={(e) => setShowConflictVector(e.target.checked)}
                />
                Conflict Laser Line
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#f8fafc', cursor: 'pointer', padding: '3px 4px' }}>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                Player ID Labels
              </label>
            </div>
          )}
        </div>

        {/* Tactical Key Toggle Button */}
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          aria-label="Toggle All-22 Tactical Legend"
          aria-expanded={showLegend}
          className={`canvas-hud-btn ${showLegend ? 'active' : ''}`}
        >
          <span>{showLegend ? '✕' : 'ℹ️'}</span>
          <span>{showLegend ? 'Close Key' : 'Key Guide'}</span>
        </button>
      </div>

      {/* Tactical HUD Legend Overlay Drawer */}
      {showLegend && (
        <div
          role="region"
          aria-label="All-22 Tactical Notation Legend"
          style={{
            position: 'absolute',
            top: '42px',
            right: '8px',
            zIndex: 25,
            backgroundColor: 'rgba(9, 14, 26, 0.96)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
            padding: '12px 14px',
            maxWidth: '300px',
            width: 'calc(100% - 16px)',
            maxHeight: 'calc(100% - 50px)',
            overflowY: 'auto',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              ALL-22 TACTICAL NOTATION
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--accent-offense)', backgroundColor: '#101a2e', display: 'inline-block' }} />
              <div><strong style={{ color: 'var(--text-primary)' }}>Offense Token</strong>: Circle + Gold Rim</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', border: '2px solid var(--accent-defense)', backgroundColor: '#081e33', display: 'inline-block' }} />
              <div><strong style={{ color: 'var(--text-primary)' }}>Defense Token</strong>: Square + Cyan Rim</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px dashed var(--accent-conflict)', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-block' }} />
              <div><strong style={{ color: 'var(--accent-conflict)' }}>Read Key</strong>: Pulsing Reticle + Laser</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '2px', backgroundColor: 'var(--accent-defense)', display: 'inline-block' }} />
              <div><strong style={{ color: 'var(--text-primary)' }}>Pass Route</strong>: Solid Cyan Line</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '2px', backgroundColor: 'var(--accent-offense)', display: 'inline-block' }} />
              <div><strong style={{ color: 'var(--text-primary)' }}>Run / Carry</strong>: Solid Amber Path</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '2px', borderTop: '2px dashed var(--accent-defense)', display: 'inline-block' }} />
              <div><strong style={{ color: 'var(--text-primary)' }}>Zone Drop</strong>: Dashed Cyan Vector</div>
            </div>
          </div>
        </div>
      )}

      <Field losYard={40}>
        {/* 1. Tactical Conflict Read Vector (Dashed laser connection between QB and read defender) */}
        {showConflictVector && qbPos && (
          <g id="conflict-vectors-layer">
            {conflictTracks.map((defTrack) => {
              const defPos = positionAt(defTrack, t);
              const isDefFocused = isFocused(activeBeat, defTrack.id);
              const lineOpacity = hasActiveFocus ? (isDefFocused ? 0.85 : 0.45) : 0.65;

              return (
                <g key={`conflict-vec-${defTrack.id}`} opacity={lineOpacity}>
                  <line
                    x1={qbPos.x}
                    y1={-qbPos.y}
                    x2={defPos.x}
                    y2={-defPos.y}
                    stroke="#ef4444"
                    strokeWidth="0.2"
                    strokeDasharray="0.5 0.35"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0; -0.85"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </line>

                  <circle
                    cx={(qbPos.x + defPos.x) / 2}
                    cy={-(qbPos.y + defPos.y) / 2}
                    r="0.28"
                    fill="#ef4444"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 2. Trails & Ghost Route Play Art Layer (rendered beneath markers) */}
        {(showTrails || showGhostRoutes) && (
          <g id="trails-layer">
            {allTracks.map((track) => {
              const focused = isFocused(activeBeat, track.id);
              const isConflict = isKeyConflictDefender(play, track, activeBeat?.focus);

              return (
                <Trail
                  key={`trail-${track.id}`}
                  track={track}
                  t={showTrails ? t : 0}
                  isFocused={focused}
                  hasActiveFocus={hasActiveFocus}
                  isKeyConflict={isConflict}
                  showGhost={showGhostRoutes}
                />
              );
            })}
          </g>
        )}

        {/* 3. Football Marker Layer (rendered beside ball carrier) */}
        {showBall && ballPos && (
          <g
            id="football-token"
            transform={`translate(${ballPos.x + 0.48}, ${-ballPos.y + 0.48})`}
            style={{ transition: 'transform 0.05s linear' }}
          >
            {/* Soft ball shadow */}
            <ellipse cx="0" cy="0.08" rx="0.44" ry="0.26" fill="#000000" opacity="0.45" />
            {/* Leather ball body */}
            <ellipse
              cx="0"
              cy="0"
              rx="0.42"
              ry="0.26"
              transform="rotate(-25)"
              fill="#854d0e"
              stroke="#fef08a"
              strokeWidth="0.07"
            />
            {/* White tip stripes */}
            <path
              d="M -0.28 -0.13 L -0.28 0.13"
              transform="rotate(-25)"
              stroke="#ffffff"
              strokeWidth="0.05"
              strokeLinecap="round"
            />
            <path
              d="M 0.28 -0.13 L 0.28 0.13"
              transform="rotate(-25)"
              stroke="#ffffff"
              strokeWidth="0.05"
              strokeLinecap="round"
            />
            {/* White laces */}
            <line
              x1="-0.14"
              y1="0"
              x2="0.14"
              y2="0"
              transform="rotate(-25)"
              stroke="#ffffff"
              strokeWidth="0.05"
              strokeLinecap="round"
            />
            <line
              x1="-0.07"
              y1="-0.07"
              x2="-0.07"
              y2="0.07"
              transform="rotate(-25)"
              stroke="#ffffff"
              strokeWidth="0.04"
            />
            <line
              x1="0.07"
              y1="-0.07"
              x2="0.07"
              y2="0.07"
              transform="rotate(-25)"
              stroke="#ffffff"
              strokeWidth="0.04"
            />
          </g>
        )}

        {/* 4. Player Markers Layer */}
        <g id="markers-layer">
          {allTracks.map((track) => {
            const pos = positionAt(track, t);
            const focused = isFocused(activeBeat, track.id);
            const motion = getPlayerMovement(track, t, play.duration);
            const isConflict = isKeyConflictDefender(play, track, activeBeat?.focus);

            return (
              <PlayerMarker
                key={`marker-${track.id}`}
                id={track.id}
                label={showLabels ? track.label : ''}
                side={track.side}
                role={track.role}
                assignment={track.assignment}
                x={pos.x}
                y={pos.y}
                heading={motion.heading}
                isMoving={motion.isMoving}
                isFocused={focused}
                hasActiveFocus={hasActiveFocus}
                isKeyConflict={isConflict}
              />
            );
          })}
        </g>
      </Field>
    </div>
  );
});


