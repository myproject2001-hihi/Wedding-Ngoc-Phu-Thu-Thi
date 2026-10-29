import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Maximize2, Heart, Sparkles } from 'lucide-react';
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
        // Valid photo must have actual dimensions > 15px (not a 1x1 spacer or corrupt 0x0)
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

export const PhotoGallery: React.FC<PhotoGalleryProps> = () => {
  const [validPhotos, setValidPhotos] = useState<ValidatedPhoto[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Validate candidate photos: only photos with a valid working image are rendered into frames
  useEffect(() => {
    let isMounted = true;
    const allSlots = getActiveGalleryPhotos();

    const validateAll = async () => {
      const checkPromises = allSlots.map(async (slot) => {
        const candidates = slot.candidateUrls || getCandidateUrlsForFile(slot.filename);
        const workingUrl = await resolveWorkingUrl(candidates);
        if (workingUrl) {
          return {
            ...slot,
            resolvedSrc: workingUrl,
          };
        }
        return null;
      });

      const results = await Promise.all(checkPromises);
      if (isMounted) {
        const verified = results.filter((p): p is ValidatedPhoto => p !== null);
        setValidPhotos(verified);
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

  // Lock body scroll when lightbox modal is open
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
  }, [selectedImageIndex, validPhotos.length]);

  const handleNext = () => {
    if (selectedImageIndex !== null && validPhotos.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % validPhotos.length);
    }
  };

  const handlePrev = () => {
    if (selectedImageIndex !== null && validPhotos.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + validPhotos.length) % validPhotos.length);
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
      {/* Header */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-10 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold leading-relaxed text-center">
          <span>KHOẢNH KHẮC</span>
          <span className="text-[#C5A059]">✦</span>
          <span>GỬI TRỌN<br className="sm:hidden" /> YÊU THƯƠNG</span>
        </div>
        <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-[#8B1E22] tracking-wide">
          Album Ảnh Cưới
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs font-display text-stone-600">
          <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
          <span>Khoảnh khắc ngọt ngào của Phú & Thi</span>
          <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
        </div>
        <p className="mt-1 text-xs sm:text-sm font-display text-stone-500">
          Chạm vào từng bức ảnh để phóng to chiêm ngưỡng trọn vẹn
        </p>
      </div>

      {/* Dynamic Gallery Grid: Only frames with valid images are shown */}
      {/* Cấu trúc: Hình bìa lớn ở trên cùng (col-span-2), phía dưới là các hàng 2 hình nhỏ trên cả máy tính lẫn điện thoại */}
      {validPhotos.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {validPhotos.map((item, idx) => {
              const isCover = idx === 0;

              return (
                <div
                  key={item.id || idx}
                  data-aos="fade-up"
                  data-aos-delay={(idx % 2) * 90}
                  data-aos-duration="700"
                  className={isCover ? 'col-span-2' : 'col-span-1'}
                >
                  <div
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#C5A059]/40 bg-[#FAF4E6] cursor-pointer shadow-md hover:shadow-2xl hover:border-[#8B1E22] transition-all duration-500 w-full ${
                      isCover
                        ? 'aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[520px]'
                        : 'aspect-[3/4]'
                    }`}
                  >
                    <img
                      src={item.resolvedSrc || item.src}
                      alt="Ảnh cưới Ngọc Phú & Thu Thi"
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      referrerPolicy="no-referrer"
                    />

                    {/* Clean Hover Overlay with Elegant Centered Zoom Icon - No text captions */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-white">
                      <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#8B1E22]/90 border border-[#C5A059] shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal: Clean, full focus on photography without obstructing caption boxes */}
      {selectedImageIndex !== null &&
        validPhotos[selectedImageIndex] &&
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

            {/* Center Stage: Image dynamically hugs photo with maximum vertical clearance and elegance */}
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
                  src={validPhotos[selectedImageIndex].resolvedSrc || validPhotos[selectedImageIndex].src}
                  alt="Ảnh cưới Phú & Thi"
                  className="max-h-[calc(100dvh-120px)] sm:max-h-[calc(100dvh-130px)] max-w-[94vw] sm:max-w-[84vw] w-auto h-auto object-contain rounded-xl sm:rounded-2xl border-2 border-[#C5A059]/70 shadow-2xl transition-all duration-300"
                  referrerPolicy="no-referrer"
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

            {/* Bottom Bar: Clean, elegant image counter */}
            <div className="shrink-0 flex items-center justify-center pb-2 z-20">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/60 border border-[#C5A059]/40 text-[#F5E6C8] text-xs font-caps tracking-wider backdrop-blur-sm shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Ảnh {selectedImageIndex + 1} / {validPhotos.length}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
