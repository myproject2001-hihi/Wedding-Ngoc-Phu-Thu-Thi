// Centralized, bulletproof Wedding Audio Controller
// Handles browser autoplay policies, synchronous user-gesture playback, device-specific triggers, 5s fallback, and pause memory
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

const USER_PAUSED_STORAGE_KEY = 'wedding_user_paused_music';

let audioInstance: HTMLAudioElement | null = null;
let currentVolume = 80;
let isMuted = false;
let isPlaying = false;
let currentTime = 0;
let duration = 2233.75; // 37m 13s default
let isBuffering = false;
let hasError = false;

// Check if user previously paused music in this session to respect their preference
let userHasPaused = false;
if (typeof window !== 'undefined') {
  try {
    userHasPaused = sessionStorage.getItem(USER_PAUSED_STORAGE_KEY) === 'true';
  } catch {}
}

let currentSourceIndex = 0;
let fiveSecondTimerId: ReturnType<typeof setTimeout> | null = null;
let gestureListenerRegistered = false;
let removeGestureListeners: (() => void) | null = null;

const listeners: Set<(state: WeddingAudioState) => void> = new Set();

export function isWeddingMusicUserPaused(): boolean {
  return userHasPaused;
}

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
 * Primes the mobile audio subsystem (iOS Safari & Android WebViews)
 * on direct user touch gesture so that media playback isn't blocked.
 */
function primeMobileAudioSubsystem() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const tempCtx = new AudioCtx();
      if (tempCtx.state === 'suspended') {
        tempCtx.resume().catch(() => {});
      }
      const buffer = tempCtx.createBuffer(1, 1, 22050);
      const source = tempCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(tempCtx.destination);
      source.start(0);
      setTimeout(() => {
        if (tempCtx.state !== 'closed') {
          tempCtx.close().catch(() => {});
        }
      }, 500);
    }
  } catch {}
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
 * Hủy bỏ bộ hẹn giờ phát nhạc sau 5 giây nếu người dùng đã tương tác trước đó
 */
function clearFiveSecondTimer(): void {
  if (fiveSecondTimerId) {
    clearTimeout(fiveSecondTimerId);
    fiveSecondTimerId = null;
  }
}

/**
 * Synchronously start playing wedding music.
 * Must be called directly on user gesture (click/touch/envelope open) for maximum browser compliance.
 */
export function playWeddingMusic(): Promise<void> {
  const audio = getAudioElement();
  if (!audio) return Promise.resolve();

  // Reset user-paused flag since the user explicitly requested or authorized playback
  userHasPaused = false;
  hasError = false;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(USER_PAUSED_STORAGE_KEY);
    } catch {}
  }

  // Clear 5s fallback timer since audio is now playing
  clearFiveSecondTimer();

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
        throw err;
      });
  }

  isPlaying = true;
  notifyListeners();
  return Promise.resolve();
}

/**
 * Pause wedding music.
 * Tôn trọng người dùng: Ghi nhớ trạng thái tạm dừng trong sessionStorage,
 * ngăn hệ thống tự động bật lại khi khách tiếp tục lướt / vuốt trang.
 */
export function pauseWeddingMusic(): void {
  const audio = getAudioElement();
  userHasPaused = true;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(USER_PAUSED_STORAGE_KEY, 'true');
    } catch {}
  }

  // Hủy hẹn giờ 5s nếu khách bấm tạm dừng sớm
  clearFiveSecondTimer();

  // Dọn dẹp listener tự động bật lại để tôn trọng quyết định của khách
  if (removeGestureListeners) {
    removeGestureListeners();
  }

  if (audio) {
    audio.pause();
  }
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
    playWeddingMusic().catch(() => {});
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
 * Kích hoạt logic tự động phát nhạc sau 5 giây nếu người dùng chưa có bất kỳ thao tác nào:
 * - Sau 5s kể từ khi tải trang, hệ thống sẽ tự động gọi playWeddingMusic().
 * - Nếu khách đã bấm Tạm dừng trước đó, sẽ KHÔNG phát (tôn trọng người dùng).
 * - Nếu người dùng đã chạm/lăn chuột trước đó, bộ đếm đã được hủy và nhạc đã bật từ thao tác đó.
 */
export function startFiveSecondAutoplayTimer(): void {
  if (typeof window === 'undefined') return;
  if (fiveSecondTimerId) return;

  fiveSecondTimerId = setTimeout(() => {
    fiveSecondTimerId = null;

    // Tôn trọng người dùng: Nếu khách bấm Tạm dừng, không bật lại
    if (userHasPaused) return;

    // Nếu nhạc đã đang phát rồi thì không cần làm gì
    if (isPlaying || (audioInstance && !audioInstance.paused)) return;

    // Tự động phát nhạc sau 5 giây
    playWeddingMusic()
      .then(() => {
        // Tự động phát thành công sau 5s
        if (removeGestureListeners) {
          removeGestureListeners();
        }
      })
      .catch((err) => {
        // Trong trường hợp trình duyệt chặn tuyệt đối autoplay khi chưa có user gesture,
        // các listener thao tác vuốt/lăn chuột vẫn tiếp tục hoạt động để bật ngay khi khách chạm màn hình.
        console.info('[WeddingAudio] 5s auto-play waiting for first touch/scroll gesture:', err?.message || err);
      });
  }, 5000);
}

/**
 * Cơ chế kích hoạt trên từng thiết bị:
 * 1. Trên điện thoại (iOS / Android):
 *    - Khi vuốt ngón tay để lướt trang, thao tác chạm tay (touchstart / touchmove)
 *      ngay lập tức mở khóa âm thanh theo tiêu chuẩn trình duyệt di động và nhạc vang lên ngay lập tức.
 * 2. Trên máy tính (Desktop):
 *    - Khi lăn chuột (wheel / scroll) hoặc bấm chạm bất kỳ điểm nào (click / pointerdown / mousedown),
 *      nhạc sẽ tự động bật.
 * 3. Tôn trọng người dùng:
 *    - Nếu khách bấm Tạm dừng, hệ thống ghi nhớ (sessionStorage) và không tự bật lại khi tiếp tục lướt trang.
 * 4. Tự động phát sau 5 giây nếu chưa nhận được tương tác kích hoạt.
 */
export function initFirstGestureAudioUnlock(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Khởi động bộ đếm 5 giây tự động phát nếu chưa chạy
  startFiveSecondAutoplayTimer();

  // Nếu người dùng đã bấm Tạm dừng từ trước trong phiên, không kích hoạt tự phát trên thao tác cuộn
  if (userHasPaused) {
    clearFiveSecondTimer();
    return () => {};
  }

  if (gestureListenerRegistered && removeGestureListeners) {
    return removeGestureListeners;
  }

  gestureListenerRegistered = true;

  // Danh sách sự kiện đa thiết bị:
  // - Mobile: touchstart, touchmove, touchend
  // - Desktop: wheel, scroll, click, pointerdown, mousedown, keydown
  const mobileEvents = ['touchstart', 'touchmove', 'touchend'];
  const desktopEvents = ['wheel', 'scroll', 'click', 'pointerdown', 'mousedown', 'keydown'];
  const allEvents = [...mobileEvents, ...desktopEvents];

  const cleanup = () => {
    const options: AddEventListenerOptions = { capture: true };
    allEvents.forEach((evt) => {
      window.removeEventListener(evt, unlockHandler, options);
      document.removeEventListener(evt, unlockHandler, options);
    });
    gestureListenerRegistered = false;
    removeGestureListeners = null;
  };

  const unlockHandler = (evt: Event) => {
    // 1. Tôn trọng người dùng: Nếu khách bấm Tạm dừng, không tự bật lại
    if (userHasPaused) {
      clearFiveSecondTimer();
      cleanup();
      return;
    }

    // 2. Nếu là thao tác trên di động (touchstart / touchmove), mở khóa ngay AudioContext của di động
    if (evt.type === 'touchstart' || evt.type === 'touchmove') {
      primeMobileAudioSubsystem();
    }

    // 3. Nếu nhạc chưa phát, kích hoạt phát nhạc ngay lập tức
    if (!audioInstance || audioInstance.paused || !isPlaying) {
      playWeddingMusic()
        .then(() => {
          clearFiveSecondTimer();
          if (isPlaying) {
            cleanup();
          }
        })
        .catch(() => {
          // Nếu trình duyệt còn chặn, giữ listener để lần tương tác kế tiếp thử lại
        });
    } else {
      clearFiveSecondTimer();
      cleanup();
    }
  };

  const options: AddEventListenerOptions = { capture: true, passive: true };

  allEvents.forEach((evt) => {
    window.addEventListener(evt, unlockHandler, options);
    document.addEventListener(evt, unlockHandler, options);
  });

  removeGestureListeners = cleanup;
  return cleanup;
}

// Tự động nạp sẵn audio và cài đặt cơ chế kích hoạt ngay khi trang sẵn sàng
if (typeof window !== 'undefined') {
  const initAudio = () => {
    try {
      getAudioElement();
      initFirstGestureAudioUnlock();
    } catch {}
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initAudio, { once: true });
  } else {
    initAudio();
  }
}

