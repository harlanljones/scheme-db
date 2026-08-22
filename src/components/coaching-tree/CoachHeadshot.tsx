import React, { useState } from 'react';
import { COACH_HEADSHOTS } from '../../data/coaches/headshots';

interface CoachHeadshotProps {
  coachId: string;
  name: string;
  size: number;
  isRoot?: boolean;
  category?: 'offense' | 'defense';
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const CoachHeadshot: React.FC<CoachHeadshotProps> = ({
  coachId,
  name,
  size,
  isRoot = false,
  category = 'offense',
}) => {
  const [failed, setFailed] = useState(false);
  const url = COACH_HEADSHOTS[coachId];
  const showPhoto = url !== undefined && !failed;

  const accent = category === 'offense' ? '#38bdf8' : '#c084fc';

  return (
    <div
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        flexShrink: 0,
        overflow: 'hidden',
        border: `2px solid ${isRoot ? accent : 'rgba(51, 65, 85, 0.9)'}`,
        boxShadow: isRoot
          ? `0 0 10px ${category === 'offense' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(192, 132, 252, 0.45)'}`
          : 'none',
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {showPhoto ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            fontSize: `${Math.round(size * 0.38)}px`,
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: isRoot ? accent : '#94a3b8',
            userSelect: 'none',
          }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
