import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { ALL_SCHEME_FAMILIES, ALL_PLAYS, getSchemeFamilyById } from './data/schemes/index';
import { usePlayback } from './engine/playback';
import {
  COVERAGE_SCHEMES,
  DEFAULT_COVERAGE_SCHEME,
  supportsCoverageVariant,
  buildCoverageVariant,
  type CoverageSchemeId,
} from './engine/coverage';
import { PlayCanvas } from './components/PlayCanvas';
import { Timeline } from './components/Timeline';
import { AnalysisPanel } from './components/AnalysisPanel';
import { PlayPicker } from './components/PlayPicker';
import { CoverageSwitcher } from './components/CoverageSwitcher';
import './App.css';

// Lazy-loaded secondary views for optimized initial bundle & rapid first paint
const SchemeFamiliesDirectory = lazy(() =>
  import('./components/SchemeFamiliesDirectory').then((m) => ({ default: m.SchemeFamiliesDirectory }))
);
const CoachingTreeGraph = lazy(() =>
  import('./components/coaching-tree/CoachingTreeGraph').then((m) => ({ default: m.CoachingTreeGraph }))
);
const SequenceMap = lazy(() =>
  import('./components/SequenceMap').then((m) => ({ default: m.SequenceMap }))
);
const PlayComparison = lazy(() =>
  import('./components/PlayComparison').then((m) => ({ default: m.PlayComparison }))
);

const ViewLoadingSkeleton: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      flex: 1,
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      gap: '12px',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8rem',
    }}
  >
    <div
      style={{
        width: '24px',
        height: '24px',
        border: '2px solid var(--border-medium)',
        borderTopColor: 'var(--accent-defense)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span>Loading {label}...</span>
  </div>
);


export type ActiveTab = 'visualizer' | 'directory' | 'trees' | 'sequence-map' | 'compare';

function parseInitialUrlState(): { tab: ActiveTab; familyId: string; playId: string } {
  if (typeof window === 'undefined') {
    return { tab: 'visualizer', familyId: 'shanahan-wide-zone', playId: 'outside-zone' };
  }
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  const validTabs: ActiveTab[] = ['visualizer', 'directory', 'trees', 'sequence-map', 'compare'];
  const tab: ActiveTab = validTabs.includes(tabParam as ActiveTab) ? (tabParam as ActiveTab) : 'visualizer';

  const playParam = params.get('play');
  const schemeParam = params.get('scheme');

  let familyId = 'shanahan-wide-zone';
  let playId = 'outside-zone';

  if (playParam) {
    const play = ALL_PLAYS.find((p) => p.id === playParam);
    if (play) {
      playId = play.id;
      const family = ALL_SCHEME_FAMILIES.find((f) => f.plays.some((p) => p.id === play.id));
      if (family) {
        familyId = family.id;
      }
    }
  } else if (schemeParam) {
    const family = ALL_SCHEME_FAMILIES.find((f) => f.id === schemeParam);
    if (family) {
      familyId = family.id;
      playId = family.plays[0]?.id || playId;
    }
  }

  return { tab, familyId, playId };
}

export const App: React.FC = () => {
  const initialUrlState = useMemo(() => parseInitialUrlState(), []);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(initialUrlState.familyId);
  const [selectedPlayId, setSelectedPlayId] = useState<string>(initialUrlState.playId);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialUrlState.tab);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [coverageScheme, setCoverageScheme] = useState<CoverageSchemeId>(DEFAULT_COVERAGE_SCHEME);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(() => {
    return localStorage.getItem('nfl-scheme-welcome-dismissed') !== 'true';
  });

  // Sync state with URL query parameters for deep linking & LLM search citations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (activeTab !== 'visualizer') {
      params.set('tab', activeTab);
    }
    if (selectedFamilyId !== 'shanahan-wide-zone' || selectedPlayId !== 'outside-zone' || activeTab === 'visualizer') {
      params.set('scheme', selectedFamilyId);
      params.set('play', selectedPlayId);
    }
    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    if (window.location.search !== (queryString ? `?${queryString}` : '')) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeTab, selectedFamilyId, selectedPlayId]);

  const currentFamily = useMemo(() => {
    return getSchemeFamilyById(selectedFamilyId);
  }, [selectedFamilyId]);

  const selectedPlay = useMemo(() => {
    return (
      currentFamily.plays.find((p) => p.id === selectedPlayId) ||
      currentFamily.plays[0]
    );
  }, [currentFamily, selectedPlayId]);

  // The default coverage pill maps back to the author's defensively-rendered play (the
  // canonical "why it works" mesh). Any other selection re-calls the defense against the
  // same concept via the coverage engine.
  const renderPlay = useMemo(() => {
    if (currentFamily.category !== 'offense' || !supportsCoverageVariant(selectedPlay)) {
      return selectedPlay;
    }
    if (coverageScheme === DEFAULT_COVERAGE_SCHEME) {
      return selectedPlay;
    }
    return buildCoverageVariant(selectedPlay, coverageScheme);
  }, [currentFamily.category, selectedPlay, coverageScheme]);

  const showCoverageSwitcher = useMemo(() => {
    return currentFamily.category === 'offense' && supportsCoverageVariant(selectedPlay);
  }, [currentFamily.category, selectedPlay]);

  // Default comparison partner: prefer the constraint play this call mimics/borrows from,
  // otherwise the next play in the same scheme.
  const comparisonPlayB = useMemo(() => {
    const constraintId = selectedPlay.sequence?.playsOff?.[0];
    const constraint = constraintId ? ALL_PLAYS.find((p) => p.id === constraintId) : undefined;
    if (constraint && constraint.id !== selectedPlay.id) {
      return constraint;
    }
    const idx = currentFamily.plays.findIndex((p) => p.id === selectedPlay.id);
    return currentFamily.plays[(idx + 1) % currentFamily.plays.length] ?? selectedPlay;
  }, [selectedPlay, currentFamily.plays]);

  const playback = usePlayback(selectedPlay.duration);

  const handleSelectFamily = useCallback((familyId: string, targetView?: 'visualizer' | 'sequence-map') => {
    setSelectedFamilyId(familyId);
    const targetFamily = getSchemeFamilyById(familyId);
    setSelectedPlayId(targetFamily.plays[0].id);
    setCoverageScheme(DEFAULT_COVERAGE_SCHEME);
    playback.reset();
    if (targetView) {
      setActiveTab(targetView);
    }
  }, [playback]);

  const handleSelectPlay = useCallback((id: string) => {
    setSelectedPlayId(id);
    setCoverageScheme(DEFAULT_COVERAGE_SCHEME);
    playback.reset();
  }, [playback]);

  const handleSelectPlayFromDirectory = useCallback((familyId: string, playId: string) => {
    setSelectedFamilyId(familyId);
    setSelectedPlayId(playId);
    setCoverageScheme(DEFAULT_COVERAGE_SCHEME);
    playback.reset();
    setActiveTab('visualizer');
  }, [playback]);

  const handleSeekBeat = useCallback((beatTime: number) => {
    playback.pause();
    playback.seek(beatTime);
  }, [playback]);

  const handleDismissWelcome = () => {
    setShowWelcomeBanner(false);
    localStorage.setItem('nfl-scheme-welcome-dismissed', 'true');
  };

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // The comparison view owns its own playback (its Timeline handles play/pause/step keys),
      // so only keep the view-level keys (Escape, tab digits, guide) from firing here.
      if (activeTab === 'compare') {
        if (e.key === 'Escape' && showGuideModal) {
          e.preventDefault();
          setShowGuideModal(false);
        } else if (e.key === '1') {
          setActiveTab('visualizer');
        } else if (e.key === '2') {
          setActiveTab('directory');
        } else if (e.key === '3') {
          setActiveTab('trees');
        } else if (e.key === '4') {
          setActiveTab('sequence-map');
        } else if (e.key === '5') {
          setActiveTab('compare');
        } else if (e.key === '?') {
          setShowGuideModal((prev) => !prev);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (showGuideModal) {
          e.preventDefault();
          setShowGuideModal(false);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        playback.toggle();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playback.pause();
        playback.seek(Math.max(0, playback.t - 0.1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        playback.pause();
        playback.seek(Math.min(selectedPlay.duration, playback.t + 0.1));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        playback.reset();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        const beats = selectedPlay.beats;
        if (beats.length > 0) {
          let active = 0;
          for (let i = 0; i < beats.length; i++) {
            if (playback.t >= beats[i].t - 0.05) {
              active = i;
            }
          }
          const prevIdx = Math.max(0, active - 1);
          handleSeekBeat(beats[prevIdx].t);
        }
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        const beats = selectedPlay.beats;
        if (beats.length > 0) {
          let active = 0;
          for (let i = 0; i < beats.length; i++) {
            if (playback.t >= beats[i].t - 0.05) {
              active = i;
            }
          }
          const nextIdx = Math.min(beats.length - 1, active + 1);
          handleSeekBeat(beats[nextIdx].t);
        }
      } else if (e.key === '[') {
        e.preventDefault();
        const currentIdx = currentFamily.plays.findIndex((p) => p.id === selectedPlayId);
        const prevIdx = (currentIdx - 1 + currentFamily.plays.length) % currentFamily.plays.length;
        handleSelectPlay(currentFamily.plays[prevIdx].id);
      } else if (e.key === ']') {
        e.preventDefault();
        const currentIdx = currentFamily.plays.findIndex((p) => p.id === selectedPlayId);
        const nextIdx = (currentIdx + 1) % currentFamily.plays.length;
        handleSelectPlay(currentFamily.plays[nextIdx].id);
      } else if (e.key === '{' || (e.shiftKey && e.key === '[')) {
        e.preventDefault();
        const famIdx = ALL_SCHEME_FAMILIES.findIndex((f) => f.id === selectedFamilyId);
        const prevFamIdx = (famIdx - 1 + ALL_SCHEME_FAMILIES.length) % ALL_SCHEME_FAMILIES.length;
        handleSelectFamily(ALL_SCHEME_FAMILIES[prevFamIdx].id);
      } else if (e.key === '}' || (e.shiftKey && e.key === ']')) {
        e.preventDefault();
        const famIdx = ALL_SCHEME_FAMILIES.findIndex((f) => f.id === selectedFamilyId);
        const nextFamIdx = (famIdx + 1) % ALL_SCHEME_FAMILIES.length;
        handleSelectFamily(ALL_SCHEME_FAMILIES[nextFamIdx].id);
      } else if (e.key.toLowerCase() === 't' || e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsTheaterMode((prev) => !prev);
      } else if (e.key === '1') {
        setActiveTab('visualizer');
      } else if (e.key === '2') {
        setActiveTab('directory');
      } else if (e.key === '3') {
        setActiveTab('trees');
      } else if (e.key === '4') {
        setActiveTab('sequence-map');
      } else if (e.key === '5') {
        setActiveTab('compare');
      } else if (e.key === '?') {
        setShowGuideModal((prev) => !prev);
      }
    },
    [playback, selectedPlay.duration, selectedPlay.beats, currentFamily, selectedPlayId, selectedFamilyId, activeTab, showGuideModal, handleSeekBeat, handleSelectPlay, handleSelectFamily]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-container">
      {/* Master Command Deck Header (Clean, authoritative top bar) */}
      <header className="app-header master-command-deck" role="banner">
        {/* Left: Brand Identity */}
        <div className="brand-section">
          <div className="brand-icon-wrap" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div className="brand-titles-row">
            <h1 className="app-title">SchemeDB</h1>
            <span className="app-subtitle-pill">Film Room & Scheme Engine</span>
          </div>
        </div>

        {/* Right: Global Navigation Tabs & Guide Helper */}
        <div className="header-right-deck">
          <nav className="nav-tab-group" role="tablist" aria-label="Workstation views">
            <button
              id="tab-visualizer"
              role="tab"
              aria-selected={activeTab === 'visualizer'}
              aria-controls="main-view-panel"
              onClick={() => setActiveTab('visualizer')}
              className={`nav-tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
              title="Film Room Visualizer [1]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="nav-tab-label">Film Room</span>
            </button>

            <button
              id="tab-directory"
              role="tab"
              aria-selected={activeTab === 'directory'}
              aria-controls="main-view-panel"
              onClick={() => setActiveTab('directory')}
              className={`nav-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
              title="Scheme Catalog [2]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span className="nav-tab-label">Scheme Catalog</span>
            </button>

            <button
              id="tab-trees"
              role="tab"
              aria-selected={activeTab === 'trees'}
              aria-controls="main-view-panel"
              onClick={() => setActiveTab('trees')}
              className={`nav-tab-btn ${activeTab === 'trees' ? 'active' : ''}`}
              title="Coaching Trees [3]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="14" />
                <line x1="12" y1="14" x2="6" y2="18" />
                <line x1="12" y1="14" x2="18" y2="18" />
                <circle cx="6" cy="19" r="2" />
                <circle cx="18" cy="19" r="2" />
              </svg>
              <span className="nav-tab-label">Coaching Trees</span>
            </button>

            <button
              id="tab-sequence-map"
              role="tab"
              aria-selected={activeTab === 'sequence-map'}
              aria-controls="main-view-panel"
              onClick={() => setActiveTab('sequence-map')}
              className={`nav-tab-btn ${activeTab === 'sequence-map' ? 'active' : ''}`}
              title="Sequence Matrix [4]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className="nav-tab-label">Sequence Matrix</span>
            </button>

            <button
              id="tab-compare"
              role="tab"
              aria-selected={activeTab === 'compare'}
              aria-controls="main-view-panel"
              onClick={() => setActiveTab('compare')}
              className={`nav-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
              title="Play Comparison [5]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="7 8 3 12 7 16" />
                <polyline points="17 8 21 12 17 16" />
                <line x1="3" y1="12" x2="21" y2="12" />
              </svg>
              <span className="nav-tab-label">Play Comparison</span>
            </button>
          </nav>

          <button
            type="button"
            className="guide-help-btn"
            onClick={() => setShowGuideModal(true)}
            aria-label="Workstation Guide & Keyboard Shortcuts"
            title="Workstation Guide & Shortcuts [?]"
          >
            <span className="guide-btn-icon">?</span>
            <span className="guide-btn-text">Guide</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main
        id="main-view-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={-1}
        className="main-workspace"
      >
        {activeTab === 'visualizer' && (
          <div className="film-room-view-wrapper">
            {/* New User Welcome & Quick-Start Strip */}
            {showWelcomeBanner && (
              <div className="welcome-quickstart-banner" role="region" aria-label="Quick Start Guide">
                <div className="welcome-banner-content">
                  <div className="welcome-banner-title">
                    <span className="welcome-badge">GETTING STARTED</span>
                    <span>Explore {ALL_SCHEME_FAMILIES.length} NFL offensive & defensive scheme systems with synchronized All-22 breakdowns.</span>
                  </div>
                  <div className="welcome-quick-chips">
                    <span className="chips-label">Popular Systems:</span>
                    <button
                      type="button"
                      className="starter-chip"
                      onClick={() => handleSelectFamily('shanahan-wide-zone')}
                    >
                      Kyle Shanahan Wide Zone
                    </button>
                    <button
                      type="button"
                      className="starter-chip"
                      onClick={() => handleSelectFamily('macdonald-hybrid-disguise')}
                    >
                      Macdonald Sim Pressures
                    </button>
                    <button
                      type="button"
                      className="starter-chip"
                      onClick={() => handleSelectFamily('reid-spread-rpo')}
                    >
                      Reid Spread RPO
                    </button>
                    <button
                      type="button"
                      className="starter-chip"
                      onClick={() => handleSelectFamily('fangio-two-high-shell')}
                    >
                      Fangio Two-High Shell
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="welcome-dismiss-btn"
                  onClick={handleDismissWelcome}
                  aria-label="Dismiss quick start guide"
                >
                  Got it
                </button>
              </div>
            )}

            {/* Dedicated Film Room Playbook Command Bar */}
            <PlayPicker
              families={ALL_SCHEME_FAMILIES}
              selectedFamilyId={selectedFamilyId}
              onSelectFamily={(id) => handleSelectFamily(id)}
              plays={currentFamily.plays}
              selectedPlayId={selectedPlayId}
              onSelectPlay={handleSelectPlay}
              onOpenCatalog={() => setActiveTab('directory')}
              isTheaterMode={isTheaterMode}
              onToggleTheaterMode={() => setIsTheaterMode((prev) => !prev)}
            />

            {/* 2-Column Workstation Grid */}
            <div className={`film-room-grid ${isTheaterMode ? 'theater-mode' : ''}`}>
              {/* Left Column: Canvas + Playback Timeline */}
              <section className="canvas-panel" aria-label="Field Playback and Timeline Deck">
                {showCoverageSwitcher && (
                  <CoverageSwitcher
                    schemes={COVERAGE_SCHEMES}
                    activeSchemeId={coverageScheme}
                    onSelect={setCoverageScheme}
                  />
                )}

                <div className="canvas-viewport-wrapper">
                  <PlayCanvas play={renderPlay} t={playback.t} />
                </div>

                <Timeline
                  t={playback.t}
                  duration={selectedPlay.duration}
                  playing={playback.playing}
                  speed={playback.speed}
                  beats={selectedPlay.beats}
                  loop={playback.loop}
                  onToggle={playback.toggle}
                  onSeek={playback.seek}
                  onSetSpeed={playback.setSpeed}
                  onReset={playback.reset}
                  onToggleLoop={playback.toggleLoop}
                />
              </section>

              {/* Right Column: Standing Analysis Console */}
              <aside
                className={`side-panel custom-scrollbar ${isTheaterMode ? 'collapsed' : ''}`}
                aria-label="Coaching Analysis Console"
                aria-hidden={isTheaterMode}
              >
                <AnalysisPanel
                  play={renderPlay}
                  t={playback.t}
                  onSeekBeat={handleSeekBeat}
                />
              </aside>
            </div>
          </div>
        )}

        {activeTab === 'directory' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <Suspense fallback={<ViewLoadingSkeleton label="Scheme Catalog & Master Matrix" />}>
              <SchemeFamiliesDirectory
                onSelectFamily={(famId, view) => handleSelectFamily(famId, view || 'visualizer')}
                onSelectPlay={handleSelectPlayFromDirectory}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'trees' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <Suspense fallback={<ViewLoadingSkeleton label="Coaching Lineage Trees" />}>
              <CoachingTreeGraph
                onSelectFamily={(famId, view) => handleSelectFamily(famId, view || 'visualizer')}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'sequence-map' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
            <Suspense fallback={<ViewLoadingSkeleton label="0.0s–1.2s Disguise Sequence Matrix" />}>
              <SequenceMap
                plays={currentFamily.plays}
                selectedPlayId={selectedPlayId}
                onSelectPlay={(id) => {
                  handleSelectPlay(id);
                  setActiveTab('visualizer');
                }}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'compare' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <Suspense fallback={<ViewLoadingSkeleton label="Dual-Play Comparison Scrubber" />}>
              <PlayComparison
                initialPlayA={selectedPlay}
                initialPlayB={comparisonPlayB}
                allFamilies={ALL_SCHEME_FAMILIES}
              />
            </Suspense>
          </div>
        )}

      </main>

      {/* Workstation Guide & Keyboard Shortcuts Modal */}
      {showGuideModal && (
        <div className="guide-modal-backdrop" onClick={() => setShowGuideModal(false)}>
          <div
            className="guide-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="SchemeDB Guide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="guide-modal-header">
              <div>
                <h2 className="guide-modal-title">Film Room & Workstation Guide</h2>
                <p className="guide-modal-subtitle">Master the All-22 tactical visualizer</p>
              </div>
              <button
                type="button"
                className="guide-modal-close"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close guide"
              >
                ✕
              </button>
            </div>

            <div className="guide-modal-body custom-scrollbar">
              <div className="guide-section">
                <h3>Key Capabilities</h3>
                <ul className="guide-feature-list">
                  <li>
                    <strong>Film Room:</strong> Watch {ALL_PLAYS.length} plays across {ALL_SCHEME_FAMILIES.length} offensive and defensive schemes — modern NFL, historical NFL, and college — animated in authentic All-22. Scrub the timeline to inspect key conflict defender reads.
                  </li>
                  <li>
                    <strong>Scheme Catalog:</strong> Filter and browse the complete library of {ALL_SCHEME_FAMILIES.length} scheme philosophies, personnel groupings, and counter tactics.
                  </li>
                  <li>
                    <strong>Coaching Trees:</strong> Interactive lineage graphs tracing modern NFL coaching systems back to legendary architects (Bill Walsh, Don Coryell, Tom Landry, Buddy Ryan, Dick LeBeau, Paul Johnson, and more).
                  </li>
                  <li>
                    <strong>Sequence Matrix:</strong> Compare the 0.0s–1.2s disguise mesh window to see why complementary plays mirror each other.
                  </li>
                  <li>
                    <strong>Play Comparison:</strong> Scrub any two plays side-by-side on one synchronized timeline to study how a base concept and its constraint counterpart mirror each other across the disguise window.
                  </li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>Keyboard Shortcuts</h3>
                <div className="shortcuts-grid">
                  <div className="shortcut-item"><kbd>Space</kbd> <span>Play / Pause</span></div>
                  <div className="shortcut-item"><kbd>←</kbd> / <kbd>→</kbd> <span>Step ±0.1s</span></div>
                  <div className="shortcut-item"><kbd>B</kbd> / <kbd>N</kbd> <span>Prev / Next Key Beat</span></div>
                  <div className="shortcut-item"><kbd>[</kbd> / <kbd>]</kbd> <span>Prev / Next Play in Scheme</span></div>
                  <div className="shortcut-item"><kbd>Shift+[</kbd> / <kbd>Shift+]</kbd> <span>Prev / Next Scheme System</span></div>
                  <div className="shortcut-item"><kbd>R</kbd> <span>Reset to Snap (T=0.0s)</span></div>
                  <div className="shortcut-item"><kbd>T</kbd> / <kbd>F</kbd> <span>Full-Field Theater Mode</span></div>
                  <div className="shortcut-item"><kbd>1</kbd>–<kbd>5</kbd> <span>Switch Workspace Views</span></div>
                  <div className="shortcut-item"><kbd>?</kbd> <span>Toggle This Guide</span></div>
                </div>
              </div>
            </div>

            <div className="guide-modal-footer">
              <button
                type="button"
                className="guide-modal-done-btn"
                onClick={() => setShowGuideModal(false)}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;



