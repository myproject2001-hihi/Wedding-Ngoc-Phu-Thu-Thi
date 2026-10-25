import React, { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YOUTUBE_VIDEO_ID = 'XcfBnQFe4zM'; // https://youtu.be/XcfBnQFe4zM?si=HTMVO53XJ_CNlRp4
export const YOUTUBE_VIDEO_URL = 'https://youtu.be/XcfBnQFe4zM?si=HTMVO53XJ_CNlRp4';

interface BackgroundWeddingMusicProps {
  autoPlayTrigger?: boolean;
}

export const BackgroundWeddingMusic: React.FC<BackgroundWeddingMusicProps> = ({
  autoPlayTrigger,
}) => {
  const ytPlayerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  // Start background playback safely for YouTube XcfBnQFe4zM + Audio Fallback
  const startPlayback = useCallback(() => {
    hasStartedRef.current = true;

    // 1. Try YouTube Player (XcfBnQFe4zM)
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.playVideo();
      } catch (e) {
        console.warn('YT play exception:', e);
      }
    }

    // 2. Audio element fallback
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio element play exception:', err);
      });
    }
  }, []);

  // Initialize YouTube Iframe API with user's exact YouTube video ID (XcfBnQFe4zM)
  useEffect(() => {
    let isMounted = true;

    const initYt = () => {
      if (!isMounted || ytPlayerRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('yt-background-player-element', {
          height: '1',
          width: '1',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            playsinline: 1,
            rel: 0,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              try {
                event.target.setVolume(100);
                if (hasStartedRef.current) {
                  event.target.unMute();
                  event.target.playVideo();
                }
              } catch {}
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              if (event.data === 1 && audioRef.current) {
                // YouTube started playing -> pause HTML audio so there's no overlap
                audioRef.current.pause();
              } else if (event.data === 0) {
                // Loop YouTube track
                try {
                  event.target.playVideo();
                } catch {}
              }
            },
          },
        });
      } catch (e) {
        console.warn('YT init error:', e);
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

      if (!document.getElementById('yt-script-tag-bg')) {
        const script = document.createElement('script');
        script.id = 'yt-script-tag-bg';
        script.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(script, firstScript);
      }
    }

    return () => {
      isMounted = false;
    };
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
      {/* Hidden YouTube Iframe Container for Video XcfBnQFe4zM */}
      <div id="yt-background-player-element" />

      {/* Audio element fallback */}
      <audio
        ref={audioRef}
        src="/audio/canon_in_d_piano.mp3"
        preload="auto"
        loop
      />
    </div>
  );
};
