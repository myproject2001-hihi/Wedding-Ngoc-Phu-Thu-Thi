import React, { useEffect } from 'react';
import { playWeddingMusic } from '../utils/weddingAudio';

export const WEDDING_AUDIO_SRC = '/audio/wedding_music.mp3';

interface BackgroundWeddingMusicProps {
  autoPlayTrigger?: boolean;
}

/**
 * Proxy component to maintain backward-compatibility while routing
 * all audio commands to the centralized, bulletproof weddingAudio controller.
 */
export const BackgroundWeddingMusic: React.FC<BackgroundWeddingMusicProps> = ({
  autoPlayTrigger,
}) => {
  useEffect(() => {
    if (autoPlayTrigger) {
      playWeddingMusic().catch(() => {});
    }
  }, [autoPlayTrigger]);

  return null;
};

