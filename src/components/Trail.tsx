import React, { memo } from 'react';
import type { PlayerTrack } from '../engine/types';
import { sampleTrack, getFullTrackSvgPath } from '../engine/interpolate';

export interface TrailProps {
  track: PlayerTrack;
  t: number;
  isFocused?: boolean;
  hasActiveFocus?: boolean;
  isKeyConflict?: boolean;
  showGhost?: boolean;
}

export const Trail: React.FC<TrailProps> = memo(({
  track,
  t,
  isFocused = false,
  hasActiveFocus = false,
  isKeyConflict = false,
  showGhost = true,
}) => {
  if (track.trail === 'none') {
    return null;
  }

  // Retrieve memoized full-path ghost route (zero computation during active playback)
  const { pathD: fullPathD, svgPoints: fullSvgPoints } = getFullTrackSvgPath(track);

  // Sample points up to time t
  const numSteps = Math.max(8, Math.min(50, Math.round(t * 18)));
  const points = t > 0.05 ? sampleTrack(track, 0, t, numSteps) : [];
  const svgPoints = points.map((p) => ({ x: p.x, y: -p.y }));

  // Build SVG path for elapsed time
  let pathD = '';
  for (let i = 0; i < svgPoints.length; i++) {
    const p = svgPoints[i];
    pathD += `${i === 0 ? 'M' : ' L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }


  // Calculate tip tangent for arrowhead / T-bar / end cap
  const last = svgPoints.length > 0 ? svgPoints[svgPoints.length - 1] : undefined;
  const prev = svgPoints.length > 1 ? svgPoints[Math.max(0, svgPoints.length - 3)] : undefined;
  const dx = last && prev ? last.x - prev.x : 0;
  const dy = last && prev ? last.y - prev.y : 0;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Intermediate directional chevron positions
  const intermediateChevrons: { x: number; y: number; angle: number }[] = [];
  if (svgPoints.length >= 10 && track.trail !== 'block') {
    const idxs = [Math.floor(svgPoints.length * 0.45), Math.floor(svgPoints.length * 0.8)];
    for (const idx of idxs) {
      const cur = svgPoints[idx];
      const pPrev = svgPoints[Math.max(0, idx - 2)];
      const cdx = cur.x - pPrev.x;
      const cdy = cur.y - pPrev.y;
      if (Math.hypot(cdx, cdy) > 0.25) {
        intermediateChevrons.push({
          x: cur.x,
          y: cur.y,
          angle: (Math.atan2(cdy, cdx) * 180) / Math.PI,
        });
      }
    }
  }

  // Opacity & Color Palette
  let opacity = hasActiveFocus ? (isFocused || isKeyConflict ? 1 : 0.55) : 0.9;
  let strokeColor = '#f59e0b';
  let strokeWidth = 0.28;
  let strokeDasharray: string | undefined = undefined;

  switch (track.trail) {
    case 'route':
      strokeColor = '#38bdf8';
      strokeWidth = 0.28;
      break;
    case 'block':
      strokeColor = '#f59e0b';
      strokeWidth = 0.26;
      break;
    case 'carry':
      strokeColor = '#f97316';
      strokeWidth = 0.42;
      break;
    case 'drop':
      strokeColor = '#60a5fa';
      strokeWidth = 0.22;
      strokeDasharray = '0.55 0.32';
      break;
  }

  if (isKeyConflict) {
    strokeColor = '#ef4444';
    strokeWidth = Math.max(strokeWidth, 0.32);
  } else if (isFocused) {
    strokeColor = track.side === 'offense' ? '#fbbf24' : '#38bdf8';
    strokeWidth *= 1.25;
    opacity = 1;
  }

  return (
    <g opacity={opacity} style={{ transition: 'opacity 0.2s ease' }}>
      {/* 1. Ghost / Pre-Snap Full Play Route Art */}
      {showGhost && fullSvgPoints.length >= 2 && (
        <path
          d={fullPathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={Math.max(0.14, strokeWidth * 0.55)}
          strokeDasharray={track.trail === 'drop' ? '0.4 0.3' : '0.6 0.4'}
          opacity={isFocused || isKeyConflict ? 0.45 : 0.25}
          strokeLinecap="round"
        />
      )}

      {/* 2. Active Elapsed Vector Trail Path */}
      {svgPoints.length >= 2 && (
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* 3. Intermediate Directional Chevrons */}
      {intermediateChevrons.map((chev, i) => (
        <g
          key={`chev-${i}`}
          transform={`translate(${chev.x}, ${chev.y}) rotate(${chev.angle})`}
          opacity="0.85"
        >
          <path
            d="M -0.38 -0.28 L 0 0 L -0.38 0.28"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* 4. Terminal Caps at Current Head Position */}
      {last && (
        <>
          {/* Solid Blocker Contact T-Bar */}
          {track.trail === 'block' && (
            <g transform={`translate(${last.x}, ${last.y}) rotate(${angleDeg})`}>
              <line
                x1="0"
                y1="-0.6"
                x2="0"
                y2="0.6"
                stroke={strokeColor}
                strokeWidth={strokeWidth * 1.5}
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Route & Carry Directional Arrowhead */}
          {(track.trail === 'route' || track.trail === 'carry') && (
            <g transform={`translate(${last.x}, ${last.y}) rotate(${angleDeg})`}>
              <path
                d="M -0.6 -0.38 L 0 0 L -0.6 0.38"
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth * 1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Zone Drop Terminal Anchor Circle */}
          {track.trail === 'drop' && (
            <g transform={`translate(${last.x}, ${last.y})`}>
              <circle
                r="0.4"
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray="0.3 0.2"
              />
              <circle
                r="0.16"
                fill={strokeColor}
              />
            </g>
          )}
        </>
      )}
    </g>
  );
});

