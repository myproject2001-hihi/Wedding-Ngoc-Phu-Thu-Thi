import React, { useState, useEffect } from 'react';
import { Music, VolumeX, Sparkles } from 'lucide-react';
import { weddingAudio } from '../utils/audio';

interface FloatingMusicPlayerProps {
  autoStarted?: boolean;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ autoStarted }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (autoStarted) {
      weddingAudio.playMusic();
      setIsPlaying(true);
    }
  }, [autoStarted]);

  const handleToggle = () => {
    const playing = weddingAudio.toggleMusic();
    setIsPlaying(playing);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={handleToggle}
        aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059]/60 bg-[#FAF6EE] text-[#8B1E22] shadow-lg transition-transform duration-300 hover:scale-105 hover:border-[#8B1E22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E22]"
        title={isPlaying ? 'Tắt nhạc đám cưới' : 'Phát nhạc đám cưới'}
      >
        {/* Subtle decorative gold ring */}
        <div
          className={`absolute inset-0 rounded-full border border-[#D4AF37]/30 ${
            isPlaying ? 'animate-ping opacity-30' : 'opacity-0'
          }`}
        />

        {isPlaying ? (
          <div className="flex items-center justify-center">
            <Music className="h-5 w-5 animate-bounce text-[#8B1E22]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C5A059] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#8B1E22]" />
            </span>
          </div>
        ) : (
          <VolumeX className="h-5 w-5 text-stone-500 group-hover:text-[#8B1E22]" />
        )}
      </button>
    </div>
  );
};
