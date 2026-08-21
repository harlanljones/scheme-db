import React, { useState, useMemo, memo } from 'react';
import type { Play } from '../engine/types';
import { Field } from './Field';
import { PlayerMarker } from './PlayerMarker';
import { positionAt } from '../engine/interpolate';

export interface SequenceMapProps {
  plays: Play[];
  selectedPlayId: string;
  onSelectPlay: (id: string) => void;
}

type SequenceViewMode = 'mesh-analyzer' | 'graph-matrix';
type ComparisonDisplay = 'ghost-overlay' | 'side-by-side';

export const SequenceMap: React.FC<SequenceMapProps> = memo(({
  plays,
  selectedPlayId,
  onSelectPlay,
}) => {

  const [viewMode, setViewMode] = useState<SequenceViewMode>('mesh-analyzer');
  const [comparisonDisplay, setComparisonDisplay] = useState<ComparisonDisplay>('ghost-overlay');
  const [meshTime, setMeshTime] = useState<number>(0.8);
  const [isPlayingMesh, setIsPlayingMesh] = useState<boolean>(false);

  // The base play is the first play in the scheme family
  const basePlay = plays[0] || null;
  const constraintPlays = useMemo(() => plays.slice(1), [plays]);

  // Selected constraint play (defaults to current selection if not base, or 1st constraint)
  const activeConstraintId = useMemo(() => {
    if (selectedPlayId !== basePlay?.id && plays.some((p) => p.id === selectedPlayId)) {
      return selectedPlayId;
    }
    return constraintPlays[0]?.id || basePlay?.id;
  }, [selectedPlayId, basePlay, plays, constraintPlays]);

  const activeConstraint = useMemo(() => {
    return plays.find((p) => p.id === activeConstraintId) || constraintPlays[0] || basePlay;
  }, [plays, activeConstraintId, constraintPlays, basePlay]);

  // Coach identity
  const coach = basePlay?.coach || 'shanahan';
  const isDefensive = coach === 'saleh' || coach === 'macdonald' || coach === 'flores' || coach === 'fangio' || coach === 'belichick' || coach === 'minter' || coach === 'ryans' || coach === 'shula' || coach === 'spagnuolo' || coach === 'quinn' || coach === 'bowles';

  // Key conflict telemetry metrics based on time t (0.0s - 1.2s and beyond)
  const telemetry = useMemo(() => {
    const t = meshTime;
    const similarity =
      t <= 0.4 ? 100 : t <= 0.8 ? 96 : t <= 1.2 ? 88 : Math.max(15, Math.round(88 - (t - 1.2) * 65));

    let phase = 'Pre-Snap Alignment';
    let defenderStatus = 'Balanced in Base Stance';
    let defenderDisplacement = '0.0 yds';
    let statusColor = '#38bdf8';

    if (t > 0 && t <= 0.4) {
      phase = 'Initial Mesh Step (0.0s - 0.4s)';
      defenderStatus = 'Eyes lock onto RB/QB mesh footwork; reads outside flow';
      defenderDisplacement = '+1.1 yds lateral';
      statusColor = '#38bdf8';
    } else if (t > 0.4 && t <= 0.8) {
      phase = 'Commitment Trigger Window (0.4s - 0.8s)';
      defenderStatus = 'Hard downhill bite into frontside B-gap; commits run fit';
      defenderDisplacement = '+2.8 yds downhill';
      statusColor = '#f59e0b';
    } else if (t > 0.8 && t <= 1.2) {
      phase = 'The Disguise Break Point (0.8s - 1.2s)';
      defenderStatus = 'CONFLICTED: Stranded in fake flow; cannot recover to constraint void';
      defenderDisplacement = '+4.4 yds out of position';
      statusColor = '#ef4444';
    } else {
      phase = 'Constraint Exploitation (> 1.2s)';
      defenderStatus = 'EXPLOITED: Secondary void vacated; QB delivers into uncovered window';
      defenderDisplacement = '+6.5 yds compromised';
      statusColor = '#ec4899';
    }

    return {
      similarity,
      phase,
      defenderStatus,
      defenderDisplacement,
      statusColor,
    };
  }, [meshTime]);

  // Mesh animation tick
  React.useEffect(() => {
    if (!isPlayingMesh) return;
    const interval = setInterval(() => {
      setMeshTime((prev) => {
        if (prev >= 2.0) return 0;
        return Number((prev + 0.05).toFixed(2));
      });
    }, 45);
    return () => clearInterval(interval);
  }, [isPlayingMesh]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Top Header & View Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: isDefensive ? 'var(--accent-lineage)' : 'var(--accent-defense)',
                color: '#ffffff',
              }}
            >
              {isDefensive ? '🛡 Defensive Illusion' : '⚡ Sequencing Disguise Matrix'}
            </span>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {basePlay?.name || 'Base Scheme'} vs Constraint Counters
            </h2>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Comparing the critical 0.0s – 1.2s backfield disguise mesh that creates impossible run-pass conflicts
          </p>
        </div>

        {/* View Mode Toggle Button Group */}
        <div
          role="tablist"
          aria-label="Sequence Analysis View Modes"
          style={{ display: 'flex', backgroundColor: 'var(--bg-canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '4px' }}
        >
          <button
            role="tab"
            aria-selected={viewMode === 'mesh-analyzer'}
            onClick={() => setViewMode('mesh-analyzer')}
            style={{
              backgroundColor: viewMode === 'mesh-analyzer' ? 'var(--border-medium)' : 'transparent',
              color: viewMode === 'mesh-analyzer' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span aria-hidden="true">⏱</span> <span>0.0s - 1.2s Mesh Window</span>
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'graph-matrix'}
            onClick={() => setViewMode('graph-matrix')}
            style={{
              backgroundColor: viewMode === 'graph-matrix' ? 'var(--border-medium)' : 'transparent',
              color: viewMode === 'graph-matrix' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span aria-hidden="true">🕸</span> <span>Sequence Graph & Tells</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'mesh-analyzer' ? (
        /* ========================================================================= */
        /* VIEW 1: 0.0s - 1.2s DISGUISE MESH WINDOW ANALYZER                        */
        /* ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0 }}>
          {/* Controls Bar: Constraint Play Selector + Time Scrubbing HUD */}
          <div
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Row 1: Select which Constraint to Compare */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} role="group" aria-label="Constraint Selection">
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Comparing:
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#064e3b',
                    color: '#34d399',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #059669',
                  }}
                >
                  ★ Base: {basePlay?.name}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>VS</span>
                {constraintPlays.map((constraint) => {
                  const isSelected = constraint.id === activeConstraint.id;
                  return (
                    <button
                      key={constraint.id}
                      aria-pressed={isSelected}
                      aria-label={`Compare constraint counter: ${constraint.name}`}
                      onClick={() => onSelectPlay(constraint.id)}
                      style={{
                        backgroundColor: isSelected ? '#831843' : '#0f172a',
                        color: isSelected ? '#f472b6' : '#cbd5e1',
                        border: isSelected ? '1px solid #f472b6' : '1px solid #334155',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {constraint.name}
                    </button>
                  );
                })}
              </div>

              {/* Display Mode: Ghost Overlay vs Side-by-Side */}
              <div
                role="radiogroup"
                aria-label="Comparison Display Mode"
                style={{ display: 'flex', backgroundColor: '#0f172a', padding: '2px', borderRadius: '6px', border: '1px solid #1e293b' }}
              >
                <button
                  role="radio"
                  aria-checked={comparisonDisplay === 'ghost-overlay'}
                  onClick={() => setComparisonDisplay('ghost-overlay')}
                  style={{
                    backgroundColor: comparisonDisplay === 'ghost-overlay' ? '#334155' : 'transparent',
                    color: comparisonDisplay === 'ghost-overlay' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  👻 Ghost Overlay
                </button>
                <button
                  role="radio"
                  aria-checked={comparisonDisplay === 'side-by-side'}
                  onClick={() => setComparisonDisplay('side-by-side')}
                  style={{
                    backgroundColor: comparisonDisplay === 'side-by-side' ? '#334155' : 'transparent',
                    color: comparisonDisplay === 'side-by-side' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ⫴ Side-by-Side
                </button>
              </div>
            </div>

            {/* Row 2: Precision Scrubber & Quick Keyframe Beats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsPlayingMesh(!isPlayingMesh)}
                aria-label={isPlayingMesh ? 'Pause mesh window playback' : 'Play mesh window animation'}
                style={{
                  backgroundColor: isPlayingMesh ? '#dc2626' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isPlayingMesh ? '⏸ Pause' : '▶ Play Window'}
              </button>

              {/* Slider */}
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.05"
                  value={meshTime}
                  aria-label="Disguise mesh comparison time scrubber"
                  aria-valuemin={0}
                  aria-valuemax={2.0}
                  aria-valuenow={meshTime}
                  aria-valuetext={`${meshTime.toFixed(2)}s`}
                  onChange={(e) => {
                    setIsPlayingMesh(false);
                    setMeshTime(parseFloat(e.target.value));
                  }}
                  style={{
                    flex: 1,
                    accentColor: '#38bdf8',
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: meshTime <= 1.2 ? '#38bdf8' : '#f59e0b',
                    backgroundColor: '#0f172a',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    minWidth: '52px',
                    textAlign: 'center',
                  }}
                >
                  {meshTime.toFixed(2)}s
                </span>
              </div>

              {/* Quick Step Buttons */}
              <div style={{ display: 'flex', gap: '4px' }} role="group" aria-label="Keyframe Snap Positions">
                {[
                  { label: '0.0s Snap', t: 0.0 },
                  { label: '0.4s Mesh', t: 0.4 },
                  { label: '0.8s Commit', t: 0.8 },
                  { label: '1.2s Break', t: 1.2 },
                  { label: '1.8s Void', t: 1.8 },
                ].map((step) => (
                  <button
                    key={step.label}
                    aria-label={`Jump to ${step.label}`}
                    onClick={() => {
                      setIsPlayingMesh(false);
                      setMeshTime(step.t);
                    }}
                    style={{
                      backgroundColor: Math.abs(meshTime - step.t) < 0.05 ? '#0284c7' : '#0f172a',
                      color: Math.abs(meshTime - step.t) < 0.05 ? '#ffffff' : '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: '5px',
                      padding: '4px 7px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Tactical Canvases + Telemetry HUD Grid */}
          <div className="sequence-mesh-grid">
            {/* Visual Canvas Area */}
            <div
              style={{
                backgroundColor: '#060a12',
                borderRadius: '10px',
                border: '1px solid #1e293b',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '260px',
              }}
            >
              {comparisonDisplay === 'ghost-overlay' ? (
                /* Ghost Overlay: Renders Base and Constraint overlapping on 1 field */
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <Field losYard={40}>
                    {/* 1. Base Play (Solid emerald & sky markers) */}
                    <g id="base-layer" opacity={meshTime <= 1.2 ? 0.95 : 0.65}>
                      {basePlay &&
                        [...basePlay.offense, ...basePlay.defense].map((track) => {
                          const pos = positionAt(track, meshTime);
                          return (
                            <PlayerMarker
                              key={`base-${track.id}`}
                              id={track.id}
                              label={track.label}
                              side={track.side}
                              role={track.role}
                              assignment={track.assignment}
                              x={pos.x}
                              y={pos.y}
                              isFocused={false}
                              hasActiveFocus={false}
                            />
                          );
                        })}
                    </g>

                    {/* 2. Constraint Play Ghost Layer (Glowing magenta / amber markers) */}
                    <g id="constraint-ghost-layer">
                      {activeConstraint &&
                        [...activeConstraint.offense, ...activeConstraint.defense].map((track) => {
                          const pos = positionAt(track, meshTime);
                          const isKeyDef = track.id === activeConstraint.summary.keyDefender;
                          return (
                            <g key={`ghost-${track.id}`} opacity={0.9}>
                              {/* Ghost halo circle */}
                              <circle
                                cx={pos.x}
                                cy={-pos.y}
                                r="1.4"
                                fill="none"
                                stroke={track.side === 'offense' ? '#f472b6' : '#fbbf24'}
                                strokeWidth="0.25"
                                strokeDasharray="0.6 0.4"
                              />
                              <PlayerMarker
                                id={track.id}
                                label={track.label}
                                side={track.side}
                                role={track.role}
                                assignment={track.assignment}
                                x={pos.x}
                                y={pos.y}
                                isFocused={isKeyDef}
                                hasActiveFocus={isKeyDef}
                              />
                            </g>
                          );
                        })}
                    </g>
                  </Field>

                  {/* Legend Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '12px',
                      backgroundColor: 'rgba(9, 13, 22, 0.88)',
                      backdropFilter: 'blur(6px)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #1e293b',
                      display: 'flex',
                      gap: '12px',
                      fontSize: '0.72rem',
                    }}
                  >
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                      ● Solid: Base ({basePlay?.name.split(' ')[0]})
                    </span>
                    <span style={{ color: '#f472b6', fontWeight: 700 }}>
                      ◌ Dashed: Constraint ({activeConstraint?.name.split(' ')[0]})
                    </span>
                  </div>
                </div>
              ) : (
                /* Side-by-Side Dual Canvases */
                <div className="sequence-side-by-side">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '100%' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                      ★ Base: {basePlay?.name}
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                      {basePlay && (
                        <Field losYard={40}>
                          {[...basePlay.offense, ...basePlay.defense].map((track) => {
                            const pos = positionAt(track, meshTime);
                            return (
                              <PlayerMarker
                                key={`side-base-${track.id}`}
                                id={track.id}
                                label={track.label}
                                side={track.side}
                                role={track.role}
                                assignment={track.assignment}
                                x={pos.x}
                                y={pos.y}
                                isFocused={false}
                                hasActiveFocus={false}
                              />
                            );
                          })}
                        </Field>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '100%' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase' }}>
                      ⚡ Constraint: {activeConstraint?.name}
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                      {activeConstraint && (
                        <Field losYard={40}>
                          {[...activeConstraint.offense, ...activeConstraint.defense].map((track) => {
                            const pos = positionAt(track, meshTime);
                            const isKey = track.id === activeConstraint.summary.keyDefender;
                            return (
                              <PlayerMarker
                                key={`side-constraint-${track.id}`}
                                id={track.id}
                                label={track.label}
                                side={track.side}
                                role={track.role}
                                assignment={track.assignment}
                                x={pos.x}
                                y={pos.y}
                                isFocused={isKey}
                                hasActiveFocus={isKey}
                              />
                            );
                          })}
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Conflict Telemetry Dashboard */}
            <div
              style={{
                backgroundColor: '#070b14',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
              }}
            >
              {/* Telemetry Header */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Live Conflict Telemetry HUD
                </div>
                <h3 style={{ margin: '2px 0 0', fontSize: '1rem', color: '#f8fafc', fontWeight: 800 }}>
                  {telemetry.phase}
                </h3>
              </div>

              {/* Similarity Index Gauge */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                    Mesh Visual Identity Match:
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: telemetry.statusColor, fontFamily: 'monospace' }}>
                    {telemetry.similarity}%
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: telemetry.statusColor,
                      transform: `scaleX(${telemetry.similarity / 100})`,
                      transformOrigin: 'left',
                      transition: 'transform 0.1s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                  {meshTime <= 1.2
                    ? '✓ Indistinguishable backfield tracks & OL reach steps'
                    : '⚡ Diverged: QB pulls ball, bootleg/shot launched into void'}
                </span>
              </div>

              {/* Key Conflict Defender Dossier */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${telemetry.statusColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8' }}>
                    Key Conflict Defender
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {activeConstraint.summary.keyDefender || 'MIKE / WDE'}
                  </span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#f8fafc', fontWeight: 600, lineHeight: 1.4 }}>
                  {telemetry.defenderStatus}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Displacement:</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: telemetry.statusColor, fontFamily: 'monospace' }}>
                    {telemetry.defenderDisplacement}
                  </span>
                </div>
              </div>

              {/* Tactical Tell & Motive */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  The 1 Visual Tell / False Key:
                </span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.45, backgroundColor: '#090d16', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  {activeConstraint.sequence.tell || 'Identical stretch mesh until the 1.2s break point.'}
                </p>
              </div>

              {/* Action Button: Launch Full Visualizer */}
              <button
                onClick={() => onSelectPlay(activeConstraint.id)}
                style={{
                  marginTop: 'auto',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
              >
                🎬 Launch {activeConstraint.name} in Visualizer ▶
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: TACTICAL SEQUENCE GRAPH & CONFLICT MATRIX                         */
        /* ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* Interactive SVG Web Map */}
          <div
            style={{
              backgroundColor: '#060a12',
              borderRadius: '10px',
              border: '1px solid #1e293b',
              padding: '12px',
              minHeight: '260px',
              position: 'relative',
            }}
          >
            <svg viewBox="0 0 700 240" style={{ width: '100%', height: '100%', display: 'block' }}>
              <defs>
                <marker id="seq-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Central Base Node (X=350, Y=120) to 3 Constraint Nodes (Left X=110, Y=60; Center-Right X=590, Y=60; Bottom X=350, Y=200) */}
              {/* Connector 1: Base -> Left Shot Constraint */}
              <path
                d="M 280 120 C 220 120, 180 80, 150 70"
                fill="none"
                stroke="#f472b6"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#seq-arrow)"
              />
              {/* Connector 2: Base -> Right Rollout Constraint */}
              <path
                d="M 420 120 C 480 120, 520 80, 550 70"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#seq-arrow)"
              />
              {/* Connector 3: Base -> Bottom Motion Constraint */}
              <path
                d="M 350 155 L 350 185"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#seq-arrow)"
              />

              {/* Base Node */}
              {basePlay && (
                <g
                  transform="translate(265, 85)"
                  onClick={() => onSelectPlay(basePlay.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width="170"
                    height="68"
                    rx="8"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="2.5"
                  />
                  <text x="85" y="18" fill="#34d399" fontSize="8" fontWeight="800" textAnchor="middle">
                    CORE BASE FOUNDATION
                  </text>
                  <text x="85" y="36" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">
                    {basePlay.name}
                  </text>
                  <text x="85" y="52" fill="#cbd5e1" fontSize="7.5" textAnchor="middle">
                    0.0s – 1.2s Shared Backfield Mesh
                  </text>
                </g>
              )}

              {/* Constraint Nodes */}
              {constraintPlays.map((constraint, idx) => {
                const isSelected = constraint.id === activeConstraint.id;
                let posX = idx === 0 ? 30 : idx === 1 ? 490 : 265;
                let posY = idx === 0 ? 30 : idx === 1 ? 30 : 175;
                let strokeColor = idx === 0 ? '#f472b6' : idx === 1 ? '#60a5fa' : '#fbbf24';
                let bgColor = idx === 0 ? '#831843' : idx === 1 ? '#1e3a8a' : '#78350f';

                return (
                  <g
                    key={constraint.id}
                    transform={`translate(${posX}, ${posY})`}
                    onClick={() => onSelectPlay(constraint.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect x="-3" y="-3" width="176" height="64" rx="10" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                    )}
                    <rect
                      x="0"
                      y="0"
                      width="170"
                      height="58"
                      rx="8"
                      fill={bgColor}
                      stroke={strokeColor}
                      strokeWidth="1.5"
                    />
                    <text x="85" y="16" fill={strokeColor} fontSize="7.5" fontWeight="800" textAnchor="middle">
                      {idx === 0 ? 'SHOT CONSTRAINT' : idx === 1 ? 'ROLLOUT COUNTER' : 'MOTION VARIANT'}
                    </text>
                    <text x="85" y="32" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">
                      {constraint.name}
                    </text>
                    <text x="85" y="47" fill="#cbd5e1" fontSize="7" textAnchor="middle">
                      Key: {constraint.summary.keyDefender}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Detailed Matrix Table Breakdown */}
          <div
            style={{
              backgroundColor: '#070b14',
              borderRadius: '10px',
              border: '1px solid #1e293b',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
              Sequencing Matrix & False Key Breakdown
            </div>

            <div className="sequence-matrix-grid">
              {plays.map((play, index) => {
                const isBase = index === 0;
                const isCurrent = play.id === activeConstraint.id;

                return (
                  <div
                    key={play.id}
                    onClick={() => onSelectPlay(play.id)}
                    style={{
                      backgroundColor: isCurrent ? '#0f172a' : '#090d16',
                      border: isCurrent
                        ? '2px solid #38bdf8'
                        : isBase
                        ? '1px solid #059669'
                        : '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          backgroundColor: isBase ? '#064e3b' : '#1e293b',
                          color: isBase ? '#34d399' : '#94a3b8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {isBase ? '★ Foundation Base' : `Constraint #${index}`}
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b' }}>
                        Target: {play.summary.keyDefender}
                      </span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                      {play.name}
                    </h4>

                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {play.summary.whyItWorks}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Tell: <strong style={{ color: '#cbd5e1' }}>{play.sequence.tell.slice(0, 32)}...</strong>
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8' }}>
                        Inspect ▶
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

