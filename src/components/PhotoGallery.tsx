import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles, Heart } from 'lucide-react';
import { WeddingInfo } from '../types';
import { getActiveGalleryPhotos, GalleryPhoto } from '../data/mediaConfig';

interface PhotoGalleryProps {
  weddingInfo: WeddingInfo;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => getActiveGalleryPhotos());
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Listen for media update events
  useEffect(() => {
    const handleMediaUpdate = () => {
      setPhotos(getActiveGalleryPhotos());
    };
    window.addEventListener('wedding_media_updated', handleMediaUpdate);
    return () => window.removeEventListener('wedding_media_updated', handleMediaUpdate);
  }, []);

  // Lock body scroll when modal is open so background doesn't move
  useEffect(() => {
    if (selectedImageIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedImageIndex]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, photos.length]);

  const handleNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % photos.length);
    }
  };

  const handlePrev = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + photos.length) % photos.length);
    }
  };

  // Touch swipe handlers for smooth mobile gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      handleNext(); // Swipe left to next photo
    } else if (distance < -45) {
      handlePrev(); // Swipe right to prev photo
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section id="album-anh" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header with AOS */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-10 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold leading-relaxed text-center">
          <span>KHOẢNH KHẮC</span>
          <span className="text-[#C5A059]">✦</span>
          <span>GỬI TRỌN YÊU THƯƠNG</span>
        </div>
        <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-[#8B1E22] tracking-wide">
          Album Ảnh Cưới
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs font-display text-stone-600">
          <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
          <span>{photos.length} Khoảnh khắc ngọt ngào của Phú & Thi</span>
          <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
        </div>
        <p className="mt-1 text-xs sm:text-sm font-display text-stone-500">
          Chạm vào từng bức ảnh để phóng to chiêm ngưỡng trọn vẹn
        </p>
      </div>

      {/* Responsive Gallery Grid: Perfectly proportioned on both laptop and mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {photos.map((item, idx) => {
          const isFeatured = idx === 0;

          return (
            <div
              key={item.id || idx}
              data-aos="fade-up"
              data-aos-delay={(idx % 4) * 80}
              data-aos-duration="700"
              className={`${
                isFeatured
                  ? 'col-span-2 row-span-2 sm:col-span-2 sm:row-span-2'
                  : 'col-span-1'
              }`}
            >
              <div
                onClick={() => setSelectedImageIndex(idx)}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#C5A059]/40 bg-[#FAF4E6] cursor-pointer shadow-md hover:shadow-2xl hover:border-[#8B1E22] transition-all duration-500 w-full ${
                  isFeatured
                    ? 'aspect-[4/5] sm:aspect-auto sm:h-full min-h-[260px] sm:min-h-[420px]'
                    : 'aspect-[3/4]'
                }`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="h-full w-full object-cover object-top sm:object-center transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/anhbia.jpg';
                  }}
                />

                {/* Hover Scrim Overlay with Title & Zoom Icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 text-white">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-display text-xs sm:text-base font-bold tracking-wide text-[#F6E6C5] truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-display text-stone-200 mt-0.5 line-clamp-1 opacity-90">
                        {item.caption}
                      </p>
                    </div>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#8B1E22]/80 border border-white/30 backdrop-blur-xs shrink-0 shadow-md">
                      <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal: Portaled directly to document.body, z-[99999], 100% responsive on all phones and laptops */}
      {selectedImageIndex !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-md p-3 sm:p-5 h-[100dvh] w-screen select-none animate-in fade-in duration-200 overflow-hidden"
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Top Bar: Always-visible Close Button */}
            <div
              className="flex items-center justify-end w-full max-w-5xl mx-auto z-20 shrink-0 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/90 hover:bg-[#8B1E22] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 border border-[#C5A059]/50 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                aria-label="Đóng cửa sổ ảnh"
              >
                <X className="h-5 w-5" />
                <span className="text-xs sm:text-sm font-caps font-bold">Đóng</span>
              </button>
            </div>

            {/* Center Stage: Image dynamically hugs photo with no giant empty box, perfectly fits mobile & laptop */}
            <div
              className="flex-1 min-h-0 w-full flex items-center justify-center relative my-auto py-1 px-1 sm:px-14"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/65 hover:bg-[#8B1E22] text-white border border-[#C5A059]/60 shadow-2xl transition-all cursor-pointer z-30 active:scale-90"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Snug photo frame: Hugs the portrait or landscape image perfectly with gold border */}
              <div className="relative inline-flex items-center justify-center max-h-full max-w-full">
                <img
                  src={photos[selectedImageIndex].src}
                  alt={photos[selectedImageIndex].title}
                  className="max-h-[calc(100dvh-170px)] sm:max-h-[calc(100dvh-185px)] max-w-[94vw] sm:max-w-[82vw] w-auto h-auto object-contain rounded-xl sm:rounded-2xl border-2 border-[#C5A059]/70 shadow-2xl transition-all duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/anhbia.jpg';
                  }}
                />
              </div>

              {/* Next Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/65 hover:bg-[#8B1E22] text-white border border-[#C5A059]/60 shadow-2xl transition-all cursor-pointer z-30 active:scale-90"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Footer Bar: Title & Caption (Never clipped or pushed off screen) */}
            <div
              className="shrink-0 text-center text-white px-3 pt-2 pb-1 max-w-2xl mx-auto w-full z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-sm sm:text-lg font-bold text-[#F6E6C5] tracking-wide truncate">
                {photos[selectedImageIndex].title}
              </h3>
              <p className="mt-0.5 text-[11px] sm:text-xs font-display text-stone-300 line-clamp-1 opacity-90">
                {photos[selectedImageIndex].caption}
              </p>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
