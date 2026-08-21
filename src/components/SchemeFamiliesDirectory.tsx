import React, { useState, useMemo, memo } from 'react';
import type { SchemeFamily } from '../engine/types';
import { ALL_SCHEME_FAMILIES } from '../data/schemes/index';
import { getCoachById, ALL_COACHES } from '../data/coaches/index';

interface SchemeFamiliesDirectoryProps {
  onSelectFamily: (familyId: string, view?: 'visualizer' | 'sequence-map') => void;
  onSelectPlay?: (familyId: string, playId: string) => void;
}

type DirectoryViewMode = 'matrix' | 'split' | 'cards';

export const SchemeFamiliesDirectory: React.FC<SchemeFamiliesDirectoryProps> = memo(({
  onSelectFamily,
  onSelectPlay,
}) => {

  const [filterCategory, setFilterCategory] = useState<'all' | 'offense' | 'defense'>('all');
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<DirectoryViewMode>('matrix');
  const [activeSplitFamilyId, setActiveSplitFamilyId] = useState<string>(ALL_SCHEME_FAMILIES[0].id);

  const filteredFamilies = useMemo(() => {
    return ALL_SCHEME_FAMILIES.filter((family) => {
      if (filterCategory !== 'all' && family.category !== filterCategory) return false;
      if (selectedCoachFilter !== 'all' && family.coachId !== selectedCoachFilter && family.id !== selectedCoachFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = family.name.toLowerCase().includes(q);
        const matchesCoach = family.coach.toLowerCase().includes(q);
        const matchesDesc = family.description.toLowerCase().includes(q);
        const matchesPlays = family.plays.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.personnel.toLowerCase().includes(q) ||
            p.coverage.toLowerCase().includes(q) ||
            p.summary.keyDefender.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCoach && !matchesDesc && !matchesPlays) return false;
      }
      return true;
    });
  }, [filterCategory, selectedCoachFilter, searchQuery]);

  const activeSplitFamily = useMemo(() => {
    return (
      filteredFamilies.find((f) => f.id === activeSplitFamilyId) ||
      filteredFamilies[0] ||
      ALL_SCHEME_FAMILIES[0]
    );
  }, [filteredFamilies, activeSplitFamilyId]);

  const handlePlayClick = (familyId: string, playId: string) => {
    if (onSelectPlay) {
      onSelectPlay(familyId, playId);
    } else {
      onSelectFamily(familyId, 'visualizer');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: '6px',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Compact Master Control Bar (Integrated Header & Fast Filters) */}
      <div
        style={{
          backgroundColor: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '7px',
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          flexShrink: 0,
          minHeight: '40px',
        }}
      >
        {/* Left: Title + Counter + Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              Scheme Catalog
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                padding: '1px 6px',
                borderRadius: '9999px',
                border: '1px solid #334155',
                whiteSpace: 'nowrap',
              }}
            >
              {filteredFamilies.length} Schemes ({filteredFamilies.reduce((acc, f) => acc + f.plays.length, 0)} Plays)
            </span>
          </div>

          <div
            role="group"
            aria-label="Scheme Category Tabs"
            style={{
              display: 'flex',
              backgroundColor: '#070b14',
              border: '1px solid #1e293b',
              borderRadius: '5px',
              padding: '1px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setFilterCategory('all');
                setSelectedCoachFilter('all');
              }}
              aria-pressed={filterCategory === 'all' && selectedCoachFilter === 'all'}
              style={{
                backgroundColor: filterCategory === 'all' && selectedCoachFilter === 'all' ? '#0284c7' : 'transparent',
                color: filterCategory === 'all' && selectedCoachFilter === 'all' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              All (20)
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory('offense');
                setSelectedCoachFilter('all');
              }}
              aria-pressed={filterCategory === 'offense' && selectedCoachFilter === 'all'}
              style={{
                backgroundColor: filterCategory === 'offense' && selectedCoachFilter === 'all' ? '#0284c7' : 'transparent',
                color: filterCategory === 'offense' && selectedCoachFilter === 'all' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              ⚡ Offense (10)
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterCategory('defense');
                setSelectedCoachFilter('all');
              }}
              aria-pressed={filterCategory === 'defense' && selectedCoachFilter === 'all'}
              style={{
                backgroundColor: filterCategory === 'defense' && selectedCoachFilter === 'all' ? '#7c3aed' : 'transparent',
                color: filterCategory === 'defense' && selectedCoachFilter === 'all' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              🛡 Defense (10)
            </button>
          </div>
        </div>

        {/* Right: Architect Filter Dropdown + Search Input + View Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Architect Filter Dropdown */}
          <select
            value={selectedCoachFilter}
            onChange={(e) => setSelectedCoachFilter(e.target.value)}
            aria-label="Filter by Coach or Architect"
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '5px',
              padding: '3px 6px',
              fontSize: '0.7rem',
              color: '#cbd5e1',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '140px',
            }}
          >
            <option value="all">All Architects ({ALL_SCHEME_FAMILIES.length})</option>
            {ALL_COACHES.filter((c) => c.schemeFamilyIds.length > 0).map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name} ({coach.team})
              </option>
            ))}
          </select>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '160px' }}>
            <input
              type="text"
              aria-label="Search schemes or plays"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '5px',
                padding: '3px 20px 3px 6px',
                fontSize: '0.7rem',
                color: '#f8fafc',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* View Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Directory Layout Modes"
            style={{
              display: 'flex',
              backgroundColor: '#070b14',
              border: '1px solid #1e293b',
              borderRadius: '5px',
              padding: '1px',
              gap: '1px',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'matrix'}
              onClick={() => setViewMode('matrix')}
              style={{
                backgroundColor: viewMode === 'matrix' ? '#1e293b' : 'transparent',
                color: viewMode === 'matrix' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                padding: '3px 7px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Compact Matrix Table (Fits 100% on screen, no scroll)"
            >
              Matrix
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'split'}
              onClick={() => setViewMode('split')}
              style={{
                backgroundColor: viewMode === 'split' ? '#1e293b' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                padding: '3px 7px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Split Inspector View"
            >
              Split
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'cards'}
              onClick={() => setViewMode('cards')}
              style={{
                backgroundColor: viewMode === 'cards' ? '#1e293b' : 'transparent',
                color: viewMode === 'cards' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                padding: '3px 7px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Detailed Cards View"
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        {/* Empty State */}
        {filteredFamilies.length === 0 && (
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a101d',
              border: '1px solid #1e293b',
              borderRadius: '7px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 16px',
              textAlign: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              🔍
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                No schemes or plays match your filter
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', maxWidth: '440px' }}>
                {searchQuery
                  ? `No results for "${searchQuery}". Try searching for another coach, concept (e.g. "Wide Zone", "Sim Pressure"), or clear your filters.`
                  : 'No schemes match the current category and coach filters.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setSelectedCoachFilter('all');
              }}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* MODE 1: MASTER MATRIX TABLE (ZERO-SCROLL 100% SCREEN FIT WITH MOBILE HORIZONTAL PAN) */}
        {filteredFamilies.length > 0 && viewMode === 'matrix' && (
          <div className="directory-matrix-container">
            <div className="directory-matrix-table-wrap custom-scrollbar">
              <table
                style={{
                  width: '100%',
                  minWidth: '680px',
                  height: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  fontSize: '0.7rem',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#070b14',
                      borderBottom: '1px solid #1e293b',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      fontSize: '0.62rem',
                      letterSpacing: '0.04em',
                      height: '24px',
                    }}
                  >
                    <th style={{ padding: '2px 8px', width: '20%' }}>System & Architect</th>
                    <th style={{ padding: '2px 8px', width: '18%' }}>Base Foundation</th>
                    <th style={{ padding: '2px 8px', width: '18%' }}>Shot / Counter #1</th>
                    <th style={{ padding: '2px 8px', width: '18%' }}>Boot / Counter #2</th>
                    <th style={{ padding: '2px 8px', width: '18%' }}>Motion / Pressure #3</th>
                    <th style={{ padding: '2px 6px', width: '8%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ height: 'calc(100% - 24px)' }}>
                  {filteredFamilies.map((family) => {
                    const isOffense = family.category === 'offense';
                    return (
                      <tr
                        key={family.id}
                        style={{
                          borderBottom: '1px solid #121c2e',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f182b')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Architect & System */}
                        <td style={{ padding: '1px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
                            <span
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: isOffense ? '#f59e0b' : '#38bdf8',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                              <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.72rem' }}>
                                {family.coach}
                              </span>
                              <span style={{ fontSize: '0.64rem', color: '#7e8e9f', marginLeft: '5px' }}>
                                {family.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4 Plays */}
                        {family.plays.map((p, idx) => {
                          const isBase = idx === 0;
                          const tooltipText = `${p.name} | Personnel: ${p.personnel} | Coverage: ${p.coverage} | Read: ${p.summary.keyDefender} | Motive: ${p.summary.motive}`;
                          return (
                            <td key={p.id} style={{ padding: '1px 6px', overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => handlePlayClick(family.id, p.id)}
                                title={tooltipText}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: isBase ? '#06281e' : '#070c16',
                                  border: isBase ? '1px solid #059669' : '1px solid #1e293b',
                                  borderRadius: '4px',
                                  padding: '1px 5px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.12s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = isBase ? '#0a3d2e' : '#142036';
                                  e.currentTarget.style.borderColor = isBase ? '#34d399' : '#38bdf8';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = isBase ? '#06281e' : '#070c16';
                                  e.currentTarget.style.borderColor = isBase ? '#059669' : '#1e293b';
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.58rem',
                                    fontWeight: 800,
                                    color: isBase ? '#34d399' : '#f472b6',
                                    flexShrink: 0,
                                  }}
                                >
                                  {isBase ? '★' : `#${idx}`}
                                </span>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: isBase ? '#e6fffa' : '#cbd5e1',
                                    fontSize: '0.66rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  {p.name}
                                </span>
                              </button>
                            </td>
                          );
                        })}

                        {/* Actions */}
                        <td style={{ padding: '1px 6px', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => onSelectFamily(family.id, 'visualizer')}
                              style={{
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '3px',
                                padding: '2px 5px',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Load system into Film Room Visualizer"
                            >
                              Film ▶
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectFamily(family.id, 'sequence-map')}
                              style={{
                                backgroundColor: '#1e293b',
                                color: '#cbd5e1',
                                border: '1px solid #334155',
                                borderRadius: '3px',
                                padding: '2px 5px',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Open Sequence Matrix"
                            >
                              Seq
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODE 2: SPLIT VIEW INSPECTOR */}
        {filteredFamilies.length > 0 && viewMode === 'split' && (
          <div className="directory-split-container">
            {/* Left Rail: System Selector */}
            <div
              className="custom-scrollbar"
              style={{
                backgroundColor: '#0a101d',
                border: '1px solid #1e293b',
                borderRadius: '7px',
                padding: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {filteredFamilies.map((fam) => {
                const isSelected = fam.id === activeSplitFamily.id;
                const isFamOff = fam.category === 'offense';
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => setActiveSplitFamilyId(fam.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '5px',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid transparent',
                      backgroundColor: isSelected ? '#101c36' : 'transparent',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                      width: '100%',
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.74rem' }}>{fam.coach}</div>
                      <div style={{ fontSize: '0.64rem', color: isSelected ? '#7dd3fc' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fam.name}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        padding: '1px 4px',
                        borderRadius: '3px',
                        backgroundColor: isFamOff ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        color: isFamOff ? '#fbbf24' : '#38bdf8',
                        flexShrink: 0,
                        marginLeft: '4px',
                      }}
                    >
                      {fam.plays.length}P
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Panel: Active System Playbook Inspector */}
            <div
              className="custom-scrollbar"
              style={{
                backgroundColor: '#0a101d',
                border: '1px solid #1e293b',
                borderRadius: '7px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid #152238', paddingBottom: '6px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {activeSplitFamily.coach} // {activeSplitFamily.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                    {activeSplitFamily.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="button"
                    onClick={() => onSelectFamily(activeSplitFamily.id, 'visualizer')}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🎬 Launch Visualizer
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectFamily(activeSplitFamily.id, 'sequence-map')}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      borderRadius: '5px',
                      padding: '5px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🕸 Sequence Matrix
                  </button>
                </div>
              </div>

              {/* 4 Sequenced Plays Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '6px' }}>
                {activeSplitFamily.plays.map((play, idx) => {
                  const isBase = idx === 0;
                  return (
                    <div
                      key={play.id}
                      onClick={() => handlePlayClick(activeSplitFamily.id, play.id)}
                      style={{
                        backgroundColor: '#070c16',
                        border: isBase ? '1px solid #059669' : '1px solid #1e293b',
                        borderRadius: '6px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = isBase ? '#34d399' : '#38bdf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = isBase ? '#059669' : '#1e293b')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: isBase ? '#34d399' : '#f472b6', textTransform: 'uppercase' }}>
                          {isBase ? '★ Base Foundation' : `↳ Counter #${idx}`}
                        </span>
                        <span style={{ fontSize: '0.58rem', color: '#f87171', fontWeight: 700 }}>
                          Read: {play.summary.keyDefender}
                        </span>
                      </div>
                      <h4 style={{ margin: '1px 0', fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                        {play.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        {play.summary.motive}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: DETAILED CARDS VIEW */}
        {filteredFamilies.length > 0 && viewMode === 'cards' && (
          <div
            className="custom-scrollbar"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
              gap: '10px',
              paddingRight: '2px',
              width: '100%',
            }}
          >
            {filteredFamilies.map((family: SchemeFamily) => {
              const isOffense = family.category === 'offense';
              const coach = family.coachId ? getCoachById(family.coachId) : undefined;

              return (
                <div
                  key={family.id}
                  style={{
                    backgroundColor: '#0a101d',
                    border: `1px solid ${isOffense ? 'rgba(56, 189, 248, 0.25)' : 'rgba(168, 85, 247, 0.25)'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          backgroundColor: isOffense ? '#0369a1' : '#7e22ce',
                          color: '#ffffff',
                        }}
                      >
                        {isOffense ? '⚡ Offense' : '🛡 Defense'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600 }}>{family.team}</span>
                    </div>

                    <div>
                      <h3 style={{ margin: '0 0 2px', fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                        {family.name}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: isOffense ? '#38bdf8' : '#c084fc', fontWeight: 700 }}>
                        Architect: {family.coach} {coach?.role2026 && `• ${coach.role2026}`}
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35 }}>
                      {family.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {family.plays.map((play, idx) => (
                        <div
                          key={play.id}
                          onClick={() => handlePlayClick(family.id, play.id)}
                          style={{
                            backgroundColor: '#0f172a',
                            border: idx === 0 ? '1px solid #059669' : '1px solid #1e293b',
                            borderRadius: '4px',
                            padding: '3px 5px',
                            fontSize: '0.66rem',
                            cursor: 'pointer',
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{ fontWeight: 700, color: idx === 0 ? '#34d399' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {play.name}
                          </div>
                          <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{play.personnel}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '5px', paddingTop: '5px', borderTop: '1px solid #1e293b' }}>
                    <button
                      type="button"
                      onClick={() => onSelectFamily(family.id, 'visualizer')}
                      style={{
                        flex: 1,
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Film Room ▶
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectFamily(family.id, 'sequence-map')}
                      style={{
                        flex: 1,
                        backgroundColor: '#1e293b',
                        color: '#cbd5e1',
                        border: '1px solid #334155',
                        borderRadius: '5px',
                        padding: '5px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Sequence Matrix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});


