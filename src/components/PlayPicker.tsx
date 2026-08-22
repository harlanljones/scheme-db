import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import type { Play, SchemeFamily } from '../engine/types';

export interface PlayPickerProps {
  families?: SchemeFamily[];
  selectedFamilyId?: string;
  onSelectFamily?: (familyId: string) => void;
  plays: Play[];
  selectedPlayId: string;
  onSelectPlay: (id: string) => void;
  onOpenCatalog?: () => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
}


export interface TreeClusterConfig {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  category: 'offense' | 'defense' | 'hybrid';
}

export const TREE_CLUSTERS: Record<string, TreeClusterConfig> = {
  'shanahan-kubiak': {
    id: 'shanahan-kubiak',
    name: 'Shanahan / Kubiak Lineage',
    badge: 'Wide Zone & Play-Action',
    badgeColor: '#f59e0b',
    category: 'offense',
  },
  'reid-west-coast': {
    id: 'reid-west-coast',
    name: 'Reid / Spread-RPO Lineage',
    badge: 'West Coast & Spread RPO',
    badgeColor: '#38bdf8',
    category: 'offense',
  },
  'power-gap-duo': {
    id: 'power-gap-duo',
    name: 'Power Gap & Duo Lineage',
    badge: 'Power Read & QB Run',
    badgeColor: '#fb923c',
    category: 'offense',
  },
  'carroll-saleh-wide9': {
    id: 'carroll-saleh-wide9',
    name: 'Carroll / Saleh Lineage',
    badge: 'Wide-9 & Press Match',
    badgeColor: '#10b981',
    category: 'defense',
  },
  'macdonald-pressure': {
    id: 'macdonald-pressure',
    name: 'Macdonald Sim-Pressure Lineage',
    badge: 'Sim-Pressure & Amoeba',
    badgeColor: '#a855f7',
    category: 'defense',
  },
  'fangio-two-high': {
    id: 'fangio-two-high',
    name: 'Fangio 2-High Lineage',
    badge: '2-High Shell & Quarters',
    badgeColor: '#06b6d4',
    category: 'defense',
  },
  'belichick-flores': {
    id: 'belichick-flores',
    name: 'Belichick / Flores Blitz Lineage',
    badge: 'Psycho Blitz & Creepers',
    badgeColor: '#ef4444',
    category: 'defense',
  },
  'coryell-vertical': {
    id: 'coryell-vertical',
    name: 'Air Coryell / Run and Shoot Lineage',
    badge: 'Vertical Passing Trees',
    badgeColor: '#f97316',
    category: 'offense',
  },
  'air-raid': {
    id: 'air-raid',
    name: 'Air Raid Lineage',
    badge: 'Mesh & Shallow Spacing',
    badgeColor: '#eab308',
    category: 'offense',
  },
  'option-spread': {
    id: 'option-spread',
    name: 'Option & Spread Revolution',
    badge: 'Triple Option & Zone Read',
    badgeColor: '#84cc16',
    category: 'offense',
  },
  'delaware-wing-t': {
    id: 'delaware-wing-t',
    name: 'Delaware Wing-T Lineage',
    badge: 'Buck Sweep Deception',
    badgeColor: '#a16207',
    category: 'offense',
  },
  'buddy-46': {
    id: 'buddy-46',
    name: 'Buddy Ryan 46 Lineage',
    badge: 'Eight-Man Box Pressure',
    badgeColor: '#dc2626',
    category: 'defense',
  },
  'lebeau-zone-blitz': {
    id: 'lebeau-zone-blitz',
    name: 'LeBeau Zone Blitz Lineage',
    badge: 'Fire Zones & DL Drops',
    badgeColor: '#7c3aed',
    category: 'defense',
  },
  'landry-dallas': {
    id: 'landry-dallas',
    name: 'Landry / Doomsday Front Tree',
    badge: 'Flex & Speed 4-3',
    badgeColor: '#0d9488',
    category: 'defense',
  },
  'phillips-two-gap': {
    id: 'phillips-two-gap',
    name: 'Phillips Two-Gap 3-4 Tree',
    badge: 'Two-Gap Nose & Edges',
    badgeColor: '#2563eb',
    category: 'defense',
  },
  'two-deep-shell': {
    id: 'two-deep-shell',
    name: 'Two-Deep Shell / Tampa 2 Tree',
    badge: 'Cover 2 Sink & 2-Man',
    badgeColor: '#059669',
    category: 'defense',
  },
  'college-defensive-fronts': {
    id: 'college-defensive-fronts',
    name: 'College Hybrid Fronts',
    badge: 'Tite Front & 3-3-5 Stack',
    badgeColor: '#c026d3',
    category: 'defense',
  },
};

export function getClusterForFamily(family: SchemeFamily): TreeClusterConfig {
  const branch = family.treeBranch;
  if (branch && TREE_CLUSTERS[branch]) {
    return TREE_CLUSTERS[branch];
  }
  return {
    id: family.category || 'other',
    name: family.category === 'offense' ? 'Offensive System' : 'Defensive System',
    badge: family.category === 'offense' ? 'Offense' : 'Defense',
    badgeColor: family.category === 'offense' ? '#f59e0b' : '#38bdf8',
    category: family.category || 'hybrid',
  };
}

export const PlayPicker: React.FC<PlayPickerProps> = memo(({
  families = [],
  selectedFamilyId,
  onSelectFamily,
  plays,
  selectedPlayId,
  onSelectPlay,
  onOpenCatalog,
  isTheaterMode = false,
  onToggleTheaterMode,
}) => {

  const [isSchemeMenuOpen, setIsSchemeMenuOpen] = useState(false);
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<'all' | 'offense' | 'defense'>('all');
  const [schemeSearch, setSchemeSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  const currentFamily = families.find((f) => f.id === selectedFamilyId) || families[0];
  const isOffense = currentFamily?.category === 'offense';
  const currentPlayIndex = plays.findIndex((p) => p.id === selectedPlayId);

  // Filtered list of families based on active filter tabs and search query
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      if (schemeCategoryFilter !== 'all' && f.category !== schemeCategoryFilter) return false;
      if (schemeSearch.trim()) {
        const q = schemeSearch.toLowerCase().trim();
        const cluster = getClusterForFamily(f);
        return (
          f.name.toLowerCase().includes(q) ||
          f.coach.toLowerCase().includes(q) ||
          f.team.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          cluster.name.toLowerCase().includes(q) ||
          cluster.badge.toLowerCase().includes(q) ||
          f.plays.some((p) => p.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [families, schemeCategoryFilter, schemeSearch]);

  // Group filtered families into coaching tree clusters
  const groupedClusters = useMemo(() => {
    const clusterOrder = [
      'shanahan-kubiak',
      'reid-west-coast',
      'carroll-saleh-wide9',
      'macdonald-pressure',
      'fangio-two-high',
      'belichick-flores',
    ];

    const map = new Map<string, { config: TreeClusterConfig; families: SchemeFamily[] }>();

    for (const clusterId of clusterOrder) {
      if (TREE_CLUSTERS[clusterId]) {
        map.set(clusterId, { config: TREE_CLUSTERS[clusterId], families: [] });
      }
    }

    for (const family of filteredFamilies) {
      const cluster = getClusterForFamily(family);
      if (!map.has(cluster.id)) {
        map.set(cluster.id, { config: cluster, families: [] });
      }
      map.get(cluster.id)!.families.push(family);
    }

    return Array.from(map.values()).filter((c) => c.families.length > 0);
  }, [filteredFamilies]);

  // Reset or initialize focusedIndex when dropdown opens or filter changes
  useEffect(() => {
    if (isSchemeMenuOpen) {
      const initialIdx = filteredFamilies.findIndex((f) => f.id === selectedFamilyId);
      setFocusedIndex(initialIdx >= 0 ? initialIdx : 0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
    }
  }, [isSchemeMenuOpen, filteredFamilies, selectedFamilyId]);

  // Scroll active item into view when focusedIndex changes
  useEffect(() => {
    if (!isSchemeMenuOpen || filteredFamilies.length === 0) return;
    const activeItem = filteredFamilies[focusedIndex];
    if (!activeItem) return;
    const el = document.getElementById(`scheme-opt-${activeItem.id}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isSchemeMenuOpen, filteredFamilies]);

  // Close dropdown on outside click or global Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSchemeMenuOpen(false);
      }
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSchemeMenuOpen) {
        setIsSchemeMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isSchemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleGlobalKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isSchemeMenuOpen]);

  const selectFamilyAndClose = useCallback(
    (familyId: string) => {
      if (onSelectFamily) onSelectFamily(familyId);
      setIsSchemeMenuOpen(false);
      triggerRef.current?.focus();
    },
    [onSelectFamily]
  );

  // Keyboard navigation within the popover list
  const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
    if (filteredFamilies.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % filteredFamilies.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + filteredFamilies.length) % filteredFamilies.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredFamilies[focusedIndex];
      if (current) {
        selectFamilyAndClose(current.id);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(filteredFamilies.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSchemeMenuOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handlePrevFamily = () => {
    if (!families || families.length === 0 || !onSelectFamily) return;
    const currentIdx = families.findIndex((f) => f.id === selectedFamilyId);
    const prevIdx = (currentIdx - 1 + families.length) % families.length;
    onSelectFamily(families[prevIdx].id);
  };

  const handleNextFamily = () => {
    if (!families || families.length === 0 || !onSelectFamily) return;
    const currentIdx = families.findIndex((f) => f.id === selectedFamilyId);
    const nextIdx = (currentIdx + 1) % families.length;
    onSelectFamily(families[nextIdx].id);
  };

  const handlePrevPlay = () => {
    if (plays.length === 0) return;
    const prevIdx = (currentPlayIndex - 1 + plays.length) % plays.length;
    onSelectPlay(plays[prevIdx].id);
  };

  const handleNextPlay = () => {
    if (plays.length === 0) return;
    const nextIdx = (currentPlayIndex + 1) % plays.length;
    onSelectPlay(plays[nextIdx].id);
  };

  return (
    <div className="playbook-command-bar" role="toolbar" aria-label="Scheme and Play Selector">
      {/* Left: Scheme Family Selector Cluster */}
      <div className="scheme-selector-deck" ref={dropdownRef}>
        <div className="scheme-stepper-wrap">
          <button
            type="button"
            onClick={handlePrevFamily}
            className="scheme-nav-arrow"
            aria-label="Previous Scheme System"
            title="Previous Scheme System (Shift+[)"
          >
            ‹
          </button>

          <button
            ref={triggerRef}
            type="button"
            className={`scheme-select-trigger ${isSchemeMenuOpen ? 'open' : ''}`}
            onClick={() => setIsSchemeMenuOpen(!isSchemeMenuOpen)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsSchemeMenuOpen(true);
              }
            }}
            aria-haspopup="dialog"
            aria-expanded={isSchemeMenuOpen}
            aria-controls="scheme-picker-popover-dropdown"
          >
            <span
              className="scheme-pill-indicator"
              style={{
                backgroundColor: isOffense ? 'var(--accent-offense)' : 'var(--accent-defense)',
              }}
              aria-hidden="true"
            />
            <div className="scheme-select-info">
              <span className="scheme-select-coach">{currentFamily?.coach}</span>
              <span className="scheme-select-name">{currentFamily?.name}</span>
            </div>
            <span className="scheme-select-badge">
              {currentFamily?.plays.length} PLAYS
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextFamily}
            className="scheme-nav-arrow"
            aria-label="Next Scheme System"
            title="Next Scheme System (Shift+])"
          >
            ›
          </button>
        </div>

        {/* Searchable Scheme Popover with Tree Clusters & Full Keyboard Accessibility */}
        {isSchemeMenuOpen && (
          <div
            id="scheme-picker-popover-dropdown"
            className="scheme-picker-popover"
            role="dialog"
            aria-label="Choose Scheme System"
            onKeyDown={handlePopoverKeyDown}
          >
            <div className="scheme-popover-top">
              <div className="scheme-popover-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Filter ${families.length} schemes, coaches, or tree branches...`}
                  value={schemeSearch}
                  onChange={(e) => setSchemeSearch(e.target.value)}
                  aria-label="Search scheme families"
                  aria-autocomplete="list"
                  aria-controls="scheme-popover-list"
                />
                {schemeSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setSchemeSearch('');
                      searchInputRef.current?.focus();
                    }}
                    className="clear-btn"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="scheme-filter-tabs" role="tablist" aria-label="Filter schemes by side">
                <button
                  type="button"
                  role="tab"
                  aria-selected={schemeCategoryFilter === 'all'}
                  onClick={() => setSchemeCategoryFilter('all')}
                  className={`scheme-filter-btn ${schemeCategoryFilter === 'all' ? 'active' : ''}`}
                >
                  All ({families.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={schemeCategoryFilter === 'offense'}
                  onClick={() => setSchemeCategoryFilter('offense')}
                  className={`scheme-filter-btn offense ${schemeCategoryFilter === 'offense' ? 'active' : ''}`}
                >
                  Offense ({families.filter((f) => f.category === 'offense').length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={schemeCategoryFilter === 'defense'}
                  onClick={() => setSchemeCategoryFilter('defense')}
                  className={`scheme-filter-btn defense ${schemeCategoryFilter === 'defense' ? 'active' : ''}`}
                >
                  Defense ({families.filter((f) => f.category === 'defense').length})
                </button>
              </div>
            </div>

            <div
              id="scheme-popover-list"
              className="scheme-popover-items custom-scrollbar"
              ref={itemsContainerRef}
              role="listbox"
              aria-label="Scheme Systems by Coaching Tree"
            >
              {groupedClusters.map((cluster) => {
                return (
                  <div key={cluster.config.id} className="scheme-cluster-group" role="group" aria-label={cluster.config.name}>
                    {/* Cluster Category Header & Lineage Badge */}
                    <div className="scheme-cluster-header">
                      <div className="scheme-cluster-title-wrap">
                        <span className="scheme-cluster-title">{cluster.config.name}</span>
                        <span
                          className="scheme-tree-badge"
                          style={{
                            borderColor: cluster.config.badgeColor,
                            color: cluster.config.badgeColor,
                          }}
                        >
                          {cluster.config.badge}
                        </span>
                      </div>
                      <span className="scheme-cluster-count">
                        {cluster.families.length} {cluster.families.length === 1 ? 'scheme' : 'schemes'}
                      </span>
                    </div>

                    {/* Cluster Schemes List */}
                    <div className="scheme-cluster-items">
                      {cluster.families.map((family) => {
                        const isFamilyActive = family.id === selectedFamilyId;
                        const isFamOff = family.category === 'offense';
                        const flatIdx = filteredFamilies.findIndex((f) => f.id === family.id);
                        const isKeyboardFocused = flatIdx === focusedIndex;

                        return (
                          <button
                            key={family.id}
                            id={`scheme-opt-${family.id}`}
                            type="button"
                            role="option"
                            aria-selected={isFamilyActive}
                            className={`scheme-popover-item ${isFamilyActive ? 'active' : ''} ${
                              isKeyboardFocused ? 'keyboard-active' : ''
                            }`}
                            onClick={() => selectFamilyAndClose(family.id)}
                            onMouseEnter={() => setFocusedIndex(flatIdx)}
                          >
                            <span
                              className="scheme-item-dot"
                              style={{
                                backgroundColor: isFamOff ? 'var(--accent-offense)' : 'var(--accent-defense)',
                              }}
                              aria-hidden="true"
                            />
                            <div className="scheme-item-text">
                              <div className="scheme-item-title">
                                <strong>{family.coach}</strong>
                                <span className="scheme-item-sub"> — {family.name}</span>
                              </div>
                              <div className="scheme-item-desc">{family.description}</div>
                            </div>
                            <span className="scheme-item-count">{family.plays.length} plays</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredFamilies.length === 0 && (
                <div className="scheme-popover-empty" role="status">
                  No scheme systems match "{schemeSearch}". Try a coach's name, tree branch, or play name.
                </div>
              )}
            </div>

            {onOpenCatalog && (
              <div className="scheme-popover-footer">
                <button
                  type="button"
                  className="open-catalog-link"
                  onClick={() => {
                    setIsSchemeMenuOpen(false);
                    onOpenCatalog();
                  }}
                >
                  View Full {families.length}-System Scheme Catalog →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Scheme Plays Segmented Tabs */}
      <div className="plays-segmented-bar" role="tablist" aria-label="Plays in active scheme">
        <div className="plays-stepper-wrap">
          <button
            type="button"
            onClick={handlePrevPlay}
            className="scheme-nav-arrow"
            aria-label="Previous Play"
            title="Previous Play ([)"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextPlay}
            className="scheme-nav-arrow"
            aria-label="Next Play"
            title="Next Play (])"
          >
            ›
          </button>
        </div>

        <div className="plays-tabs-list custom-scrollbar">
          {plays.map((play, idx) => {
            const isSelected = play.id === selectedPlayId;
            return (
              <button
                key={play.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectPlay(play.id)}
                className={`play-tab-pill ${isSelected ? 'active' : ''}`}
              >
                <span className="play-tab-num">{idx + 1}</span>
                <span className="play-tab-name">{play.name}</span>
                <span className="play-tab-duration">{play.duration.toFixed(1)}s</span>
              </button>
            );
          })}
        </div>

        {onToggleTheaterMode && (
          <button
            type="button"
            onClick={onToggleTheaterMode}
            aria-pressed={isTheaterMode}
            aria-label={isTheaterMode ? 'Exit Full-Field Theater Mode (T)' : 'Enter Full-Field Theater Mode (T)'}
            title={isTheaterMode ? 'Exit Full-Field Theater Mode [T / F]' : 'Full-Field Theater Mode [T / F]'}
            className={`theater-toggle-btn ${isTheaterMode ? 'active' : ''}`}
          >
            {isTheaterMode ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
            <span className="theater-btn-text">{isTheaterMode ? 'Exit Theater' : 'Theater Mode'}</span>
            <kbd className="theater-kbd">T</kbd>
          </button>
        )}
      </div>
    </div>
  );
});

