import React from 'react';
import type { CoachProfile } from '../../engine/types';
import { getSchemeFamilyById } from '../../data/schemes/index';

interface CoachDetailModalProps {
  coach: CoachProfile;
  onClose: () => void;
  onSelectFamily: (familyId: string, view?: 'visualizer' | 'sequence-map') => void;
}

export const CoachDetailModal: React.FC<CoachDetailModalProps> = ({
  coach,
  onClose,
  onSelectFamily,
}) => {
  const isOffense = coach.category === 'offense';
  const hasPlayableScheme = coach.schemeFamilyIds.length > 0;
  const schemeFamily = hasPlayableScheme ? getSchemeFamilyById(coach.schemeFamilyIds[0]) : null;

  // Handle Escape key to dismiss modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'clamp(10px, 2.5vw, 24px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0c1322',
          border: `1px solid ${isOffense ? 'rgba(56, 189, 248, 0.35)' : 'rgba(168, 85, 247, 0.35)'}`,
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 0, 0, 0.5)',
          maxWidth: '680px',
          width: '100%',
          maxHeight: 'calc(100dvh - 32px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 'clamp(16px, 3vw, 28px)',
          gap: '16px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close coach detail modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: '6px',
            lineHeight: 1,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          title="Close modal (Esc)"
        >
          ✕
        </button>

        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: isOffense ? '#0369a1' : '#7e22ce',
                color: '#ffffff',
              }}
            >
              {isOffense ? '⚡ Offensive Lineage' : '🛡 Defensive Lineage'}
            </span>
            {coach.isHeadCoach2026 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                }}
              >
                👑 2026 Head Coach
              </span>
            )}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
              }}
            >
              {coach.team}
            </span>
          </div>

          <h2
            id="coach-modal-title"
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#f8fafc',
              margin: '2px 0 0',
              letterSpacing: '-0.02em',
            }}
          >
            {coach.name}
          </h2>
          <p
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: isOffense ? '#7dd3fc' : '#d8b4fe',
              margin: 0,
            }}
          >
            {coach.role2026}
          </p>
        </div>

        {/* Philosophy Card */}
        <section
          style={{
            backgroundColor: '#070b14',
            padding: '16px 18px',
            borderRadius: '12px',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
            }}
          >
            Core Schematic Philosophy
          </div>
          <p
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.65,
              color: '#cbd5e1',
              margin: 0,
            }}
          >
            {coach.philosophy}
          </p>
        </section>

        {/* Key Concepts */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
            }}
          >
            Signature Playbook Concepts
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {coach.keyConcepts.map((concept, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                }}
              >
                ✦ {concept}
              </span>
            ))}
          </div>
        </section>

        {/* Notable Achievements */}
        {coach.notableAchievements && coach.notableAchievements.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
              }}
            >
              Accolades & Lineage Context
            </div>
            <ul style={{ margin: 0, paddingLeft: '22px', color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.65 }}>
              {coach.notableAchievements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Interactive Playable Scheme Launcher */}
        {hasPlayableScheme ? (
          <section
            style={{
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              borderRadius: '12px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#38bdf8',
                }}
              >
                ⚡ Interactive Playbook Available
              </span>
              <h4 style={{ margin: '3px 0 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800 }}>
                {schemeFamily?.name || coach.schemeFamilyIds[0]}
              </h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={() => {
                  onSelectFamily(coach.schemeFamilyIds[0], 'visualizer');
                  onClose();
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.84rem',
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
                🎬 Launch Field Visualizer
              </button>
              <button
                onClick={() => {
                  onSelectFamily(coach.schemeFamilyIds[0], 'sequence-map');
                  onClose();
                }}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
              >
                🕸 Sequence Map
              </button>
            </div>
          </section>
        ) : (
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#070b14',
              border: '1px dashed #334155',
              fontSize: '0.82rem',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            Scheme play data for {coach.name} scheduled for upcoming library expansion.
          </div>
        )}
      </div>
    </div>
  );
};
