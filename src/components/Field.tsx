import React, { memo } from 'react';

export interface FieldProps {
  losYard?: number; // e.g. 40
  children?: React.ReactNode;
}

export const FIELD_WIDTH = 53.33; // 53 1/3 yards (160 feet)
export const LEFT_HASH = 23.58;   // 70 ft 9 in from left sideline
export const RIGHT_HASH = 29.75;  // 70 ft 9 in from right sideline (6.17 yd apart)

const FIELD_MIN_X = -3.2;
const FIELD_MIN_Y = -27.5;
const FIELD_TOTAL_WIDTH = FIELD_WIDTH + 6.4; // ~59.73
const FIELD_TOTAL_HEIGHT = 44.5;             // -27.5 to 17.0

// Static pre-computed 5-Yard lines from y = -15 to +25
const STATIC_YARD_LINES: number[] = [];
for (let y = -15; y <= 25; y += 5) {
  STATIC_YARD_LINES.push(y);
}

// Static pre-computed 1-Yard tick marks
const STATIC_HASH_TICKS: number[] = [];
for (let y = -15; y <= 25; y += 1) {
  if (y % 5 !== 0) {
    STATIC_HASH_TICKS.push(y);
  }
}

// Static pre-computed 5-yard alternating lawn stripe bands
const STATIC_MOWER_BANDS: { y: number; height: number; isDark: boolean }[] = [];
for (let y = -15; y <= 25; y += 5) {
  STATIC_MOWER_BANDS.push({
    y,
    height: 5,
    isDark: Math.floor((y + 15) / 5) % 2 === 1,
  });
}

export const Field: React.FC<FieldProps> = memo(({ losYard = 40, children }) => {
  return (
    <svg
      viewBox={`${FIELD_MIN_X} ${FIELD_MIN_Y} ${FIELD_TOTAL_WIDTH} ${FIELD_TOTAL_HEIGHT}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        backgroundColor: '#07130e',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
      }}
    >

      <defs>
        {/* Subtle grass/turf texture pattern */}
        <pattern id="turfGrain" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#000000" opacity="0.03" />
          <circle cx="2" cy="2" r="0.8" fill="#ffffff" opacity="0.02" />
        </pattern>

        {/* Line of Scrimmage luminous glow */}
        <filter id="losGlow" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="0.45" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* First Down luminous glow */}
        <filter id="firstDownGlow" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="0.45" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Player token drop shadow */}
        <filter id="tokenShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.3" stdDeviation="0.3" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        {/* Threat pulse glow for key conflict defenders */}
        <filter id="threatGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* QB golden aura glow */}
        <filter id="qbGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Linear gradient for subtle field vignette */}
        <radialGradient id="fieldVignette" cx="50%" cy="50%" r="65%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      {/* 1. Outer Field Apron (Deep coaching green) */}
      <rect x={FIELD_MIN_X} y={FIELD_MIN_Y} width={FIELD_TOTAL_WIDTH} height={FIELD_TOTAL_HEIGHT} fill="#07140e" />

      {/* 2. Primary Turf Area */}
      <rect x="0" y={FIELD_MIN_Y} width={FIELD_WIDTH} height={FIELD_TOTAL_HEIGHT} fill="#0d2319" />

      {/* 3. Mower Alternating 5-Yard Turf Bands */}
      {STATIC_MOWER_BANDS.map((band) => {
        const svgY = -(band.y + band.height);
        return (
          <rect
            key={`band-${band.y}`}
            x="0"
            y={svgY}
            width={FIELD_WIDTH}
            height={band.height}
            fill={band.isDark ? '#0a1d15' : '#0f291e'}
          />
        );
      })}

      {/* 4. Tactical Vignette */}
      <rect x="0" y={FIELD_MIN_Y} width={FIELD_WIDTH} height={FIELD_TOTAL_HEIGHT} fill="url(#fieldVignette)" opacity="0.35" />

      {/* 5. Sideline Coaching Box / Apron Boundaries */}
      <line x1="-1.5" y1={FIELD_MIN_Y} x2="-1.5" y2={FIELD_MIN_Y + FIELD_TOTAL_HEIGHT} stroke="#1b3628" strokeWidth="0.12" strokeDasharray="1.5 1.5" />
      <line x1={FIELD_WIDTH + 1.5} y1={FIELD_MIN_Y} x2={FIELD_WIDTH + 1.5} y2={FIELD_MIN_Y + FIELD_TOTAL_HEIGHT} stroke="#1b3628" strokeWidth="0.12" strokeDasharray="1.5 1.5" />

      {/* 6. Solid White Sidelines */}
      <line x1="0" y1={FIELD_MIN_Y} x2="0" y2={FIELD_MIN_Y + FIELD_TOTAL_HEIGHT} stroke="#f1f5f9" strokeWidth="0.32" opacity="0.9" />
      <line x1={FIELD_WIDTH} y1={FIELD_MIN_Y} x2={FIELD_WIDTH} y2={FIELD_MIN_Y + FIELD_TOTAL_HEIGHT} stroke="#f1f5f9" strokeWidth="0.32" opacity="0.9" />

      {/* 7. 5-Yard Transverse Chalk Lines & Tactical Yard Numbers */}
      {STATIC_YARD_LINES.map((y) => {
        const svgY = -y;
        const actualYard = losYard + y;
        const displayNumber = actualYard > 50 ? 100 - actualYard : actualYard;
        const isLOS = y === 0;
        const isFirstDown = y === 10;
        const isMajorTenYard = actualYard % 10 === 0;

        return (
          <g key={`yardline-${y}`}>
            {/* Standard Chalk Yardline */}
            {!isLOS && !isFirstDown && (
              <line
                x1="0"
                y1={svgY}
                x2={FIELD_WIDTH}
                y2={svgY}
                stroke="#cbd5e1"
                strokeWidth={isMajorTenYard ? 0.22 : 0.14}
                opacity={isMajorTenYard ? 0.5 : 0.28}
              />
            )}

            {/* Official NFL Yard Numbers (placed 9 yds inside each sideline) */}
            {isMajorTenYard && displayNumber > 0 && displayNumber <= 50 && (
              <>
                {/* Left Side Yard Number */}
                <g transform={`translate(9.0, ${svgY})`}>
                  <text
                    x="0"
                    y="0.32"
                    fill="#e2e8f0"
                    opacity="0.3"
                    fontSize="1.6"
                    fontWeight="800"
                    fontFamily="'JetBrains Mono', 'SF Mono', ui-monospace, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    letterSpacing="0.08em"
                  >
                    {displayNumber}
                  </text>
                  {actualYard < 50 && (
                    <polygon points="-1.3,0 -1.6,-0.3 -1.6,0.3" fill="#e2e8f0" opacity="0.3" />
                  )}
                  {actualYard > 50 && (
                    <polygon points="1.3,0 1.6,-0.3 1.6,0.3" fill="#e2e8f0" opacity="0.3" />
                  )}
                </g>

                {/* Right Side Yard Number */}
                <g transform={`translate(${FIELD_WIDTH - 9.0}, ${svgY})`}>
                  <text
                    x="0"
                    y="0.32"
                    fill="#e2e8f0"
                    opacity="0.3"
                    fontSize="1.6"
                    fontWeight="800"
                    fontFamily="'JetBrains Mono', 'SF Mono', ui-monospace, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    letterSpacing="0.08em"
                  >
                    {displayNumber}
                  </text>
                  {actualYard < 50 && (
                    <polygon points="1.3,0 1.6,-0.3 1.6,0.3" fill="#e2e8f0" opacity="0.3" />
                  )}
                  {actualYard > 50 && (
                    <polygon points="-1.3,0 -1.6,-0.3 -1.6,0.3" fill="#e2e8f0" opacity="0.3" />
                  )}
                </g>
              </>
            )}
          </g>
        );
      })}

      {/* 9. Official NFL 1-Yard Hash Marks (Sidelines & Inbound Hashes) */}
      {STATIC_HASH_TICKS.map((y) => {
        const svgY = -y;
        return (
          <g key={`hash-${y}`} stroke="#e2e8f0" strokeWidth="0.16" opacity="0.42">
            {/* Left Sideline Hash Tick */}
            <line x1="0" y1={svgY} x2="0.75" y2={svgY} />
            {/* Left Inbound NFL Hash Mark (23.58 yd from sideline) */}
            <line x1={LEFT_HASH - 0.45} y1={svgY} x2={LEFT_HASH + 0.45} y2={svgY} />
            {/* Right Inbound NFL Hash Mark (29.75 yd from sideline) */}
            <line x1={RIGHT_HASH - 0.45} y1={svgY} x2={RIGHT_HASH + 0.45} y2={svgY} />
            {/* Right Sideline Hash Tick */}
            <line x1={FIELD_WIDTH - 0.75} y1={svgY} x2={FIELD_WIDTH} y2={svgY} />
          </g>
        );
      })}


      {/* 8. High-Visibility Line of Scrimmage (LOS) Blue Line (#38bdf8) */}
      <g id="los-group">
        {/* Soft underglow */}
        <line
          x1="0"
          y1="0"
          x2={FIELD_WIDTH}
          y2="0"
          stroke="#0284c7"
          strokeWidth="0.8"
          opacity="0.25"
        />
        {/* Crisp core LOS line */}
        <line
          x1="0"
          y1="0"
          x2={FIELD_WIDTH}
          y2="0"
          stroke="#38bdf8"
          strokeWidth="0.28"
          opacity="0.85"
        />

        {/* Sideline Tactical LOS Badges */}
        <g transform="translate(-0.4, 0)">
          <rect x="-2.2" y="-0.55" width="2.1" height="1.1" rx="0.25" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.1" />
          <text
            x="-1.15"
            y="0.28"
            fill="#ffffff"
            fontSize="0.6"
            fontWeight="900"
            fontFamily="'JetBrains Mono', ui-monospace, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.04em"
          >
            LOS
          </text>
        </g>
        <g transform={`translate(${FIELD_WIDTH + 0.5}, 0)`}>
          <rect x="0.1" y="-0.55" width="2.1" height="1.1" rx="0.25" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.1" />
          <text
            x="1.15"
            y="0.28"
            fill="#ffffff"
            fontSize="0.6"
            fontWeight="900"
            fontFamily="'JetBrains Mono', ui-monospace, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.04em"
          >
            LOS
          </text>
        </g>
      </g>

      {/* 9. High-Visibility First Down (1ST) Amber Marker Line (#f59e0b) */}
      <g id="first-down-group">
        {/* Soft underglow */}
        <line
          x1="0"
          y1="-10"
          x2={FIELD_WIDTH}
          y2="-10"
          stroke="#d97706"
          strokeWidth="0.8"
          opacity="0.25"
        />
        {/* Crisp core 1ST line */}
        <line
          x1="0"
          y1="-10"
          x2={FIELD_WIDTH}
          y2="-10"
          stroke="#f59e0b"
          strokeWidth="0.28"
          opacity="0.85"
        />

        {/* Sideline Tactical 1ST Badges */}
        <g transform="translate(-0.4, -10)">
          <rect x="-2.2" y="-0.55" width="2.1" height="1.1" rx="0.25" fill="#b45309" stroke="#f59e0b" strokeWidth="0.1" />
          <text
            x="-1.15"
            y="0.28"
            fill="#ffffff"
            fontSize="0.6"
            fontWeight="900"
            fontFamily="'JetBrains Mono', ui-monospace, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.04em"
          >
            1ST
          </text>
        </g>
        <g transform={`translate(${FIELD_WIDTH + 0.5}, -10)`}>
          <rect x="0.1" y="-0.55" width="2.1" height="1.1" rx="0.25" fill="#b45309" stroke="#f59e0b" strokeWidth="0.1" />
          <text
            x="1.15"
            y="0.28"
            fill="#ffffff"
            fontSize="0.6"
            fontWeight="900"
            fontFamily="'JetBrains Mono', ui-monospace, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.04em"
          >
            1ST
          </text>
        </g>
      </g>

      {/* 12. Dynamic Play Layer (Trails, Conflict Indicators, Players) */}
      {children}
    </svg>
  );
});

