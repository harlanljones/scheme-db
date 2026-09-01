import React from 'react';
import type {
  CoverageScheme,
  CoverageSchemeId,
} from '../engine/coverage';

export interface CoverageSwitcherProps {
  schemes: CoverageScheme[];
  activeSchemeId: CoverageSchemeId;
  onSelect: (id: CoverageSchemeId) => void;
}

/**
 * CoverageVariant switcher: lets the user re-call the defensive coverage against the
 * currently loaded concept. Selecting a scheme re-renders the same offensive play with a
 * derived defense, exposing *why* the concept attacks one coverage and not another.
 */
export const CoverageSwitcher: React.FC<CoverageSwitcherProps> = ({
  schemes,
  activeSchemeId,
  onSelect,
}) => {
  const activeScheme = schemes.find((s) => s.id === activeSchemeId);

  return (
    <div className="coverage-switcher-bar" role="region" aria-label="Defensive Coverage Call Switcher">
      <div className="coverage-switcher-head">
        <span className="coverage-switcher-title">
          <span className="coverage-switcher-icon" aria-hidden="true">⛨</span>
          Defensive Coverage Call
        </span>
        <span className="coverage-switcher-hint">Flip the cover the offense attacks</span>
      </div>

      <div className="coverage-pills" role="tablist" aria-label="Coverage schemes">
        {schemes.map((scheme) => {
          const isActive = scheme.id === activeSchemeId;
          return (
            <button
              key={scheme.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${scheme.name}. ${scheme.description}`}
              title={`${scheme.name} — ${scheme.short}`}
              onClick={() => onSelect(scheme.id)}
              className={`coverage-pill ${isActive ? 'active' : ''}`}
            >
              <span className="coverage-pill-short">{scheme.short}</span>
              <span className="coverage-pill-name">{scheme.name}</span>
            </button>
          );
        })}
      </div>

      {activeScheme && (
        <p className="coverage-scheme-note">
          <span className="coverage-note-tag">{activeScheme.shell.toUpperCase()}</span>
          {activeScheme.description}
        </p>
      )}
    </div>
  );
};
