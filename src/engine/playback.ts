import { useState, useRef, useEffect, useCallback } from 'react';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.5;

export interface UsePlaybackReturn {
  t: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  speed: PlaybackSpeed;
  setSpeed: (speed: PlaybackSpeed) => void;
  reset: () => void;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  toggleLoop: () => void;
}

/**
 * Formats seconds into film-room timecode (e.g. 00:01.20).
 */
export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const totalCentis = Math.round(seconds * 100);
  const mins = Math.floor(totalCentis / 6000);
  const secs = Math.floor((totalCentis % 6000) / 100);
  const centis = totalCentis % 100;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
}

/**
 * React hook wrapping requestAnimationFrame for smooth, speed-scaled timeline playback.
 */
export function usePlayback(duration: number, initialLoop = false): UsePlaybackReturn {
  const [t, setT] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [loop, setLoop] = useState<boolean>(initialLoop);

  const tRef = useRef<number>(t);
  const playingRef = useRef<boolean>(playing);
  const speedRef = useRef<PlaybackSpeed>(speed);
  const loopRef = useRef<boolean>(loop);
  const durationRef = useRef<number>(duration);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const pause = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    lastTimeRef.current = null;
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  }, []);

  const seek = useCallback((targetTime: number) => {
    const clamped = Math.max(0, Math.min(targetTime, durationRef.current));
    setT(clamped);
    tRef.current = clamped;
  }, []);

  const play = useCallback(() => {
    if (tRef.current >= durationRef.current) {
      seek(0);
    }
    setPlaying(true);
    playingRef.current = true;
    lastTimeRef.current = null;
  }, [seek]);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const reset = useCallback(() => {
    pause();
    seek(0);
  }, [pause, seek]);

  const toggleLoop = useCallback(() => {
    setLoop((prev) => !prev);
  }, []);

  // If duration changes and current t exceeds it, clamp t
  useEffect(() => {
    if (tRef.current > duration) {
      seek(0);
    }
  }, [duration, seek]);

  useEffect(() => {
    if (!playing) {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const onFrame = (now: number) => {
      if (!playingRef.current) return;

      if (lastTimeRef.current !== null) {
        const deltaSeconds = (now - lastTimeRef.current) / 1000;
        const nextT = tRef.current + deltaSeconds * speedRef.current;

        if (nextT >= durationRef.current) {
          if (loopRef.current) {
            setT(0);
            tRef.current = 0;
            lastTimeRef.current = now;
          } else {
            setT(durationRef.current);
            tRef.current = durationRef.current;
            setPlaying(false);
            playingRef.current = false;
            lastTimeRef.current = null;
            return;
          }
        } else {
          setT(nextT);
          tRef.current = nextT;
        }
      }

      lastTimeRef.current = now;
      animFrameIdRef.current = requestAnimationFrame(onFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(onFrame);

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [playing]);

  return {
    t,
    playing,
    play,
    pause,
    toggle,
    seek,
    speed,
    setSpeed,
    reset,
    loop,
    setLoop,
    toggleLoop,
  };
}
