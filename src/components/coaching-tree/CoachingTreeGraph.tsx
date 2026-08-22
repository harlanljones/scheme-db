import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import type { CoachProfile, CoachingTreeNode, CoachingTree } from '../../engine/types';
import { COACHING_TREES, ALL_COACHES } from '../../data/coaches/index';
import { CoachDetailModal } from './CoachDetailModal';
import { CoachHeadshot } from './CoachHeadshot';

interface CoachingTreeGraphProps {
  onSelectFamily: (familyId: string, view?: 'visualizer' | 'sequence-map') => void;
}

interface FlattenedNode {
  coach: CoachProfile;
  depth: number;
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TreeLink {
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
}

export const CoachingTreeGraph: React.FC<CoachingTreeGraphProps> = memo(({ onSelectFamily }) => {

  const [selectedBranchId, setSelectedBranchId] = useState<string>(COACHING_TREES[0].id);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'offense' | 'defense'>('all');
  const [headCoachOnly, setHeadCoachOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCoachDetail, setActiveCoachDetail] = useState<CoachProfile | null>(null);
  const [hoveredCoachId, setHoveredCoachId] = useState<string | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panCurrentRef = useRef<{ x: number; y: number }>({ x: 40, y: 30 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const filteredTrees = useMemo(() => {
    return COACHING_TREES.filter((tree) => {
      if (categoryFilter !== 'all' && tree.category !== categoryFilter) return false;
      return true;
    });
  }, [categoryFilter]);

  const currentBranch = useMemo(() => {
    const found = filteredTrees.find((t) => t.id === selectedBranchId);
    return found || filteredTrees[0] || COACHING_TREES[0];
  }, [filteredTrees, selectedBranchId]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return ALL_COACHES.filter((coach) => {
      const matchesText =
        coach.name.toLowerCase().includes(q) ||
        coach.team.toLowerCase().includes(q) ||
        coach.role2026.toLowerCase().includes(q) ||
        coach.philosophy.toLowerCase().includes(q) ||
        coach.keyConcepts.some((c) => c.toLowerCase().includes(q));
      if (!matchesText) return false;
      if (categoryFilter !== 'all' && coach.category !== categoryFilter) return false;
      if (headCoachOnly && !coach.isHeadCoach2026) return false;
      return true;
    });
  }, [searchQuery, categoryFilter, headCoachOnly]);

  const countHeadCoachesInTree = (tree: CoachingTree) => {
    let count = 0;
    const checkNode = (node: CoachingTreeNode) => {
      if (node.coach.isHeadCoach2026) count++;
      node.children.forEach(checkNode);
    };
    tree.rootNodes.forEach(checkNode);
    return count;
  };

  const countTotalCoachesInTree = (tree: CoachingTree) => {
    let count = 0;
    const checkNode = (node: CoachingTreeNode) => {
      count++;
      node.children.forEach(checkNode);
    };
    tree.rootNodes.forEach(checkNode);
    return count;
  };

  // Build hierarchical layout for tree visualization
  const { nodes, links, bounds } = useMemo(() => {
    const CARD_WIDTH = 320;
    const CARD_HEIGHT = 248;
    const HORIZONTAL_GAP = 32;
    const VERTICAL_GAP = 85;

    const flattened: FlattenedNode[] = [];
    const treeLinks: TreeLink[] = [];

    // Group nodes by depth
    const levels: { node: CoachingTreeNode; parentId?: string }[][] = [];

    const traverse = (node: CoachingTreeNode, depth: number, parentId?: string) => {
      if (headCoachOnly && !node.coach.isHeadCoach2026 && node.children.length === 0) {
        // If filtering HC only, skip leaf non-HC
        return;
      }
      if (!levels[depth]) {
        levels[depth] = [];
      }
      levels[depth].push({ node, parentId });
      node.children.forEach((child) => traverse(child, depth + 1, node.coach.id));
    };

    currentBranch.rootNodes.forEach((root) => traverse(root, 0));

    // Calculate max width per level to center nodes neatly
    let maxLevelWidth = 0;
    levels.forEach((levelNodes) => {
      const width = levelNodes.length * CARD_WIDTH + Math.max(0, levelNodes.length - 1) * HORIZONTAL_GAP;
      if (width > maxLevelWidth) maxLevelWidth = width;
    });

    const canvasCenter = Math.max(maxLevelWidth / 2, 450);

    levels.forEach((levelNodes, depth) => {
      const levelWidth = levelNodes.length * CARD_WIDTH + Math.max(0, levelNodes.length - 1) * HORIZONTAL_GAP;
      const startX = canvasCenter - levelWidth / 2;
      const y = depth * (CARD_HEIGHT + VERTICAL_GAP) + 30;

      levelNodes.forEach((item, index) => {
        const x = startX + index * (CARD_WIDTH + HORIZONTAL_GAP);
        flattened.push({
          coach: item.node.coach,
          depth,
          parentId: item.parentId,
          x,
          y,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
      });
    });

    // Build connector lines
    flattened.forEach((node) => {
      if (node.parentId) {
        const parent = flattened.find((p) => p.coach.id === node.parentId);
        if (parent) {
          const fromX = parent.x + parent.width / 2;
          const fromY = parent.y + parent.height;
          const toX = node.x + node.width / 2;
          const toY = node.y;
          const isOffense = currentBranch.category === 'offense';
          treeLinks.push({
            fromId: parent.coach.id,
            toId: node.coach.id,
            fromX,
            fromY,
            toX,
            toY,
            color: isOffense ? '#0284c7' : '#9333ea',
          });
        }
      }
    });

    // Calculate total bounds for SVG canvas
    let maxX = 0;
    let maxY = 0;
    flattened.forEach((n) => {
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    });

    return {
      nodes: flattened,
      links: treeLinks,
      bounds: { width: Math.max(maxX + 80, 1000), height: Math.max(maxY + 80, 700) },
    };
  }, [currentBranch, headCoachOnly]);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    setZoom(0.92);
    setPan({ x: 30, y: 25 });
    panCurrentRef.current = { x: 30, y: 25 };
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background, not inside a card
    if ((e.target as HTMLElement).closest('.coach-node-card')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panCurrentRef.current.x, y: e.clientY - panCurrentRef.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const newX = e.clientX - panStartRef.current.x;
    const newY = e.clientY - panStartRef.current.y;
    panCurrentRef.current = { x: newX, y: newY };
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch gesture handlers (Single finger pan & 2-finger pinch zoom)
  const touchDistanceRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.coach-node-card')) return;

    if (e.touches.length === 1) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.touches[0].clientX - panCurrentRef.current.x,
        y: e.touches[0].clientY - panCurrentRef.current.y,
      };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      const newX = e.touches[0].clientX - panStartRef.current.x;
      const newY = e.touches[0].clientY - panStartRef.current.y;
      panCurrentRef.current = { x: newX, y: newY };
      setPan({ x: newX, y: newY });
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (newDist - touchDistanceRef.current) * 0.005;
      setZoom((prev) => Math.min(1.6, Math.max(0.45, prev + delta)));
      touchDistanceRef.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    touchDistanceRef.current = null;
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.45));
  const handleResetZoom = () => {
    setZoom(0.92);
    setPan({ x: 30, y: 25 });
    panCurrentRef.current = { x: 30, y: 25 };
  };

  // Canvas container dimensions tracking for accurate minimap viewport framing
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 900, height: 650 });

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const el = canvasContainerRef.current;
    const updateSize = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        setContainerSize({ width: el.clientWidth, height: el.clientHeight });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Minimap dimensions & coordinate scaling
  const MINIMAP_WIDTH = 120;
  const MINIMAP_HEIGHT = 80;
  const scaleX = MINIMAP_WIDTH / bounds.width;
  const scaleY = MINIMAP_HEIGHT / bounds.height;

  const viewportX = (-pan.x / zoom) * scaleX;
  const viewportY = (-pan.y / zoom) * scaleY;
  const viewportW = (containerSize.width / zoom) * scaleX;
  const viewportH = (containerSize.height / zoom) * scaleY;

  const [isMinimapDragging, setIsMinimapDragging] = useState<boolean>(false);
  const minimapSvgRef = useRef<SVGSVGElement>(null);

  const handleMinimapPan = (clientX: number, clientY: number) => {
    if (!minimapSvgRef.current) return;
    const rect = minimapSvgRef.current.getBoundingClientRect();
    const mx = Math.max(0, Math.min(MINIMAP_WIDTH, clientX - rect.left));
    const my = Math.max(0, Math.min(MINIMAP_HEIGHT, clientY - rect.top));

    // Convert minimap coordinates to world target center
    const targetWorldX = mx / scaleX;
    const targetWorldY = my / scaleY;

    // Center viewport at (targetWorldX, targetWorldY)
    const newPanX = containerSize.width / 2 - targetWorldX * zoom;
    const newPanY = containerSize.height / 2 - targetWorldY * zoom;

    setPan({ x: newPanX, y: newPanY });
    panCurrentRef.current = { x: newPanX, y: newPanY };
  };

  useEffect(() => {
    if (!isMinimapDragging) return;
    const handleWindowMouseMove = (e: MouseEvent) => {
      handleMinimapPan(e.clientX, e.clientY);
    };
    const handleWindowMouseUp = () => {
      setIsMinimapDragging(false);
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isMinimapDragging, scaleX, scaleY, zoom, containerSize]);

  const isOffense = currentBranch.category === 'offense';
  const totalCount = countTotalCoachesInTree(currentBranch);
  const hcCount = countHeadCoachesInTree(currentBranch);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: '12px',
      }}
    >
      {/* Top Header & Tactical Filter Bar */}
      <div
        style={{
          backgroundColor: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              🌳 NFL Coaching Lineage & Tree Explorer
            </h2>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: isOffense ? '#0369a1' : '#7e22ce',
                color: '#ffffff',
              }}
            >
              {isOffense ? '⚡ Offensive System' : '🛡 Defensive Architecture'}
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Mapping master architects to active 2026 disciples, scheme lineages, and playable film playbooks
            <span style={{ color: '#475569' }}> · Photos via Wikimedia Commons</span>
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              aria-label="Search coach, team, concept"
              placeholder="Search coach, team, concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '6px 28px 6px 10px',
                fontSize: '0.8rem',
                color: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '2px',
                }}
              >
                ✕
              </button>
            )}

            {/* Search Results Dropdown Popover */}
            {searchQuery.trim() && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '320px',
                  maxWidth: '90vw',
                  backgroundColor: '#0b1220',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.85)',
                  zIndex: 100,
                  maxHeight: '260px',
                  overflowY: 'auto',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((coach) => (
                    <button
                      key={coach.id}
                      type="button"
                      onClick={() => {
                        if (coach.treeBranch) {
                          handleSelectBranch(coach.treeBranch);
                        }
                        setSelectedCoachId(coach.id);
                        setActiveCoachDetail(coach);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '5px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {coach.name}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {coach.role2026} ({coach.team})
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: coach.category === 'offense' ? 'rgba(3, 105, 161, 0.3)' : 'rgba(126, 34, 206, 0.3)',
                          color: coach.category === 'offense' ? '#7dd3fc' : '#d8b4fe',
                          flexShrink: 0,
                          marginLeft: '6px',
                        }}
                      >
                        {coach.category === 'offense' ? '⚡ Off' : '🛡 Def'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.74rem', color: '#64748b' }}>
                    No coaches matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div
            role="group"
            aria-label="Lineage Category Filters"
            style={{ display: 'flex', backgroundColor: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid #1e293b' }}
          >
            <button
              onClick={() => setCategoryFilter('all')}
              aria-pressed={categoryFilter === 'all'}
              style={{
                backgroundColor: categoryFilter === 'all' ? '#334155' : 'transparent',
                color: categoryFilter === 'all' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              All ({COACHING_TREES.length})
            </button>
            <button
              onClick={() => setCategoryFilter('offense')}
              aria-pressed={categoryFilter === 'offense'}
              style={{
                backgroundColor: categoryFilter === 'offense' ? '#0284c7' : 'transparent',
                color: categoryFilter === 'offense' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              ⚡ Offense ({COACHING_TREES.filter((t) => t.category === 'offense').length})
            </button>
            <button
              onClick={() => setCategoryFilter('defense')}
              aria-pressed={categoryFilter === 'defense'}
              style={{
                backgroundColor: categoryFilter === 'defense' ? '#7c3aed' : 'transparent',
                color: categoryFilter === 'defense' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              🛡 Defense ({COACHING_TREES.filter((t) => t.category === 'defense').length})
            </button>
          </div>

          {/* 2026 HC Filter Toggle */}
          <button
            onClick={() => setHeadCoachOnly(!headCoachOnly)}
            aria-pressed={headCoachOnly}
            aria-label="Toggle 2026 Head Coaches Only filter"
            style={{
              backgroundColor: headCoachOnly ? '#0284c7' : '#0f172a',
              color: headCoachOnly ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span aria-hidden="true">👑</span> 2026 HCs
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="coaching-tree-workspace">
        {/* Left Rail: Lineage Branch Selector */}
        <aside className="coaching-tree-branch-selector">
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              padding: '2px 6px',
              whiteSpace: 'nowrap',
            }}
          >
            Lineage Trees
          </div>

          {filteredTrees.map((tree) => {
            const isSelected = tree.id === currentBranch.id;
            const isTreeOffense = tree.category === 'offense';
            const totalBranchCoaches = countTotalCoachesInTree(tree);
            const branchHCs = countHeadCoachesInTree(tree);

            return (
              <button
                key={tree.id}
                onClick={() => handleSelectBranch(tree.id)}
                className="coaching-tree-branch-btn"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isSelected
                    ? `1px solid ${isTreeOffense ? '#0284c7' : '#9333ea'}`
                    : '1px solid transparent',
                  backgroundColor: isSelected ? '#0f172a' : 'transparent',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#f8fafc' : '#cbd5e1' }}>
                    {tree.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: isTreeOffense ? 'rgba(3, 105, 161, 0.4)' : 'rgba(126, 34, 206, 0.4)',
                      color: isTreeOffense ? '#7dd3fc' : '#d8b4fe',
                    }}
                  >
                    {isTreeOffense ? '⚡ Off' : '🛡 Def'}
                  </span>
                </div>

                <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  {tree.patriarch}
                </span>

                <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>
                    👑 {branchHCs} HCs
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>•</span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    {totalBranchCoaches} Coaches
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Center: Interactive Pan/Zoom Tree Canvas */}
        <main
          ref={canvasContainerRef}
          className="coaching-tree-canvas-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        >
          {/* Subtle Grid Canvas Pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(51, 65, 85, 0.25) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {/* Canvas Floating Overlay Controls */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              zIndex: 10,
              backgroundColor: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentBranch.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>|</span>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
              👑 {hcCount} 2026 Head Coaches
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>|</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {totalCount} Total Coaches
            </span>
          </div>

          {/* Zoom and Reset Controls Widget */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              zIndex: 10,
              backgroundColor: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              display: 'flex',
              gap: '4px',
            }}
          >
            <button
              onClick={handleZoomIn}
              aria-label="Zoom in canvas"
              title="Zoom In"
              style={{
                backgroundColor: '#0f172a',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              aria-label="Zoom out canvas"
              title="Zoom Out"
              style={{
                backgroundColor: '#0f172a',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              -
            </button>
            <button
              onClick={handleResetZoom}
              aria-label="Reset canvas zoom to 100%"
              title="Reset View"
              style={{
                backgroundColor: '#0f172a',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0 8px',
                height: '28px',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>

          {/* Tactical Floating Minimap (120x80px) */}
          <div
            className="coaching-tree-minimap-card"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 15,
              backgroundColor: 'rgba(9, 13, 22, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              userSelect: 'none',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: isOffense ? '#0284c7' : '#9333ea',
                    boxShadow: `0 0 4px ${isOffense ? '#38bdf8' : '#c084fc'}`,
                  }}
                />
                MINIMAP
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: '#475569', fontWeight: 600 }}>
                {nodes.length} NODES
              </span>
            </div>

            <svg
              ref={minimapSvgRef}
              width={MINIMAP_WIDTH}
              height={MINIMAP_HEIGHT}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsMinimapDragging(true);
                handleMinimapPan(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsMinimapDragging(true);
                if (e.touches.length > 0) {
                  handleMinimapPan(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchMove={(e) => {
                if (!isMinimapDragging) return;
                e.stopPropagation();
                if (e.touches.length > 0) {
                  handleMinimapPan(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={(e) => {
                if (isMinimapDragging) {
                  e.stopPropagation();
                  setIsMinimapDragging(false);
                }
              }}
              style={{
                width: `${MINIMAP_WIDTH}px`,
                height: `${MINIMAP_HEIGHT}px`,
                backgroundColor: '#060911',
                borderRadius: '5px',
                border: '1px solid #142036',
                cursor: 'crosshair',
                overflow: 'hidden',
                display: 'block',
              }}
            >
              {/* Miniature Tree Links */}
              {links.map((link, idx) => (
                <line
                  key={`mini-link-${link.fromId}-${link.toId}-${idx}`}
                  x1={link.fromX * scaleX}
                  y1={link.fromY * scaleY}
                  x2={link.toX * scaleX}
                  y2={link.toY * scaleY}
                  stroke={isOffense ? '#0284c7' : '#9333ea'}
                  strokeWidth="1"
                  opacity="0.45"
                />
              ))}

              {/* Miniature Nodes */}
              {nodes.map((node) => {
                const isRoot = node.depth === 0;
                const isHC = node.coach.isHeadCoach2026;
                const isHovered = hoveredCoachId === node.coach.id || selectedCoachId === node.coach.id;
                return (
                  <rect
                    key={`mini-node-${node.coach.id}`}
                    x={node.x * scaleX}
                    y={node.y * scaleY}
                    width={Math.max(4, node.width * scaleX)}
                    height={Math.max(3, node.height * scaleY)}
                    rx="1"
                    fill={
                      isHovered
                        ? '#38bdf8'
                        : isRoot
                        ? (isOffense ? '#38bdf8' : '#c084fc')
                        : isHC
                        ? (isOffense ? '#0284c7' : '#7e22ce')
                        : '#334155'
                    }
                    opacity={isHovered ? 1 : 0.85}
                  />
                );
              })}

              {/* Glowing Viewport Frame */}
              <rect
                x={viewportX}
                y={viewportY}
                width={viewportW}
                height={viewportH}
                fill="rgba(56, 189, 248, 0.14)"
                stroke={isOffense ? '#38bdf8' : '#c084fc'}
                strokeWidth="1.5"
                rx="2"
                style={{
                  filter: `drop-shadow(0 0 3px ${isOffense ? 'rgba(56, 189, 248, 0.9)' : 'rgba(192, 132, 252, 0.9)'})`,
                }}
              />
            </svg>
          </div>

          {/* Interactive Transformable World */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              position: 'relative',
              width: `${bounds.width}px`,
              height: `${bounds.height}px`,
            }}
          >
            {/* SVG Connecting Lines Layer */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <defs>
                <marker
                  id="tree-arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={isOffense ? '#0284c7' : '#9333ea'} />
                </marker>
                <marker
                  id="tree-arrowhead-active"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
                </marker>
              </defs>

              {links.map((link, idx) => {
                const isHighlighted =
                  hoveredCoachId === link.fromId ||
                  hoveredCoachId === link.toId ||
                  selectedCoachId === link.fromId ||
                  selectedCoachId === link.toId;

                const midY = link.fromY + (link.toY - link.fromY) / 2;
                const pathData = `M ${link.fromX} ${link.fromY} C ${link.fromX} ${midY}, ${link.toX} ${midY}, ${link.toX} ${link.toY}`;

                return (
                  <g key={`link-${link.fromId}-${link.toId}-${idx}`}>
                    {/* Glow outline for highlighted path */}
                    {isHighlighted && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="5"
                        opacity="0.6"
                      />
                    )}
                    {/* Main connector curve */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isHighlighted ? '#38bdf8' : link.color}
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeDasharray={isHighlighted ? 'none' : '4 2'}
                      opacity={isHighlighted ? 1 : 0.75}
                      markerEnd={isHighlighted ? 'url(#tree-arrowhead-active)' : 'url(#tree-arrowhead)'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Coach Node Cards Layer */}
            {nodes.map((node) => {
              const coach = node.coach;
              const isRoot = node.depth === 0;
              const isSecondGen = node.depth === 1;
              const isHC = coach.isHeadCoach2026;
              const hasScheme = coach.schemeFamilyIds.length > 0;
              const isHovered = hoveredCoachId === coach.id;
              const isSelected = selectedCoachId === coach.id;

              const isMatchSearch =
                searchResults && searchResults.some((s) => s.id === coach.id);

              return (
                <div
                  key={coach.id}
                  className="coach-node-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`View coaching profile for ${coach.name}, ${coach.role2026} (${coach.team})`}
                  onClick={() => {
                    setSelectedCoachId(coach.id);
                    setActiveCoachDetail(coach);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCoachId(coach.id);
                      setActiveCoachDetail(coach);
                    }
                  }}
                  onMouseEnter={() => setHoveredCoachId(coach.id)}
                  onMouseLeave={() => setHoveredCoachId(null)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    backgroundColor: isRoot ? '#0f172a' : '#0b1120',
                    border: isHovered || isSelected || isMatchSearch
                      ? '2px solid #38bdf8'
                      : isRoot
                      ? `2px solid ${isOffense ? '#0284c7' : '#9333ea'}`
                      : '1px solid rgba(51, 65, 85, 0.8)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: isHovered || isSelected || isMatchSearch
                      ? '0 8px 24px rgba(56, 189, 248, 0.3)'
                      : isRoot
                      ? '0 6px 18px rgba(0, 0, 0, 0.45)'
                      : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxSizing: 'border-box',
                    zIndex: isHovered || isSelected ? 20 : 5,
                  }}
                >
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isRoot
                          ? (isOffense ? '#0369a1' : '#7e22ce')
                          : isSecondGen
                          ? '#1e293b'
                          : '#0a101d',
                        color: isRoot ? '#ffffff' : '#94a3b8',
                      }}
                    >
                      {isRoot ? '★ Master Patriarch' : isSecondGen ? '✦ 2nd Gen Innovator' : '↳ Progeny'}
                    </span>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {isHC && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                          }}
                        >
                          👑 2026 HC
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          backgroundColor: '#111827',
                          color: '#cbd5e1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {coach.team.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Headshot, Coach Name & Role */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CoachHeadshot
                      coachId={coach.id}
                      name={coach.name}
                      size={isRoot ? 56 : 48}
                      isRoot={isRoot}
                      category={coach.category === 'defense' ? 'defense' : 'offense'}
                    />
                    <div style={{ minWidth: 0 }}>
                      <h4
                        style={{
                          margin: '0 0 2px',
                          fontSize: isRoot ? '1.05rem' : '0.94rem',
                          fontWeight: 800,
                          color: '#f8fafc',
                          letterSpacing: '-0.015em',
                        }}
                        title={coach.name}
                      >
                        {coach.name}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.74rem',
                          color: isOffense ? '#7dd3fc' : '#d8b4fe',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        title={coach.role2026}
                      >
                        {coach.role2026}
                      </p>
                    </div>
                  </div>

                  {/* Philosophy Snippet */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.74rem',
                      color: '#94a3b8',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={coach.philosophy}
                  >
                    {coach.philosophy}
                  </p>

                  {/* Key Concepts Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                    {coach.keyConcepts.slice(0, 3).map((concept, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          backgroundColor: '#070b14',
                          color: '#cbd5e1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #1e293b',
                        }}
                      >
                        {concept}
                      </span>
                    ))}
                    {coach.keyConcepts.length > 3 && (
                      <span
                        style={{ fontSize: '0.64rem', color: '#64748b', alignSelf: 'center' }}
                        title={coach.keyConcepts.join(', ')}
                      >
                        +{coach.keyConcepts.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Direct Launch Actions */}
                  {hasScheme && (
                    <div
                      style={{
                        paddingTop: '6px',
                        borderTop: '1px solid #1e293b',
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFamily(coach.schemeFamilyIds[0], 'visualizer');
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '4px 6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        🎬 Visualizer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFamily(coach.schemeFamilyIds[0], 'sequence-map');
                        }}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#e2e8f0',
                          border: '1px solid #334155',
                          borderRadius: '5px',
                          padding: '4px 6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🕸 Matrix
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Coach Detail Dossier Modal */}
      {activeCoachDetail && (
        <CoachDetailModal
          coach={activeCoachDetail}
          onClose={() => setActiveCoachDetail(null)}
          onSelectFamily={onSelectFamily}
        />
      )}
    </div>
  );
});

