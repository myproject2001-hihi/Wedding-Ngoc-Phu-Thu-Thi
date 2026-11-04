import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Heart,
  Sparkles,
  Play,
  Pause,
  LayoutGrid,
  Film,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WeddingInfo } from '../types';
import { getActiveGalleryPhotos, GalleryPhoto, getCandidateUrlsForFile } from '../data/mediaConfig';

interface PhotoGalleryProps {
  weddingInfo: WeddingInfo;
}

interface ValidatedPhoto extends GalleryPhoto {
  resolvedSrc: string;
}

function testImageCandidate(url: string, timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }
    }, timeout);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        if (img.naturalWidth > 15 && img.naturalHeight > 15) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = url;
  });
}

async function resolveWorkingUrl(candidates: string[]): Promise<string | null> {
  for (const url of candidates) {
    if (!url) continue;
    const valid = await testImageCandidate(url);
    if (valid) {
      return url;
    }
  }
  return null;
}

const getInitialPhotos = (): ValidatedPhoto[] => {
  return getActiveGalleryPhotos().map((p) => ({
    ...p,
    resolvedSrc: p.src,
  }));
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = () => {
  // Initialize with all photos immediately so the album is never empty or delayed
  const [validPhotos, setValidPhotos] = useState<ValidatedPhoto[]>(getInitialPhotos);
  const [viewMode, setViewMode] = useState<'lookbook' | 'grid'>('grid');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGridExpanded, setIsGridExpanded] = useState<boolean>(false);
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState<number | null>(null);

  // Default to autoplay in Lookbook Studio mode
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [autoplayProgress, setAutoplayProgress] = useState<number>(0);

  // Section reference and IntersectionObserver so album only activates when user scrolls to it
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);

  // Swipe gesture refs
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Filmstrip thumbnail container refs
  const filmstripRef = useRef<HTMLDivElement | null>(null);
  const lightboxFilmstripRef = useRef<HTMLDivElement | null>(null);

  // User interaction state to prevent jarring scroll jumps when dragging/scrolling upcoming thumbnails
  const isUserInteractingWithFilmstrip = useRef(false);
  const filmstripInteractionTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isPausedByUser, setIsPausedByUser] = useState(false);

  const handleFilmstripUserActivity = useCallback(() => {
    isUserInteractingWithFilmstrip.current = true;
    setIsPausedByUser(true);
    setAutoplayProgress(0);

    if (filmstripInteractionTimeout.current) {
      clearTimeout(filmstripInteractionTimeout.current);
    }

    // Resume autoplay & auto-centering only after 7 seconds of idle
    filmstripInteractionTimeout.current = setTimeout(() => {
      isUserInteractingWithFilmstrip.current = false;
      setIsPausedByUser(false);
    }, 7000);
  }, []);

  useEffect(() => {
    return () => {
      if (filmstripInteractionTimeout.current) {
        clearTimeout(filmstripInteractionTimeout.current);
      }
    };
  }, []);

  // IntersectionObserver: Only activate album slideshow when user actually scrolls to the album section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold: 0.15, // Activates when at least 15% of the album section enters view
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gracefully resolve working image candidates in background without ever discarding photo slots
  useEffect(() => {
    let isMounted = true;
    const allSlots = getActiveGalleryPhotos();

    const validateAll = async () => {
      const checkPromises = allSlots.map(async (slot) => {
        const candidates = slot.candidateUrls || getCandidateUrlsForFile(slot.filename);
        const workingUrl = await resolveWorkingUrl(candidates);
        return {
          ...slot,
          resolvedSrc: workingUrl || slot.src,
        };
      });

      const results = await Promise.all(checkPromises);
      if (isMounted) {
        setValidPhotos(results);
      }
    };

    validateAll();

    const handleMediaUpdate = () => {
      validateAll();
    };

    window.addEventListener('wedding_media_updated', handleMediaUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('wedding_media_updated', handleMediaUpdate);
    };
  }, []);

  const handleImageErrorFallback = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    candidates?: string[]
  ) => {
    const target = e.currentTarget;
    if (!candidates || candidates.length === 0) return;
    const currentSrc = target.src;
    const nextCandidate = candidates.find((c) => !currentSrc.includes(c));
    if (nextCandidate && target.dataset.lastFallback !== nextCandidate) {
      target.dataset.lastFallback = nextCandidate;
      target.src = nextCandidate;
    }
  };

  const displayedPhotos = validPhotos;

  // Ensure current index is within bounds of displayedPhotos
  useEffect(() => {
    if (currentIndex >= displayedPhotos.length && displayedPhotos.length > 0) {
      setCurrentIndex(0);
    }
  }, [displayedPhotos.length, currentIndex]);

  // Navigate functions
  const handleNext = useCallback(() => {
    if (displayedPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % displayedPhotos.length);
    setAutoplayProgress(0);
  }, [displayedPhotos.length]);

  const handlePrev = useCallback(() => {
    if (displayedPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + displayedPhotos.length) % displayedPhotos.length);
    setAutoplayProgress(0);
  }, [displayedPhotos.length]);

  // Lightbox navigate
  const handleLightboxNext = useCallback(() => {
    if (selectedLightboxIndex !== null && displayedPhotos.length > 0) {
      setSelectedLightboxIndex((selectedLightboxIndex + 1) % displayedPhotos.length);
    }
  }, [selectedLightboxIndex, displayedPhotos.length]);

  const handleLightboxPrev = useCallback(() => {
    if (selectedLightboxIndex !== null && displayedPhotos.length > 0) {
      setSelectedLightboxIndex(
        (selectedLightboxIndex - 1 + displayedPhotos.length) % displayedPhotos.length
      );
    }
  }, [selectedLightboxIndex, displayedPhotos.length]);

  // Pure container-level horizontal scrolling for active thumbnail (NEVER scrolls the window)
  useEffect(() => {
    // If user is actively dragging or browsing upcoming thumbnails, do NOT yank it back!
    if (isUserInteractingWithFilmstrip.current) return;
    if (!filmstripRef.current) return;
    const container = filmstripRef.current;
    const activeEl = container.querySelector<HTMLElement>(`[data-thumb-index="${currentIndex}"]`);
    if (activeEl) {
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollTarget = elLeft - containerWidth / 2 + elWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollTarget),
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (selectedLightboxIndex === null || !lightboxFilmstripRef.current) return;
    const container = lightboxFilmstripRef.current;
    const activeEl = container.querySelector<HTMLElement>(
      `[data-lightbox-thumb="${selectedLightboxIndex}"]`
    );
    if (activeEl) {
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollTarget = elLeft - containerWidth / 2 + elWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollTarget),
        behavior: 'smooth',
      });
    }
  }, [selectedLightboxIndex]);

  // Autoplay timer for Slideshow
  // Slower transition (6.5s per slide) & pauses when user is interacting or scrolled out of view!
  useEffect(() => {
    if (
      !isAutoplay ||
      isPausedByUser ||
      !isInView ||
      viewMode !== 'lookbook' ||
      displayedPhotos.length <= 1
    ) {
      setAutoplayProgress(0);
      return;
    }

    const intervalTime = 100; // ms
    const totalDuration = 6500; // 6.5s per slide for a gentle, elegant pace
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoplay, isPausedByUser, isInView, viewMode, displayedPhotos.length, handleNext]);

  // Lock body scroll when lightbox modal is open
  useEffect(() => {
    if (selectedLightboxIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedLightboxIndex]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedLightboxIndex === null) return;
      if (e.key === 'ArrowRight') {
        handleLightboxNext();
      } else if (e.key === 'ArrowLeft') {
        handleLightboxPrev();
      } else if (e.key === 'Escape') {
        setSelectedLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLightboxIndex, handleLightboxNext, handleLightboxPrev]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (isModal = false) => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      if (isModal) handleLightboxNext();
      else handleNext();
    } else if (distance < -45) {
      if (isModal) handleLightboxPrev();
      else handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const currentPhoto = displayedPhotos[currentIndex] || validPhotos[0];

  // Number of photos to show in collapsed grid mode (1 cover photo + 4 grid photos = 5 total)
  const COLLAPSED_GRID_COUNT = 5;
  const gridPhotosToRender = isGridExpanded
    ? displayedPhotos
    : displayedPhotos.slice(0, COLLAPSED_GRID_COUNT);

  return (
    <section
      ref={sectionRef}
      id="album-anh"
      className="py-14 sm:py-20 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      {/* Header with AOS scroll reveal effect */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-8 sm:mb-10"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold leading-relaxed">
          <span>KHOẢNH<br className="sm:hidden" /> KHẮC</span>
          <span className="text-[#C5A059]">✦</span>
          <span>
            GỬI TRỌN<br className="sm:hidden" /> YÊU THƯƠNG
          </span>
        </div>

        <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#8B1E22] tracking-wide">
          Album Ảnh Cưới
        </h2>

        <div className="flex items-center justify-center gap-2 mt-2 text-xs font-display text-stone-600">
          <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
          <span>Hành trình chung đôi <br className="sm:hidden" />Huỳnh Lê Ngọc Phú & Huỳnh Thị Thu Thi</span>
          <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
        </div>

        {/* View Mode Switcher: Lookbook Slider vs Compact Grid */}
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex items-center p-1 bg-[#FAF4E6] border border-[#C5A059]/40 rounded-full shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-caps font-semibold transition-all duration-300 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#8B1E22] text-[#FAF4E6] shadow-md scale-[1.02]'
                  : 'text-stone-600 hover:text-[#8B1E22]'
              }`}
              title="Chế độ Lưới Nghệ Thuật"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Lưới Nghệ Thuật</span>
            </button>

            <button
              onClick={() => setViewMode('lookbook')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-caps font-semibold transition-all duration-300 cursor-pointer ${
                viewMode === 'lookbook'
                  ? 'bg-[#8B1E22] text-[#FAF4E6] shadow-md scale-[1.02]'
                  : 'text-stone-600 hover:text-[#8B1E22]'
              }`}
              title="Chế độ Tạp Chí Cuộn Phim"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Tạp Chí Lookbook</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESIGN SOLUTION 1: LOOKBOOK SLIDER & FILMSTRIP */}
      {viewMode === 'lookbook' && validPhotos.length > 0 && currentPhoto && (
        <div
          data-aos="fade-up"
          data-aos-duration="700"
          className="relative max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Main Showcase Frame: Studio Exhibition with uncropped full photo */}
          <div
            className="group relative w-full max-w-4xl mx-auto h-[480px] sm:h-[580px] md:h-[620px] overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#C5A059]/50 bg-[#161311] shadow-2xl transition-all duration-500 flex items-center justify-center p-2 sm:p-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(false)}
          >
            {/* Background blurred ambiance for artistic atmospheric studio lighting */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-35 scale-110 pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${currentPhoto.resolvedSrc || currentPhoto.src})` }}
            />
            {/* Subtle dark vignette overlay for theater contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/50 pointer-events-none" />

            {/* Current Active Photo: object-contain ALWAYS to preserve 100% of the couple's faces and attire */}
            <img
              key={currentPhoto.resolvedSrc || currentPhoto.src}
              src={currentPhoto.resolvedSrc || currentPhoto.src}
              alt="Ảnh cưới Ngọc Phú & Thu Thi"
              onError={(e) => handleImageErrorFallback(e, currentPhoto.candidateUrls)}
              className="relative z-10 max-h-full max-w-full h-auto w-auto object-contain mx-auto rounded-lg sm:rounded-xl shadow-2xl border border-white/10 transition-all duration-700 animate-in fade-in cursor-pointer drop-shadow-2xl"
              onClick={() => setSelectedLightboxIndex(currentIndex)}
              loading="eager"
            />

            {/* Autoplay Slide Progress Bar */}
            {isAutoplay && isInView && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-black/40 z-30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C5A059] to-[#F5E6C8] transition-all duration-100 ease-linear"
                  style={{ width: `${autoplayProgress}%` }}
                />
              </div>
            )}

            {/* Top Toolbar: Action buttons (Autoplay & Maximize) aligned top-right */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-caps font-semibold backdrop-blur-md border transition-all cursor-pointer shadow-lg ${
                  isAutoplay
                    ? 'bg-[#8B1E22] text-white border-[#C5A059]'
                    : 'bg-black/60 text-white/90 border-[#C5A059]/40 hover:bg-[#8B1E22]'
                }`}
                title={isAutoplay ? 'Tạm dừng chiếu tự động' : 'Tự động phát trình chiếu (Slideshow)'}
              >
                {isAutoplay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                <span className="hidden sm:inline">{isAutoplay ? 'Đang chiếu' : 'Tự động'}</span>
              </button>

              <button
                onClick={() => setSelectedLightboxIndex(currentIndex)}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/60 hover:bg-[#8B1E22] text-white border border-[#C5A059]/40 backdrop-blur-md shadow-lg transition-all cursor-pointer"
                title="Phóng to toàn cảnh"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Prev Navigation Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/55 hover:bg-[#8B1E22] text-white border border-[#C5A059]/60 shadow-xl backdrop-blur-sm transition-all cursor-pointer active:scale-90"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Next Navigation Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/55 hover:bg-[#8B1E22] text-white border border-[#C5A059]/60 shadow-xl backdrop-blur-sm transition-all cursor-pointer active:scale-90"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Caption moved OUTSIDE below the photo frame */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setSelectedLightboxIndex(currentIndex)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF4E6] hover:bg-[#8B1E22] text-stone-600 hover:text-white border border-[#C5A059]/40 hover:border-[#8B1E22] shadow-sm hover:shadow-md transition-all duration-300 text-xs font-display cursor-pointer active:scale-95"
            >
              <Maximize2 className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Chạm vào hình để phóng to ảnh</span>
            </button>
          </div>

          {/* Interactive Filmstrip Thumbnails Bar */}
          <div className="mt-3 w-full">
            <div
              ref={filmstripRef}
              onScroll={handleFilmstripUserActivity}
              onTouchStart={handleFilmstripUserActivity}
              onTouchMove={handleFilmstripUserActivity}
              onMouseDown={handleFilmstripUserActivity}
              onWheel={handleFilmstripUserActivity}
              className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#C5A059]/50 scrollbar-track-transparent snap-x py-1"
            >
              {displayedPhotos.map((photo, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={photo.id || idx}
                    data-thumb-index={idx}
                    onClick={() => {
                      // Explicit user click: clear scroll pause & center selected photo immediately
                      isUserInteractingWithFilmstrip.current = false;
                      if (filmstripInteractionTimeout.current) {
                        clearTimeout(filmstripInteractionTimeout.current);
                      }
                      setIsPausedByUser(false);
                      setCurrentIndex(idx);
                      setAutoplayProgress(0);

                      if (filmstripRef.current) {
                        const container = filmstripRef.current;
                        const activeEl = container.querySelector<HTMLElement>(`[data-thumb-index="${idx}"]`);
                        if (activeEl) {
                          const elLeft = activeEl.offsetLeft;
                          const elWidth = activeEl.offsetWidth;
                          const containerWidth = container.offsetWidth;
                          const scrollTarget = elLeft - containerWidth / 2 + elWidth / 2;
                          container.scrollTo({
                            left: Math.max(0, scrollTarget),
                            behavior: 'smooth',
                          });
                        }
                      }
                    }}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 snap-center ${
                      isActive
                        ? 'ring-2 sm:ring-4 ring-[#C5A059] shadow-xl scale-105 border border-[#8B1E22]'
                        : 'opacity-65 hover:opacity-100 hover:scale-100 border border-stone-200'
                    }`}
                    aria-label={`Xem ảnh số ${idx + 1}`}
                  >
                    <img
                      src={photo.resolvedSrc || photo.src}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={(e) => handleImageErrorFallback(e, photo.candidateUrls)}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    <div
                      className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-[10px] font-caps font-bold text-white transition-opacity ${
                        isActive ? 'bg-[#8B1E22]' : 'bg-black/60'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DESIGN SOLUTION 2: COMPACT CURATED GRID WITH EXPAND/COLLAPSE */}
      {viewMode === 'grid' && validPhotos.length > 0 && (
        <div data-aos="fade-up" data-aos-duration="700" className="max-w-4xl mx-auto">
          {/* Magazine Mosaic Layout: Full-width top cover photo + 2-column grid for all devices */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {gridPhotosToRender.map((photo, idx) => {
              const isFirstFeatured = idx === 0;
              const isLastCollapsedSlot = !isGridExpanded && idx === COLLAPSED_GRID_COUNT - 1;
              const remainingCount = displayedPhotos.length - COLLAPSED_GRID_COUNT;

              return (
                <div
                  key={photo.id || idx}
                  className={isFirstFeatured ? 'col-span-2' : 'col-span-1'}
                >
                  <div
                    onClick={() => {
                      if (isLastCollapsedSlot && remainingCount > 0) {
                        setIsGridExpanded(true);
                      } else {
                        setSelectedLightboxIndex(idx);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#C5A059]/40 bg-[#FAF4E6] cursor-pointer shadow-md hover:shadow-2xl hover:border-[#8B1E22] transition-all duration-500 w-full ${
                      isFirstFeatured
                        ? 'aspect-[16/11] sm:aspect-[16/10]'
                        : 'aspect-[3/4]'
                    }`}
                  >
                    <img
                      src={photo.resolvedSrc || photo.src}
                      alt="Ảnh cưới Phú & Thi"
                      onError={(e) => handleImageErrorFallback(e, photo.candidateUrls)}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading={idx < 3 ? 'eager' : 'lazy'}
                    />

                    {/* Overlay for the 5th slot when collapsed showing "+14 More Photos" */}
                    {isLastCollapsedSlot && remainingCount > 0 ? (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-3 transition-colors hover:bg-black/65">
                        <span className="text-2xl sm:text-3xl font-display font-bold text-[#F5E6C8]">
                          +{remainingCount}
                        </span>
                        <span className="text-xs font-caps tracking-wider text-stone-200 mt-1">
                          Khoảnh khắc nữa
                        </span>
                      </div>
                    ) : (
                      /* Clean Hover Overlay with Zoom Icon */
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-white">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#8B1E22]/90 border border-[#C5A059] shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Maximize2 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expand / Collapse Button */}
          {displayedPhotos.length > COLLAPSED_GRID_COUNT && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setIsGridExpanded(!isGridExpanded)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B1E22] to-[#A3282C] text-[#FAF4E6] text-xs sm:text-sm font-caps font-semibold border border-[#C5A059]/60 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                {isGridExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Thu gọn bộ album ảnh cưới</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Xem trọn bộ album ảnh cưới</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN LUXURY LIGHTBOX MODAL WITH FILMSTRIP AND AUTOPLAY */}
      {selectedLightboxIndex !== null &&
        displayedPhotos[selectedLightboxIndex] &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-md p-2 sm:p-4 h-[100dvh] w-screen select-none animate-in fade-in duration-200 overflow-hidden"
            onClick={() => setSelectedLightboxIndex(null)}
          >
            {/* Top Bar: Controls */}
            <div
              className="flex items-center justify-between w-full max-w-6xl mx-auto z-20 shrink-0 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/90 text-[#F5E6C8] text-xs font-caps border border-[#C5A059]/40">
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>
                  Ảnh {selectedLightboxIndex + 1} / {displayedPhotos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 border text-xs font-caps transition-all cursor-pointer ${
                    isAutoplay
                      ? 'bg-[#8B1E22] text-white border-[#C5A059]'
                      : 'bg-stone-900/90 hover:bg-[#8B1E22] text-white border-[#C5A059]/40'
                  }`}
                  aria-label="Tự động phát slideshow"
                >
                  {isAutoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span className="hidden sm:inline">{isAutoplay ? 'Đang chạy' : 'Slideshow'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLightboxIndex(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/90 hover:bg-[#8B1E22] text-white px-3.5 py-1.5 border border-[#C5A059]/50 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  aria-label="Đóng cửa sổ ảnh"
                >
                  <X className="h-4 w-4" />
                  <span className="text-xs font-caps font-bold">Đóng</span>
                </button>
              </div>
            </div>

            {/* Center Stage: Photo with touch gestures */}
            <div
              className="flex-1 min-h-0 w-full flex items-center justify-center relative my-auto py-1 px-1 sm:px-14"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(true)}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLightboxPrev();
                }}
                className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/65 hover:bg-[#8B1E22] text-white border border-[#C5A059]/60 shadow-2xl transition-all cursor-pointer z-30 active:scale-90"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Photo Frame */}
              <div className="relative inline-flex items-center justify-center max-h-full max-w-full">
                <img
                  src={
                    displayedPhotos[selectedLightboxIndex].resolvedSrc ||
                    displayedPhotos[selectedLightboxIndex].src
                  }
                  alt="Ảnh cưới Phú & Thi"
                  onError={(e) =>
                    handleImageErrorFallback(
                      e,
                      displayedPhotos[selectedLightboxIndex]?.candidateUrls
                    )
                  }
                  className="max-h-[calc(100dvh-170px)] sm:max-h-[calc(100dvh-180px)] max-w-[94vw] sm:max-w-[84vw] w-auto h-auto object-contain rounded-xl sm:rounded-2xl border-2 border-[#C5A059]/70 shadow-2xl transition-all duration-300"
                />
              </div>

              {/* Next Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLightboxNext();
                }}
                className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/65 hover:bg-[#8B1E22] text-white border border-[#C5A059]/60 shadow-2xl transition-all cursor-pointer z-30 active:scale-90"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Bar: Quick Thumbnail Navigation Strip */}
            <div
              className="shrink-0 w-full max-w-4xl mx-auto z-20 pt-1 pb-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={lightboxFilmstripRef}
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto justify-start sm:justify-center py-1 px-2 scrollbar-none"
              >
                {displayedPhotos.map((photo, idx) => {
                  const isActive = idx === selectedLightboxIndex;
                  return (
                    <button
                      key={photo.id || idx}
                      data-lightbox-thumb={idx}
                      onClick={() => setSelectedLightboxIndex(idx)}
                      className={`relative shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isActive
                          ? 'ring-2 ring-[#C5A059] scale-110 border border-white'
                          : 'opacity-50 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={photo.resolvedSrc || photo.src}
                        alt={`Thumb ${idx + 1}`}
                        onError={(e) => handleImageErrorFallback(e, photo.candidateUrls)}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
