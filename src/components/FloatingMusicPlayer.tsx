import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  X,
} from 'lucide-react';
export { ScrollToTop } from './ScrollToTop';

export const DEFAULT_TRACK = {
  id: 'xung-doi-cuoi-thoi',
  title: 'Nhạc Đám Cưới',
  subtitle: 'Xứng đôi cưới thôi, Ta là của nhau...',
  youtubeId: 'XcfBnQFe4zM',
  fallbackSrc: '/audio/canon_in_d_piano.mp3',
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface FloatingMusicPlayerProps {
  autoPlayTrigger?: boolean;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  autoPlayTrigger,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);

  // Initialize YouTube Player API in background for the single YouTube track
  useEffect(() => {
    let isMounted = true;

    const initYt = () => {
      if (!window.YT || !window.YT.Player || ytPlayerRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('yt-player-wedding-bg', {
          height: '1',
          width: '1',
          videoId: DEFAULT_TRACK.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: DEFAULT_TRACK.youtubeId,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              try {
                event.target.setVolume(Math.round(volume * 100));
                if (isMuted) event.target.mute();
              } catch {}
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              if (event.data === 1) {
                // Playing
                setIsPlaying(true);
                if (audioRef.current) {
                  audioRef.current.pause();
                }
              } else if (event.data === 2) {
                // Paused
                setIsPlaying(false);
              } else if (event.data === 0) {
                // Loop single track
                try {
                  event.target.playVideo();
                } catch {}
              }
            },
            onError: () => {
              // fallback handled automatically
            },
          },
        });
      } catch (e) {
        console.warn('YT init note:', e);
      }
    };

    if (window.YT && window.YT.Player) {
      initYt();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        initYt();
      };

      if (!document.getElementById('yt-script-tag')) {
        const script = document.createElement('script');
        script.id = 'yt-script-tag';
        script.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(script, firstScript);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Safe playback start
  const startPlayback = useCallback(() => {
    setHasUserInteracted(true);
    setIsPlaying(true);

    let ytStarted = false;
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try {
        ytPlayerRef.current.playVideo();
        ytStarted = true;
      } catch {
        ytStarted = false;
      }
    }

    if (!ytStarted && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch(() => {});
    }
  }, [isMuted, volume]);

  // Safe playback pause
  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nhấn 1 lần: tắt / mở nhạc. Nhấn 2 lần: mở / đóng bảng điều khiển
  const handleDiscClick = () => {
    if (clickTimeoutRef.current) {
      // Nhấn lần 2 trong 280ms -> Mở / đóng bảng điều khiển
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setIsExpanded((prev) => !prev);
    } else {
      // Nhấn lần 1 -> chờ xem có nhấn lần 2 không, nếu không thì tắt / mở nhạc
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        togglePlay();
      }, 280);
    }
  };

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Handle Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);

    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(Math.round(newVol * 100));
        if (newVol > 0 && typeof ytPlayerRef.current.unMute === 'function') {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    }

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
  };

  // Handle Mute Toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (ytPlayerRef.current) {
      try {
        if (nextMuted && typeof ytPlayerRef.current.mute === 'function') {
          ytPlayerRef.current.mute();
        } else if (!nextMuted && typeof ytPlayerRef.current.unMute === 'function') {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(Math.round(volume * 100));
        }
      } catch {}
    }

    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  // 1. Tự động phát khi khách mở phong bì thiệp mời cưới
  useEffect(() => {
    if (autoPlayTrigger && !isPlaying) {
      startPlayback();
    }
  }, [autoPlayTrigger, isPlaying, startPlayback]);

  // 2. Lắng nghe sự kiện mở thiệp cưới từ component Envelope
  useEffect(() => {
    const handleMusicEvent = () => {
      if (!isPlaying) {
        startPlayback();
      }
    };

    window.addEventListener('wedding-play-music', handleMusicEvent);
    return () => {
      window.removeEventListener('wedding-play-music', handleMusicEvent);
    };
  }, [isPlaying, startPlayback]);

  // 3. Tự động phát nhạc khi khách tương tác lần đầu (chạm / click bất kỳ đâu trên trang)
  useEffect(() => {
    const handleFirstGesture = () => {
      if (!isPlaying) {
        startPlayback();
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
    };
  }, [isPlaying, startPlayback]);

  return (
    <>
      {/* Hidden YouTube Background Audio Element */}
      <div
        id="yt-player-wedding-bg"
        className="w-[1px] h-[1px] opacity-0 overflow-hidden absolute pointer-events-none -left-[9999px]"
        aria-hidden="true"
      />

      {/* Hidden Native Audio Element Fallback */}
      <audio
        ref={audioRef}
        src={DEFAULT_TRACK.fallbackSrc}
        preload="auto"
        loop
      />

      {/* Floating Music Player Controls at bottom-left corner */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start select-none font-display">
        {/* Expanded Controller Panel */}
        {isExpanded && (
          <div
            className="mb-3 w-72 sm:w-80 rounded-2xl border border-[#C5A059]/60 bg-[#FAF6EE]/95 backdrop-blur-md p-4 text-[#2D2319] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
            style={{
              boxShadow:
                '0 12px 30px -4px rgba(139, 30, 34, 0.18), 0 4px 14px rgba(197, 160, 89, 0.22)',
            }}
          >
            {/* Header: Title is "Bảng điều khiển" */}
            <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/20">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#8B1E22]">
                <Music className="h-3.5 w-3.5 text-[#8B1E22] animate-pulse" />
                <span>Bảng điều khiển</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-full p-1 text-stone-400 hover:text-[#8B1E22] hover:bg-[#FAF0DC] transition-colors"
                aria-label="Đóng bảng điều khiển"
                title="Đóng bảng điều khiển"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Song Details */}
            <div className="py-3">
              <div className="flex items-center gap-3">
                {/* Mini Vinyl Record Visual */}
                <div
                  className={`relative flex-shrink-0 h-11 w-11 rounded-full border-2 border-[#C5A059] bg-[#1a1412] flex items-center justify-center shadow-md transition-all ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4.5s' }}
                >
                  <div className="absolute inset-1 rounded-full border border-stone-600/40 pointer-events-none" />
                  <div className="h-3.5 w-3.5 rounded-full bg-[#FAF6EE] border border-[#8B1E22] flex items-center justify-center">
                    <span className="block h-1 w-1 rounded-full bg-[#8B1E22]" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#8B1E22] truncate">
                    {DEFAULT_TRACK.title}
                  </h4>
                  <p className="text-xs text-stone-600 truncate">
                    {DEFAULT_TRACK.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Play / Pause Toggle Button (Chỉ để biểu tượng, không kèm chữ) */}
            <div className="flex items-center justify-center py-2 border-t border-[#C5A059]/15">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
                className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#8B1E22] to-[#A3282D] text-[#FAF6EE] shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Volume & Mute Controls */}
            <div className="pt-2 border-t border-[#C5A059]/15 flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-stone-500 hover:text-[#8B1E22] transition-colors p-1"
                title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
                aria-label={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-stone-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#8B1E22]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="h-1.5 flex-1 appearance-none rounded-lg bg-stone-300 accent-[#8B1E22] cursor-pointer"
                aria-label="Thanh điều chỉnh âm lượng"
              />
              <span className="text-[10px] font-mono text-stone-500 w-7 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Floating Vinyl Button: ONLY 1 round vinyl disc button (integrates control panel) */}
        <div className="relative group">
          <button
            onClick={handleDiscClick}
            aria-label={isPlaying ? 'Nhấn 1 lần: Tạm dừng • Nhấn 2 lần: Bảng điều khiển' : 'Nhấn 1 lần: Bật nhạc • Nhấn 2 lần: Bảng điều khiển'}
            title="Nhấn 1 lần: Tắt/mở nhạc • Nhấn 2 lần: Mở bảng điều khiển"
            className="relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border-2 border-[#C5A059] bg-[#FAF6EE] shadow-xl transition-all duration-300 hover:scale-105 hover:border-[#8B1E22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E22]"
            style={{
              boxShadow: isPlaying
                ? '0 0 20px rgba(197, 160, 89, 0.45), 0 8px 16px rgba(139, 30, 34, 0.2)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Vinyl Disc Rotating Layer */}
            <div
              className={`absolute inset-1 rounded-full bg-gradient-to-tr from-[#1a1412] via-[#3d2e24] to-[#1a1412] flex items-center justify-center overflow-hidden transition-transform ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4.5s' }}
            >
              {/* Vinyl Grooves concentric rings */}
              <div className="absolute inset-1.5 rounded-full border border-stone-600/40 pointer-events-none" />
              <div className="absolute inset-3 rounded-full border border-stone-600/30 pointer-events-none" />

              {/* Center Golden Label */}
              <div className="h-4.5 w-4.5 rounded-full bg-[#FAF6EE] border border-[#C5A059] flex items-center justify-center shadow-inner">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8B1E22]" />
              </div>
            </div>

            {/* Foreground Visualizer Indicator / Equalizer */}
            <div className="relative z-10 flex items-center justify-center">
              {isPlaying ? (
                <div className="flex items-center gap-0.5 px-1 py-0.5 bg-[#8B1E22]/90 rounded-full text-[#FAF6EE] shadow">
                  <span
                    className="h-2.5 w-0.5 bg-white animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-3.5 w-0.5 bg-white animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-2 w-0.5 bg-white animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-[#8B1E22]/90 flex items-center justify-center text-[#FAF6EE] shadow">
                  <Music className="h-3 w-3 text-[#FAF6EE]" />
                </div>
              )}
            </div>

            {/* Pulsing Aura Ring when Playing */}
            {isPlaying && (
              <span className="absolute -inset-1 rounded-full border border-[#C5A059]/60 animate-ping pointer-events-none opacity-40" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
