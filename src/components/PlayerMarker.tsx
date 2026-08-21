import React, { useState, memo } from 'react';
import type { Side } from '../engine/types';

export interface PlayerMarkerProps {
  id: string;
  label: string;
  side: Side;
  role?: 'ol' | 'qb' | 'rb' | 'te' | 'wr' | 'dl' | 'lb' | 'db';
  x: number; // field x
  y: number; // field y
  heading?: number; // angle in degrees: 0 = right (+x), -90 = downfield (+y field = -y SVG), +90 = backfield (+y SVG), 180 = left (-x)
  isMoving?: boolean;
  isFocused?: boolean;
  hasActiveFocus?: boolean; // true if any player on the field is currently focused
  isKeyConflict?: boolean;  // true if this defender is the primary conflict read
  assignment?: string;      // tactical assignment description
  tabIndex?: number;
  onFocus?: (e: React.FocusEvent<SVGGElement>) => void;
  onBlur?: (e: React.FocusEvent<SVGGElement>) => void;
  onClick?: (e: React.MouseEvent<SVGGElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<SVGGElement>) => void;
}

export function getPlayerAriaLabel(
  side: Side,
  label: string,
  id: string,
  role?: 'ol' | 'qb' | 'rb' | 'te' | 'wr' | 'dl' | 'lb' | 'db',
  assignment?: string,
  isKeyConflict?: boolean,
  isQB?: boolean
): string {
  const sideName = side === 'offense' ? 'Offense' : 'Defense';
  const posIdentifier = label.trim() || id.toUpperCase() || (role ? role.toUpperCase() : 'Player');

  let roleFullName = '';
  switch (role) {
    case 'qb': roleFullName = 'Quarterback'; break;
    case 'rb': roleFullName = 'Running Back'; break;
    case 'wr': roleFullName = 'Wide Receiver'; break;
    case 'te': roleFullName = 'Tight End'; break;
    case 'ol': roleFullName = 'Offensive Lineman'; break;
    case 'dl': roleFullName = 'Defensive Lineman'; break;
    case 'lb': roleFullName = 'Linebacker'; break;
    case 'db': roleFullName = 'Defensive Back'; break;
    default:
      roleFullName = posIdentifier;
      break;
  }

  let assignmentDesc = '';
  if (assignment && assignment.trim()) {
    assignmentDesc = isKeyConflict
      ? `${assignment.trim()} (Read Key Conflict Defender)`
      : assignment.trim();
  } else if (isKeyConflict) {
    assignmentDesc = 'Read Key Conflict Defender';
  } else if (isQB) {
    assignmentDesc = 'Primary Passer';
  } else {
    assignmentDesc = roleFullName;
  }

  return `${sideName} ${posIdentifier} - ${assignmentDesc}`;
}

export const PlayerMarker: React.FC<PlayerMarkerProps> = memo(({
  id,
  label,
  side,
  role,
  x,
  y,
  heading,
  isMoving = false,
  isFocused = false,
  hasActiveFocus = false,
  isKeyConflict = false,
  assignment,
  tabIndex = 0,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
}) => {

  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

  const isOffense = side === 'offense';
  const isQB = label.toUpperCase() === 'QB' || id.toUpperCase() === 'QB' || role === 'qb';
  const svgX = x;
  const svgY = -y; // Convert field y (positive upfield) to SVG y (downfield up = lower svgY)

  // Color & Theme Palette
  let primaryStroke = isOffense ? '#f59e0b' : '#38bdf8';
  let primaryFill = isOffense ? '#101a2e' : '#081e33';
  let badgeColor = isOffense ? '#fbbf24' : '#38bdf8';

  if (isKeyConflict) {
    primaryStroke = '#ef4444';
    primaryFill = '#2a0c13';
    badgeColor = '#ef4444';
  } else if (isQB) {
    primaryStroke = '#fbbf24';
    primaryFill = '#221904';
  }

  // Opacity calculation for focus depth — keep non-focused readable at 0.72
  let opacity = 1;
  if (hasActiveFocus) {
    if (isFocused || isKeyConflict || isKeyboardFocused) {
      opacity = 1;
    } else {
      opacity = 0.72;
    }
  }

  // Dynamic font sizing based on label length to prevent overflow
  const labelLen = label.length;
  let fontSize = 0.64;
  if (labelLen <= 1) {
    fontSize = 0.78;
  } else if (labelLen === 2) {
    fontSize = 0.64;
  } else if (labelLen === 3) {
    fontSize = 0.54;
  } else if (labelLen === 4) {
    fontSize = 0.46;
  } else {
    fontSize = 0.38;
  }

  // Default orientation heading if not provided
  const orientationHeading = heading !== undefined ? heading : (isOffense ? -90 : 90);

  const ariaLabel = getPlayerAriaLabel(side, label, id, role, assignment, isKeyConflict, isQB);

  return (
    <g
      tabIndex={tabIndex}
      role="img"
      aria-label={ariaLabel}
      className={`player-marker-token ${isKeyboardFocused ? 'keyboard-focused' : ''}`}
      transform={`translate(${svgX}, ${svgY})`}
      opacity={opacity}
      onFocus={(e) => {
        setIsKeyboardFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsKeyboardFocused(false);
        onBlur?.(e);
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as unknown as React.MouseEvent<SVGGElement>);
        }
        onKeyDown?.(e);
      }}
      style={{
        transition: 'opacity 0.2s ease, transform 0.05s linear',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {/* 0. Accessible Keyboard Focus Ring Halo */}
      <circle
        className="svg-focus-ring"
        cx="0"
        cy="0"
        r="1.6"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="0.22"
        strokeDasharray="0.35 0.18"
        style={{
          opacity: isKeyboardFocused ? 1 : undefined,
          pointerEvents: 'none',
        }}
      />

      {/* 1. Conflict Read Key - Animated Crimson Ping & Target Bracket */}
      {isKeyConflict && (
        <g id="conflict-radar">
          {/* Subtle threat ping ring (bounded radius) */}
          <circle
            r="1.2"
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.18"
            opacity="0.8"
          >
            <animate
              attributeName="r"
              values="1.1; 1.6; 1.1"
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8; 0.0; 0.8"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Tactical Target Reticle Corner Ticks */}
          <g stroke="#ef4444" strokeWidth="0.16" strokeLinecap="round">
            <path d="M -1.35 -0.8 L -1.35 -1.35 L -0.8 -1.35" />
            <path d="M 0.8 -1.35 L 1.35 -1.35 L 1.35 -0.8" />
            <path d="M 1.35 0.8 L 1.35 1.35 L 0.8 1.35" />
            <path d="M -0.8 1.35 L -1.35 1.35 L -1.35 0.8" />
          </g>

          {/* "READ" pill indicator on top */}
          <g transform="translate(0, -1.65)">
            <rect
              x="-1.1"
              y="-0.36"
              width="2.2"
              height="0.72"
              rx="0.2"
              fill="#991b1b"
              stroke="#ef4444"
              strokeWidth="0.1"
            />
            <text
              y="0.04"
              fill="#ffffff"
              fontSize="0.4"
              fontWeight="900"
              fontFamily="'JetBrains Mono', ui-monospace, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              letterSpacing="0.04em"
            >
              READ KEY
            </text>
          </g>
        </g>
      )}

      {/* 2. Focus Halo Ring */}
      {isFocused && (
        <circle
          r="1.45"
          fill="none"
          stroke={badgeColor}
          strokeWidth="0.18"
          strokeDasharray="0.5 0.25"
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* 3. QB Golden Halo Distinction */}
      {isQB && (
        <circle
          r="1.26"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="0.14"
          strokeDasharray="0.3 0.18"
          opacity="0.75"
        />
      )}

      {/* 4. Sleek Orientation Notch Indicator (only visible when in motion) */}
      {isMoving && (
        <g transform={`rotate(${orientationHeading})`}>
          <polygon
            points="0.95,0 1.22,-0.18 1.14,0 1.22,0.18"
            fill={primaryStroke}
            opacity="0.9"
          />
        </g>
      )}

      {/* 5. Main Token Body: Circle for Offense, Rounded Square for Defense */}
      {isOffense ? (
        <g>
          {/* Offense Circle Token */}
          <circle
            r="1.0"
            fill={primaryFill}
            stroke={primaryStroke}
            strokeWidth={isFocused ? 0.32 : 0.22}
          />
          {/* Inner Highlight Ring */}
          <circle
            r="0.86"
            fill="none"
            stroke={isQB ? '#fbbf24' : '#f59e0b'}
            strokeWidth="0.05"
            opacity="0.4"
          />
        </g>
      ) : (
        <g>
          {/* Defense Rounded Rect */}
          <rect
            x="-0.92"
            y="-0.92"
            width="1.84"
            height="1.84"
            rx="0.36"
            fill={primaryFill}
            stroke={primaryStroke}
            strokeWidth={isFocused ? 0.32 : 0.22}
          />
          {/* Inner Accent Inset */}
          <rect
            x="-0.78"
            y="-0.78"
            width="1.56"
            height="1.56"
            rx="0.26"
            fill="none"
            stroke={isKeyConflict ? '#ef4444' : '#38bdf8'}
            strokeWidth="0.05"
            opacity="0.4"
          />
        </g>
      )}

      {/* 6. Crisp High-Contrast Position Label */}
      <text
        y="0.03"
        fill="#ffffff"
        stroke="#040812"
        strokeWidth="0.08"
        paintOrder="stroke fill"
        strokeLinejoin="round"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="'JetBrains Mono', 'SF Mono', ui-monospace, monospace"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {label}
      </text>
    </g>
  );
});

