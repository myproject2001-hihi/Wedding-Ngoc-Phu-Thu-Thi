import React, { useEffect, useRef, useCallback } from 'react';

export const WEDDING_AUDIO_SRC = '/audio/wedding_music.mp3';

interface BackgroundWeddingMusicProps {
  autoPlayTrigger?: boolean;
}

export const BackgroundWeddingMusic: React.FC<BackgroundWeddingMusicProps> = ({
  autoPlayTrigger,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  // Start background playback safely for uploaded wedding mp3
  const startPlayback = useCallback(() => {
    hasStartedRef.current = true;

    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio element play exception:', err);
      });
    }
  }, []);

  // Trigger playback when envelope opens
  useEffect(() => {
    if (autoPlayTrigger) {
      startPlayback();
    }
  }, [autoPlayTrigger, startPlayback]);

  // Listen to custom envelope open event
  useEffect(() => {
    const handleMusicEvent = () => {
      startPlayback();
    };

    window.addEventListener('wedding-play-music', handleMusicEvent);
    return () => {
      window.removeEventListener('wedding-play-music', handleMusicEvent);
    };
  }, [startPlayback]);

  // Trigger playback on first user gesture anywhere on page (click / touch)
  useEffect(() => {
    const handleFirstGesture = () => {
      startPlayback();
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
    };
  }, [startPlayback]);

  return (
    <div className="sr-only pointer-events-none opacity-0 invisible" aria-hidden="true">
      <audio
        ref={audioRef}
        src={WEDDING_AUDIO_SRC}
        preload="auto"
        loop
        playsInline
      >
        <source src={WEDDING_AUDIO_SRC} type="audio/mpeg" />
        <source src="/audio/wedding_music.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};
