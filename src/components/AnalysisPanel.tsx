import React, { useMemo, useState, memo } from 'react';
import type { Play } from '../engine/types';
import { activeBeatIndex } from '../engine/beats';
import { GlossaryText, GlossaryModal } from './GlossaryTooltip';

export interface AnalysisPanelProps {
  play: Play;
  t: number;
  onSeekBeat: (t: number) => void;
}

const DEFENSIVE_COACHES = new Set([
  'saleh',
  'macdonald',
  'fangio',
  'flores',
  'belichick',
  'minter',
  'ryans',
  'shula',
  'spagnuolo',
  'quinn',
  'bowles',
]);

export const AnalysisPanel: React.FC<AnalysisPanelProps> = memo(({ play, t, onSeekBeat }) => {
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const activeIdx = activeBeatIndex(play.beats, t);
  const activeBeat = play.beats[activeIdx] || play.beats[0];

  const isDefensiveCoach = DEFENSIVE_COACHES.has(play.coach);

  // Format personnel label (e.g. "21 PERS" or "11 PERS")
  const personnelLabel = useMemo(() => {
    const raw = play.personnel.trim();
    if (raw.toUpperCase().includes('PERS') || raw.toLowerCase().includes('base') || raw.toLowerCase().includes('nickel')) {
      return raw.toUpperCase();
    }
    return `${raw} PERS`;
  }, [play.personnel]);

  const handlePrevBeat = () => {
    const prevIdx = Math.max(0, activeIdx - 1);
    onSeekBeat(play.beats[prevIdx].t);
  };

  const handleNextBeat = () => {
    const nextIdx = Math.min(play.beats.length - 1, activeIdx + 1);
    onSeekBeat(play.beats[nextIdx].t);
  };

  // Memoize static Play Metadata header section (only recomputes when play changes)
  const headerSection = useMemo(() => (
    <section className="analysis-header-card">
      <div className="analysis-title-group">
        <div className="analysis-meta-row">
          <span
            className="scheme-type-badge"
            style={{
              color: isDefensiveCoach ? 'var(--accent-defense)' : 'var(--accent-offense)',
              backgroundColor: isDefensiveCoach ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              borderColor: isDefensiveCoach ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)',
            }}
          >
            {isDefensiveCoach ? 'DEFENSIVE SCHEME' : 'OFFENSIVE SCHEME'}
          </span>
          <span className="analysis-coach-tag">{play.coach.toUpperCase()}</span>
        </div>
        <h2 className="analysis-play-title">{play.name}</h2>
      </div>

      {/* Matchup Badges */}
      <div className="matchup-badges-grid">
        <div className="matchup-pill">
          <span className="pill-lbl">Personnel</span>
          <span className="pill-val">{personnelLabel}</span>
        </div>
        <div className="matchup-pill">
          <span className="pill-lbl">Coverage</span>
          <span className="pill-val">{play.coverage}</span>
        </div>
        <div className="matchup-pill">
          <span className="pill-lbl">Formation</span>
          <span className="pill-val">{play.formation}</span>
        </div>
        <div className="matchup-pill">
          <span className="pill-lbl">Opposing Front</span>
          <span className="pill-val">{play.frontName}</span>
        </div>
      </div>

      {/* Key Read Target */}
      <div className="conflict-read-banner">
        <span className="read-target-label">
          {isDefensiveCoach ? 'PRIMARY PRESSURE TARGET' : 'KEY CONFLICT READ'}
        </span>
        <span className="read-target-name">{play.summary.keyDefender}</span>
      </div>
    </section>
  ), [play.name, play.coach, play.coverage, play.formation, play.frontName, play.summary.keyDefender, isDefensiveCoach, personnelLabel]);

  // Memoize static Scheme Mechanics breakdown (only recomputes when play changes)
  const mechanicsSection = useMemo(() => (
    <section className="scheme-mechanics-section">
      {/* Why It Works */}
      <div className="mechanic-block why-block">
        <div className="mechanic-header">
          <span className="mechanic-accent-bar accent-green" aria-hidden="true" />
          <h4 className="mechanic-title">Why the Scheme Works</h4>
        </div>
        <p className="mechanic-text">
          <GlossaryText text={play.summary.whyItWorks} />
        </p>
      </div>

      {/* Tactical Motive / Concept Objective */}
      {play.summary.motive && (
        <div className="mechanic-block motive-block">
          <div className="mechanic-header">
            <span className="mechanic-accent-bar accent-blue" aria-hidden="true" />
            <h4 className="mechanic-title">Concept Objective</h4>
          </div>
          <p className="mechanic-text">
            <GlossaryText text={play.summary.motive} />
          </p>
        </div>
      )}

      {/* Defensive Counter / Vulnerability */}
      <div className="mechanic-block counter-block">
        <div className="mechanic-header">
          <span className="mechanic-accent-bar accent-red" aria-hidden="true" />
          <h4 className="mechanic-title">
            {isDefensiveCoach ? 'Offensive Counter' : 'Defensive Counter & Vulnerability'}
          </h4>
        </div>
        <p className="mechanic-text">
          <GlossaryText text={play.summary.failureMode} />
        </p>
      </div>

      {/* Visual Tell / Sequencing Cue */}
      {play.sequence?.tell && (
        <div className="mechanic-block tell-block">
          <div className="mechanic-header">
            <span className="mechanic-accent-bar accent-amber" aria-hidden="true" />
            <h4 className="mechanic-title">The Visual Tell</h4>
          </div>
          <p className="mechanic-text">
            <GlossaryText text={play.sequence.tell} />
          </p>
        </div>
      )}

      {/* Glossary Quick Explorer Bar */}
      <div
        style={{
          marginTop: '4px',
          paddingTop: '8px',
          borderTop: '1px solid #142036',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.64rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#38bdf8' }}>💡</span> Hover underlined terms for tactical glossary cues
        </span>
        <button
          type="button"
          onClick={() => setShowGlossaryModal(true)}
          style={{
            background: '#0c1626',
            border: '1px solid #1e3358',
            color: '#38bdf8',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#162844';
            e.currentTarget.style.borderColor = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0c1626';
            e.currentTarget.style.borderColor = '#1e3358';
          }}
        >
          📖 Glossary
        </button>
      </div>
    </section>
  ), [play.summary.whyItWorks, play.summary.motive, play.summary.failureMode, play.sequence?.tell, isDefensiveCoach]);

  return (
    <aside className="analysis-console-container" aria-label="Coaching Analysis Console">
      {/* SECTION 1: Play Metadata & Matchup Telemetry */}
      {headerSection}

      {/* SECTION 2: Synchronized Film Beat (Active Moment) */}
      <section className="live-beat-card" aria-label="Synchronized play beat">
        <div className="live-beat-header">
          <div className="beat-moment-indicator">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span className="moment-step-text">
              Moment {activeIdx + 1} of {play.beats.length}
            </span>
            <span className="moment-timestamp">T={activeBeat.t.toFixed(1)}s</span>
          </div>

          <div className="beat-step-controls">
            <button
              type="button"
              onClick={handlePrevBeat}
              disabled={activeIdx === 0}
              className="beat-step-btn"
              aria-label="Previous beat"
              title="Previous Beat [B]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextBeat}
              disabled={activeIdx === play.beats.length - 1}
              className="beat-step-btn"
              aria-label="Next beat"
              title="Next Beat [N]"
            >
              ›
            </button>
          </div>
        </div>

        <h3 className="live-beat-title">{activeBeat.title}</h3>
        <p className="live-beat-desc">
          <GlossaryText text={activeBeat.text} />
        </p>

        {/* Beat Sequence Rail (Quick jump to any key moment) */}
        <div className="beat-sequence-rail" role="tablist" aria-label="Play timeline moments">
          {play.beats.map((beat, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSeekBeat(beat.t)}
                className={`rail-beat-chip ${isActive ? 'active' : ''}`}
                title={`Jump to ${beat.title} (${beat.t.toFixed(1)}s)`}
              >
                <span className="chip-time">{beat.t.toFixed(1)}s</span>
                <span className="chip-name">{beat.title}</span>
              </button>
            );
          })}
        </div>

        {activeBeat.focus && activeBeat.focus.length > 0 && (
          <div className="beat-focus-players">
            <span className="focus-label">Key Players in Focus:</span>
            <div className="focus-badges">
              {activeBeat.focus.map((id) => (
                <span key={id} className="player-focus-badge">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: Tactical Scheme Mechanics */}
      {mechanicsSection}

      {/* Full Football Glossary Modal */}
      {showGlossaryModal && <GlossaryModal onClose={() => setShowGlossaryModal(false)} />}
    </aside>
  );
});


