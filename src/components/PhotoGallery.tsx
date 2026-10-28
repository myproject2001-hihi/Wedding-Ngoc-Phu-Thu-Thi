import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles, Heart } from 'lucide-react';
import { WeddingInfo } from '../types';
import { getActiveGalleryPhotos, GalleryPhoto } from '../data/mediaConfig';

interface PhotoGalleryProps {
  weddingInfo: WeddingInfo;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => getActiveGalleryPhotos());
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Listen for media update events
  useEffect(() => {
    const handleMediaUpdate = () => {
      setPhotos(getActiveGalleryPhotos());
    };
    window.addEventListener('wedding_media_updated', handleMediaUpdate);
    return () => window.removeEventListener('wedding_media_updated', handleMediaUpdate);
  }, []);

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

  return (
    <section id="album-anh" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header with AOS */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-12"
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

      {/* Luxury Editorial Grid for 10 - 20 Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {photos.map((item, idx) => {
          const isFeatured = idx === 0;

          return (
            <div
              key={item.id || idx}
              data-aos="fade-up"
              data-aos-delay={(idx % 4) * 100}
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
                    ? 'h-[280px] sm:h-[420px] md:h-[480px]'
                    : 'h-[160px] sm:h-[200px] md:h-[230px]'
                }`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to sample if specific image not yet uploaded
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

      {/* Lightbox Modal (Phóng to xem từng ảnh với chuyển ảnh mượt mà) */}
      {selectedImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#120d0b]/96 p-2 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Always-visible Floating Close Button in Top-Right Corner */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(null);
            }}
            className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-stone-900/90 hover:bg-[#8B1E22] text-white px-4 py-2 border border-[#C5A059]/50 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            aria-label="Đóng cửa sổ ảnh"
          >
            <X className="h-5 w-5" />
            <span className="text-xs font-caps font-bold">Đóng</span>
          </button>

          <div
            className="relative max-w-4xl w-full flex flex-col items-center pt-8 sm:pt-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Viewer Container */}
            <div className="relative overflow-hidden rounded-2xl border border-[#C5A059]/60 shadow-2xl bg-black/90 max-h-[76vh] min-h-[280px] w-full flex items-center justify-center">
              <img
                src={photos[selectedImageIndex].src}
                alt={photos[selectedImageIndex].title}
                className="max-h-[76vh] w-auto max-w-full object-contain mx-auto"
                referrerPolicy="no-referrer"
              />

              {/* Prev / Next navigation buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/75 text-white hover:bg-[#8B1E22] transition-colors border border-white/30 shadow-lg cursor-pointer z-20 active:scale-95"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/75 text-white hover:bg-[#8B1E22] transition-colors border border-white/30 shadow-lg cursor-pointer z-20 active:scale-95"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Caption & Counter */}
            <div className="mt-4 text-center text-white max-w-xl px-2">
              <h3 className="font-display text-base sm:text-xl font-bold text-[#EAD8B7] tracking-wide">
                {photos[selectedImageIndex].title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm font-display text-stone-300 leading-relaxed">
                {photos[selectedImageIndex].caption}
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-[#C5A059]/40 text-xs font-mono text-[#F6E6C5] font-semibold">
                <Sparkles className="h-3 w-3 text-[#C5A059]" />
                <span>
                  Ảnh {selectedImageIndex + 1} / {photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
