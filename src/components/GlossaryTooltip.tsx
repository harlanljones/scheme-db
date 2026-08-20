import React, { useState, useRef, useEffect } from 'react';
import { FOOTBALL_GLOSSARY, findGlossaryTerm, type GlossaryEntry } from '../data/glossary';

interface GlossaryCueProps {
  term: GlossaryEntry;
  children: React.ReactNode;
}

export const GlossaryCue: React.FC<GlossaryCueProps> = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320;
    const popoverHeight = 180;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    // Boundary check horizontal
    if (left < 10) left = 10;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = window.innerWidth - popoverWidth - 10;
    }

    let top = rect.top - popoverHeight - 8;
    let placement: 'top' | 'bottom' = 'top';

    // If clipping off top of screen, place below
    if (top < 10) {
      top = rect.bottom + 8;
      placement = 'bottom';
    }

    setPopoverPos({ top, left, placement });
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    calculatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculatePosition();
    setIsOpen((prev) => !prev);
  };

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getCategoryColor = (cat: GlossaryEntry['category']) => {
    switch (cat) {
      case 'Blocking Scheme':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' };
      case 'Run Concept':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' };
      case 'Pass Concept':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#7dd3fc', border: 'rgba(56, 189, 248, 0.35)' };
      case 'Defensive Front':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.35)' };
      case 'Coverage & Shell':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.35)' };
      case 'Read & Assignment':
        return { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.35)' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
    }
  };

  const catStyle = getCategoryColor(term.category);

  return (
    <span className="glossary-cue-wrapper" style={{ position: 'relative', display: 'inline' }}>
      <button
        ref={triggerRef}
        type="button"
        className="glossary-term-trigger"
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-expanded={isOpen}
        aria-label={`Football glossary term: ${term.term}. Click for definition.`}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
          cursor: 'help',
          textDecoration: 'underline dotted var(--accent-defense)',
          textUnderlineOffset: '3px',
          fontWeight: 600,
          transition: 'color 0.15s ease, text-decoration-color 0.15s ease',
        }}
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Definition of ${term.term}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: '320px',
            maxWidth: '92vw',
            backgroundColor: '#0b1322',
            border: '1px solid #223554',
            borderRadius: '8px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.85), 0 0 1px rgba(56, 189, 248, 0.5)',
            padding: '12px 14px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.12s ease-out',
            textAlign: 'left',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem' }} aria-hidden="true">📖</span>
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {term.term}
              </h4>
            </div>

            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: '3px',
                backgroundColor: catStyle.bg,
                color: catStyle.text,
                border: `1px solid ${catStyle.border}`,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {term.category}
            </span>
          </div>

          {/* Definition */}
          <p
            style={{
              margin: 0,
              fontSize: '0.76rem',
              color: '#cbd5e1',
              lineHeight: 1.45,
            }}
          >
            {term.shortDef}
          </p>

          {/* Tactical Note Box */}
          {term.tacticalNote && (
            <div
              style={{
                backgroundColor: '#070b14',
                border: '1px solid #1a2744',
                borderRadius: '4px',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#38bdf8',
                }}
              >
                Tactical Film Context
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  lineHeight: 1.35,
                }}
              >
                {term.tacticalNote}
              </p>
            </div>
          )}

          {/* Footer note */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '4px',
              borderTop: '1px solid #142036',
              fontSize: '0.62rem',
              color: '#64748b',
            }}
          >
            <span>NFL SchemeDB Glossary</span>
            <span>Press Esc to close</span>
          </div>
        </div>
      )}
    </span>
  );
};

/**
 * Text renderer that scans a text string and decorates occurrences of domain terms
 * with interactive glossary cue triggers and popovers.
 */
export const GlossaryText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Build sorted list of search patterns (longest first to avoid partial substring collisions)
  const sortedEntries: { matchText: string; entry: GlossaryEntry }[] = [];
  FOOTBALL_GLOSSARY.forEach((entry) => {
    sortedEntries.push({ matchText: entry.term, entry });
    entry.aliases.forEach((alias) => {
      sortedEntries.push({ matchText: alias, entry });
    });
  });

  // Sort descending by length
  sortedEntries.sort((a, b) => b.matchText.length - a.matchText.length);

  // Build regex pattern matching all terms as whole words where possible
  // Escape regex special chars
  const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(
    `\\b(${sortedEntries.map((e) => escapeRegex(e.matchText)).join('|')})\\b`,
    'gi'
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Track already matched ranges in this text block to avoid duplicate overlaps
  while ((match = pattern.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = pattern.lastIndex;
    const matchedStr = match[0];

    // Push text preceding this match
    if (matchStart > lastIndex) {
      parts.push(text.substring(lastIndex, matchStart));
    }

    const entry = findGlossaryTerm(matchedStr);
    if (entry) {
      parts.push(
        <GlossaryCue key={`glossary-${matchStart}-${matchedStr}`} term={entry}>
          {matchedStr}
        </GlossaryCue>
      );
    } else {
      parts.push(matchedStr);
    }

    lastIndex = matchEnd;
  }

  // Push remaining trailing text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

/**
 * Modal dialogue to browse all terms in the football glossary
 */
export const GlossaryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Blocking Scheme',
    'Run Concept',
    'Pass Concept',
    'Defensive Front',
    'Coverage & Shell',
    'Read & Assignment',
  ];

  const filtered = FOOTBALL_GLOSSARY.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.term.toLowerCase().includes(q) ||
      item.aliases.some((a) => a.toLowerCase().includes(q)) ||
      item.shortDef.toLowerCase().includes(q) ||
      item.tacticalNote.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="guide-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
    >
      <div
        className="guide-modal-card"
        style={{ width: '680px', maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guide-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }} aria-hidden="true">📖</span>
              <h2 id="glossary-modal-title" className="guide-modal-title">
                NFL Scheme & Film Room Glossary
              </h2>
            </div>
            <p className="guide-modal-subtitle">
              Comprehensive dictionary of offensive and defensive concepts, run fits, coverages, and blocking mechanics
            </p>
          </div>
          <button
            onClick={onClose}
            className="guide-modal-close"
            aria-label="Close glossary modal"
          >
            ✕
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#070b14',
            borderBottom: '1px solid #142036',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Search football terminology, concepts, techniques..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search glossary"
            style={{
              width: '100%',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              color: '#f8fafc',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? '#0284c7' : '#0f172a',
                  color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                  border: selectedCategory === cat ? '1px solid #38bdf8' : '1px solid #1e293b',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {cat === 'all' ? 'All Terms' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Term Cards List */}
        <div className="guide-modal-body" style={{ gap: '10px' }}>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#080d1a',
                  border: '1px solid #1a2942',
                  borderRadius: '7px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc' }}>
                    {item.term}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {item.shortDef}
                </p>

                {item.tacticalNote && (
                  <div
                    style={{
                      backgroundColor: '#04070e',
                      border: '1px solid #1e293b',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      lineHeight: 1.35,
                    }}
                  >
                    <strong style={{ color: '#fbbf24', fontSize: '0.64rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                      Tactical Film Room Context:
                    </strong>
                    {item.tacticalNote}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              No glossary terms found matching "{search}"
            </div>
          )}
        </div>

        <div className="guide-modal-footer">
          <button onClick={onClose} className="guide-modal-done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
