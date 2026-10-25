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
  id: 'canon-in-d',
  title: 'Nhạc Lễ Cưới: Canon in D',
  subtitle: 'Giai điệu lãng mạn ngày cưới',
  src: '/audio/canon_in_d_piano.mp3',
};

interface FloatingMusicPlayerProps {
  autoPlayTrigger?: boolean;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  autoPlayTrigger,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play audio safely
  const startPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play exception:', err);
      });
    }
  }, [isMuted, volume]);

  // Pause audio safely
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle playback
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, pausePlayback, startPlayback]);

  // Handle single-click (toggle play/pause) and double-click (toggle control panel)
  const handleDiscClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setIsExpanded((prev) => !prev);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        togglePlay();
      }, 260);
    }
  };

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
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol / 100;
    }
  };

  // Handle Mute Toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
      audioRef.current.volume = nextMuted ? 0 : volume / 100;
    }
  };

  // 1. Tự động phát khi khách mở phong bì thư mời cưới
  useEffect(() => {
    if (autoPlayTrigger) {
      startPlayback();
    }
  }, [autoPlayTrigger, startPlayback]);

  // 2. Lắng nghe sự kiện mở thiệp từ component Envelope
  useEffect(() => {
    const handleMusicEvent = () => {
      startPlayback();
    };

    window.addEventListener('wedding-play-music', handleMusicEvent);
    return () => {
      window.removeEventListener('wedding-play-music', handleMusicEvent);
    };
  }, [startPlayback]);

  // 3. Tự động phát nhạc khi khách tương tác lần đầu
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
    <>
      {/* HTML5 Audio element with local mp3 */}
      <audio
        ref={audioRef}
        src={DEFAULT_TRACK.src}
        preload="auto"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
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
                    isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'
                  }`}
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

            {/* Play / Pause Toggle Button */}
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
                max="100"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="h-1.5 flex-1 appearance-none rounded-lg bg-stone-300 accent-[#8B1E22] cursor-pointer"
                aria-label="Thanh điều chỉnh âm lượng"
              />
              <span className="text-[10px] font-mono text-stone-500 w-7 text-right">
                {isMuted ? 0 : volume}%
              </span>
            </div>
          </div>
        )}

        {/* Floating Vinyl Button */}
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
                isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'
              }`}
            >
              <div className="absolute inset-1.5 rounded-full border border-stone-600/40 pointer-events-none" />
              <div className="absolute inset-3 rounded-full border border-stone-600/30 pointer-events-none" />

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

            {isPlaying && (
              <span className="absolute -inset-1 rounded-full border border-[#C5A059]/60 animate-ping pointer-events-none opacity-40" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
