import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  X,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import {
  subscribeWeddingAudio,
  playWeddingMusic,
  toggleWeddingMusic,
  seekWeddingMusic,
  skipWeddingMusic,
  setWeddingMusicVolume,
  setWeddingMusicMuted,
  initFirstGestureAudioUnlock,
  WeddingAudioState,
} from '../utils/weddingAudio';

export { ScrollToTop } from './ScrollToTop';

export const TRACK_INFO = {
  title: 'Nhạc Đám Cưới Việt Nam',
  subtitle: 'Xứng đôi cưới thôi • Ta là của nhau • Giao Hưởng Tân Thời',
};

interface FloatingMusicPlayerProps {
  autoPlayTrigger?: boolean;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  autoPlayTrigger,
}) => {
  const [audioState, setAudioState] = useState<WeddingAudioState>({
    isPlaying: false,
    volume: 80,
    isMuted: false,
    currentTime: 0,
    duration: 2233.75, // 37m 13s
    isBuffering: false,
    hasError: false,
    activeUrl: '',
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to central wedding audio state
  useEffect(() => {
    const unsubscribe = subscribeWeddingAudio((newState) => {
      setAudioState(newState);
    });

    // Automatically register first user gesture unlock (click, touch, pointerdown)
    const cleanupGesture = initFirstGestureAudioUnlock();

    return () => {
      unsubscribe();
      cleanupGesture();
    };
  }, []);

  // Format seconds into mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Tự động phát khi khách bấm "Mở Thiệp Mừng"
  useEffect(() => {
    if (autoPlayTrigger) {
      playWeddingMusic().catch(() => {});
    }
  }, [autoPlayTrigger]);

  // 2. Lắng nghe sự kiện mở thiệp từ component Envelope
  useEffect(() => {
    const handleMusicEvent = () => {
      playWeddingMusic().catch(() => {});
    };

    window.addEventListener('wedding-play-music', handleMusicEvent);
    return () => {
      window.removeEventListener('wedding-play-music', handleMusicEvent);
    };
  }, []);

  /**
   * Bấm 1 lần: Bật / Tắt tạm dừng nhạc.
   * Bấm đúp (2 lần liên tiếp): Mở / Đóng bảng điều khiển chi tiết.
   */
  const handleDiscClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // Đợi 280ms để phân biệt bấm 1 lần hay bấm đúp 2 lần
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        clickTimerRef.current = null;
        // Bấm 1 lần -> Bật / Tắt tạm dừng nhạc
        toggleWeddingMusic();
      }, 280);
    } else if (clickCountRef.current >= 2) {
      // Bấm đúp 2 lần -> Hủy lệnh bấm đơn, Mở / Đóng bảng điều khiển chi tiết
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      clickCountRef.current = 0;
      setIsExpanded((prev) => !prev);
    }
  };

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const { isPlaying, volume, isMuted, currentTime, duration, isBuffering } = audioState;

  return (
    <aside
      aria-label="Trình phát nhạc đám cưới"
      className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-50 flex flex-col items-start select-none font-display pointer-events-auto"
    >
      {/* 1. Bảng điều khiển chi tiết (Mở khi bấm đúp 2 lần vào đĩa than) */}
      {isExpanded && (
        <div
          role="dialog"
          aria-label="Bảng điều khiển nhạc"
          className="mb-3 w-80 sm:w-92 rounded-2xl border-2 border-[#C5A059]/70 bg-[#FAF6EE]/98 backdrop-blur-md p-4 sm:p-5 text-[#2D2319] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
          style={{
            boxShadow:
              '0 16px 40px -4px rgba(139, 30, 34, 0.22), 0 6px 20px rgba(197, 160, 89, 0.28)',
          }}
        >
          {/* Tiêu đề & nút đóng bảng điều khiển */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#C5A059]/30">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#8B1E22]">
              <Music className={`h-4 w-4 text-[#8B1E22] ${isPlaying ? 'animate-bounce' : ''}`} />
              <span className="font-caps uppercase tracking-wider">Bảng Điều Khiển Nhạc</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="rounded-full p-1.5 text-stone-500 hover:text-[#8B1E22] hover:bg-[#FAF0DC] transition-colors cursor-pointer"
              aria-label="Đóng bảng điều khiển"
              title="Đóng bảng điều khiển"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Thông tin bài hát & Đĩa than mini xoay */}
          <div className="py-3">
            <div className="flex items-center gap-3">
              <div
                className={`relative flex-shrink-0 h-13 w-13 rounded-full border-2 border-[#C5A059] bg-[#1a1412] flex items-center justify-center shadow-md transition-all ${
                  isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'
                }`}
              >
                <div className="absolute inset-1 rounded-full border border-stone-600/40 pointer-events-none" />
                <div className="absolute inset-2.5 rounded-full border border-stone-600/30 pointer-events-none" />
                <div className="h-4.5 w-4.5 rounded-full bg-[#FAF6EE] border border-[#8B1E22] flex items-center justify-center shadow-inner">
                  <span className="block h-1.5 w-1.5 rounded-full bg-[#8B1E22]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'
                    }`}
                  />
                  <span className="text-[10px] font-caps uppercase tracking-wider text-stone-500 font-semibold">
                    {isPlaying ? 'Đang phát' : isBuffering ? 'Đang tải...' : 'Tạm dừng'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#8B1E22] truncate mt-0.5">
                  {TRACK_INFO.title}
                </h4>
                <p className="text-xs text-stone-600 truncate mt-0.5">
                  {TRACK_INFO.subtitle}
                </p>
              </div>
            </div>

            {/* Thanh tua thời gian bài hát (Interactive Scrubber với dây đỏ đã chạy qua) */}
            <div className="mt-3.5 pt-1">
              {(() => {
                const totalDur = duration || 2233.75;
                const progressPct = totalDur > 0 ? Math.min(100, Math.max(0, (currentTime / totalDur) * 100)) : 0;
                return (
                  <input
                    type="range"
                    min="0"
                    max={totalDur}
                    step="1"
                    value={currentTime}
                    onChange={(e) => seekWeddingMusic(parseFloat(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #8B1E22 0%, #8B1E22 ${progressPct}%, #E5E7EB ${progressPct}%, #E5E7EB 100%)`,
                    }}
                    className="w-full h-2 appearance-none rounded-lg accent-[#8B1E22] cursor-pointer shadow-xs focus:outline-none transition-all [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent"
                    aria-label="Thanh tua thời gian bài hát"
                  />
                );
              })()}
              <div className="flex justify-between text-[11px] font-mono text-stone-600 mt-1.5 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span className="text-stone-400">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Các nút điều khiển: Tua lùi 15s, Play/Pause to tròn, Tua tới 15s */}
          <div className="flex items-center justify-center gap-4 py-2 border-t border-[#C5A059]/20">
            <button
              onClick={() => skipWeddingMusic(-15)}
              aria-label="Tua lại 15 giây"
              title="Tua lại 15 giây"
              className="p-2 text-stone-600 hover:text-[#8B1E22] hover:bg-[#FAF0DC] rounded-full transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={() => toggleWeddingMusic()}
              aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
              className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#8B1E22] via-[#A3282D] to-[#8B1E22] text-[#FAF6EE] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border border-[#C5A059]/60 cursor-pointer"
              title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skipWeddingMusic(15)}
              aria-label="Tua tới 15 giây"
              title="Tua tới 15 giây"
              className="p-2 text-stone-600 hover:text-[#8B1E22] hover:bg-[#FAF0DC] rounded-full transition-colors cursor-pointer"
            >
              <RotateCw className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Tăng giảm âm lượng và nút Tắt / Bật tiếng */}
          <div className="pt-2.5 border-t border-[#C5A059]/20 flex items-center gap-2.5">
            <button
              onClick={() => setWeddingMusicMuted()}
              className="text-stone-600 hover:text-[#8B1E22] transition-colors p-1 cursor-pointer"
              title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
              aria-label={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4.5 w-4.5 text-stone-400" />
              ) : (
                <Volume2 className="h-4.5 w-4.5 text-[#8B1E22]" />
              )}
            </button>

            {(() => {
              const volPct = isMuted ? 0 : Math.min(100, Math.max(0, volume));
              return (
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setWeddingMusicVolume(parseInt(e.target.value, 10))}
                  style={{
                    background: `linear-gradient(to right, #8B1E22 0%, #8B1E22 ${volPct}%, #E5E7EB ${volPct}%, #E5E7EB 100%)`,
                  }}
                  className="h-2 flex-1 appearance-none rounded-lg accent-[#8B1E22] cursor-pointer shadow-xs focus:outline-none transition-all [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent"
                  aria-label="Thanh điều chỉnh âm lượng"
                />
              );
            })()}

            <span className="text-[11px] font-mono text-stone-600 w-8 text-right font-semibold">
              {isMuted ? 0 : volume}%
            </span>
          </div>
        </div>
      )}

      {/* 2. Đĩa than đơn độc quyền sang trọng ở góc trái màn hình (Không có nhãn kèm bên cạnh) */}
      <button
        onClick={handleDiscClick}
        aria-label={
          isPlaying
            ? 'Đang phát nhạc cưới. Bấm 1 lần: Tạm dừng • Bấm đúp: Mở bảng điều khiển'
            : 'Đang tạm dừng nhạc cưới. Bấm 1 lần: Bật nhạc • Bấm đúp: Mở bảng điều khiển'
        }
        title="Bấm 1 lần: Bật / Tắt tạm dừng nhạc • Bấm đúp (2 lần): Mở bảng điều khiển chi tiết"
        className="relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-[#C5A059] bg-[#FAF6EE] shadow-2xl transition-all duration-300 hover:scale-105 hover:border-[#8B1E22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E22] cursor-pointer"
        style={{
          boxShadow: isPlaying
            ? '0 0 25px rgba(197, 160, 89, 0.5), 0 8px 20px rgba(139, 30, 34, 0.25)'
            : '0 6px 16px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Lớp đĩa than quay tròn với hiệu ứng rãnh đĩa thực tế */}
        <div
          className={`absolute inset-1 rounded-full bg-gradient-to-tr from-[#1a1412] via-[#33261e] to-[#1a1412] flex items-center justify-center overflow-hidden transition-transform ${
            isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'
          }`}
        >
          <div className="absolute inset-1.5 rounded-full border border-stone-600/40 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-stone-600/30 pointer-events-none" />

          {/* Nhãn mạ vàng tâm đĩa */}
          <div className="h-5 w-5 rounded-full bg-[#FAF6EE] border border-[#C5A059] flex items-center justify-center shadow-inner">
            <div className="h-2 w-2 rounded-full bg-[#8B1E22]" />
          </div>
        </div>

        {/* Hiệu ứng 3 cột sóng âm nhảy theo nhạc / Biểu tượng nốt nhạc */}
        <div className="relative z-10 flex items-center justify-center pointer-events-none">
          {isPlaying ? (
            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-[#8B1E22]/90 rounded-full text-[#FAF6EE] shadow-sm">
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
            <div className="h-6 w-6 rounded-full bg-[#8B1E22]/90 flex items-center justify-center text-[#FAF6EE] shadow-sm">
              <Music className="h-3.5 w-3.5 text-[#FAF6EE]" />
            </div>
          )}
        </div>

        {/* Vòng hào quang ánh kim nhấp nháy khi đang phát */}
        {isPlaying && (
          <span className="absolute -inset-1 rounded-full border border-[#C5A059] animate-ping pointer-events-none opacity-40" />
        )}
      </button>
    </aside>
  );
};
