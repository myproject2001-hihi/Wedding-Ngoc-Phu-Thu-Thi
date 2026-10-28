// Centralized, bulletproof Wedding Audio Controller
// Handles browser autoplay policies, synchronous user-gesture playback, GitHub CDN, and state synchronization
import { getActiveAudioUrl, defaultMediaConfig } from '../data/mediaConfig';

export interface WeddingAudioState {
  isPlaying: boolean;
  volume: number; // 0 - 100
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  hasError: boolean;
  activeUrl: string;
}

let audioInstance: HTMLAudioElement | null = null;
let currentVolume = 80;
let isMuted = false;
let isPlaying = false;
let currentTime = 0;
let duration = 2233.75; // 37m 13s default
let isBuffering = false;
let hasError = false;
let userHasPaused = false;
let currentSourceIndex = 0;

const listeners: Set<(state: WeddingAudioState) => void> = new Set();

function getSourcesList(): string[] {
  const primary = getActiveAudioUrl();
  const fallbacks = defaultMediaConfig.fallbackAudioUrls;
  const list = [primary, ...fallbacks.filter((u) => u !== primary)];
  return list;
}

function notifyListeners() {
  const state: WeddingAudioState = {
    isPlaying,
    volume: currentVolume,
    isMuted,
    currentTime,
    duration,
    isBuffering,
    hasError,
    activeUrl: audioInstance?.src || getActiveAudioUrl(),
  };
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.warn('Audio listener error:', e);
    }
  });
}

/**
 * Returns the persistent Audio singleton instance with all event handlers attached once.
 */
export function getAudioElement(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    return {} as HTMLAudioElement;
  }

  if (!audioInstance) {
    audioInstance = new Audio();
    const sources = getSourcesList();
    audioInstance.src = sources[0];
    audioInstance.preload = 'auto';
    audioInstance.loop = true;

    try {
      audioInstance.volume = currentVolume / 100;
      audioInstance.muted = isMuted;
    } catch {}

    audioInstance.addEventListener('play', () => {
      isPlaying = true;
      isBuffering = false;
      notifyListeners();
    });

    audioInstance.addEventListener('playing', () => {
      isPlaying = true;
      isBuffering = false;
      notifyListeners();
    });

    audioInstance.addEventListener('pause', () => {
      isPlaying = false;
      notifyListeners();
    });

    audioInstance.addEventListener('waiting', () => {
      isBuffering = true;
      notifyListeners();
    });

    audioInstance.addEventListener('canplay', () => {
      isBuffering = false;
      notifyListeners();
    });

    audioInstance.addEventListener('timeupdate', () => {
      if (audioInstance) {
        currentTime = audioInstance.currentTime;
        notifyListeners();
      }
    });

    audioInstance.addEventListener('loadedmetadata', () => {
      if (audioInstance && audioInstance.duration && !isNaN(audioInstance.duration)) {
        duration = audioInstance.duration;
        notifyListeners();
      }
    });

    audioInstance.addEventListener('error', (e) => {
      console.warn('Audio failed to load from current source, attempting fallback:', e);
      if (!audioInstance) return;

      const sources = getSourcesList();
      currentSourceIndex++;
      if (currentSourceIndex < sources.length) {
        audioInstance.src = sources[currentSourceIndex];
        audioInstance.load();
        if (isPlaying) {
          audioInstance.play().catch(() => {});
        }
      } else {
        hasError = true;
        isPlaying = false;
        notifyListeners();
      }
    });
  }

  return audioInstance;
}

/**
 * Cho phép đổi link nhạc trực tiếp (vd: dán link GitHub MP3 từ giao diện Admin)
 */
export function setCustomAudioUrl(newUrl: string): void {
  const cleanUrl = newUrl.trim();
  if (typeof window !== 'undefined') {
    if (cleanUrl) {
      localStorage.setItem('wedding_custom_audio_url', cleanUrl);
    } else {
      localStorage.removeItem('wedding_custom_audio_url');
    }
  }

  const audio = getAudioElement();
  if (audio) {
    const wasPlaying = isPlaying;
    currentSourceIndex = 0;
    audio.src = cleanUrl || getActiveAudioUrl();
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
    notifyListeners();
  }
}

/**
 * Synchronously start playing wedding music.
 * Must be called directly on user gesture (click/touch/envelope open) for maximum browser compliance.
 */
export function playWeddingMusic(): Promise<void> {
  const audio = getAudioElement();
  if (!audio) return Promise.resolve();

  userHasPaused = false;
  hasError = false;

  try {
    audio.muted = isMuted;
    if (!isMuted) {
      audio.volume = currentVolume / 100;
    }
  } catch {}

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    return playPromise
      .then(() => {
        isPlaying = true;
        notifyListeners();
      })
      .catch((err) => {
        console.warn('Audio play request awaiting user gesture:', err);
        notifyListeners();
      });
  }

  return Promise.resolve();
}

/**
 * Pause wedding music
 */
export function pauseWeddingMusic(): void {
  const audio = getAudioElement();
  if (!audio) return;
  userHasPaused = true;
  audio.pause();
  isPlaying = false;
  notifyListeners();
}

/**
 * Toggle wedding music playback synchronously
 */
export function toggleWeddingMusic(): void {
  const audio = getAudioElement();
  if (!audio) return;

  if (audio.paused || !isPlaying) {
    playWeddingMusic();
  } else {
    pauseWeddingMusic();
  }
}

/**
 * Seek to specific time in seconds
 */
export function seekWeddingMusic(timeInSeconds: number): void {
  const audio = getAudioElement();
  if (!audio) return;
  const targetTime = Math.max(0, Math.min(timeInSeconds, duration || 2233.75));
  audio.currentTime = targetTime;
  currentTime = targetTime;
  notifyListeners();
}

/**
 * Skip forward or backward by seconds (e.g. +15 or -15)
 */
export function skipWeddingMusic(deltaSeconds: number): void {
  const audio = getAudioElement();
  if (!audio) return;
  const targetTime = Math.max(0, Math.min(audio.currentTime + deltaSeconds, duration || 2233.75));
  audio.currentTime = targetTime;
  currentTime = targetTime;
  notifyListeners();
}

/**
 * Set volume (0 to 100)
 */
export function setWeddingMusicVolume(vol: number): void {
  const audio = getAudioElement();
  currentVolume = Math.max(0, Math.min(100, vol));
  if (isMuted && currentVolume > 0) {
    isMuted = false;
  }

  if (audio) {
    try {
      audio.muted = isMuted;
      audio.volume = isMuted ? 0 : currentVolume / 100;
    } catch {}
  }

  notifyListeners();
}

/**
 * Toggle or set mute
 */
export function setWeddingMusicMuted(mute?: boolean): void {
  const audio = getAudioElement();
  isMuted = mute !== undefined ? mute : !isMuted;

  if (audio) {
    try {
      audio.muted = isMuted;
      if (!isMuted) {
        audio.volume = currentVolume / 100;
      }
    } catch {}
  }

  notifyListeners();
}

/**
 * Subscribe to audio state changes
 */
export function subscribeWeddingAudio(
  listener: (state: WeddingAudioState) => void
): () => void {
  listeners.add(listener);
  // Send current state immediately
  listener({
    isPlaying,
    volume: currentVolume,
    isMuted,
    currentTime,
    duration,
    isBuffering,
    hasError,
    activeUrl: audioInstance?.src || getActiveAudioUrl(),
  });

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Global unlock on any user interaction with the document (tap, click, scroll, touch)
 */
let gestureListenerRegistered = false;
export function initFirstGestureAudioUnlock(): () => void {
  if (typeof window === 'undefined' || gestureListenerRegistered) {
    return () => {};
  }
  gestureListenerRegistered = true;

  const unlockHandler = () => {
    // Only auto-play on first gesture if user hasn't deliberately paused
    if (!userHasPaused && (!audioInstance || audioInstance.paused)) {
      playWeddingMusic().catch(() => {});
    }
  };

  const onceOptions: AddEventListenerOptions = { capture: true, once: true };

  window.addEventListener('click', unlockHandler, onceOptions);
  window.addEventListener('touchstart', unlockHandler, onceOptions);
  window.addEventListener('pointerdown', unlockHandler, onceOptions);
  document.addEventListener('click', unlockHandler, onceOptions);
  document.addEventListener('touchstart', unlockHandler, onceOptions);

  return () => {
    const options: AddEventListenerOptions = { capture: true };
    window.removeEventListener('click', unlockHandler, options);
    window.removeEventListener('touchstart', unlockHandler, options);
    window.removeEventListener('pointerdown', unlockHandler, options);
    document.removeEventListener('click', unlockHandler, options);
    document.removeEventListener('touchstart', unlockHandler, options);
  };
}
