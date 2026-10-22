import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { WeddingInfo } from '../types';

interface PhotoGalleryProps {
  weddingInfo: WeddingInfo;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ weddingInfo }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const photos = [
    {
      src: weddingInfo.coverImage,
      title: 'Tình Yêu Viên Mãn',
      caption: 'Khoảnh khắc thiêng liêng khi hai trái tim hòa cùng một nhịp đập',
      aspect: 'col-span-1 md:col-span-2 row-span-2',
    },
    {
      src: weddingInfo.receptionImage,
      title: 'Sảnh Tiệc Hoàng Gia',
      caption: 'Không gian lộng lẫy ngập tràn ánh nến và hoa tươi đón chào quý quan khách',
      aspect: 'col-span-1 md:col-span-2',
    },
    {
      src: weddingInfo.ringsImage,
      title: 'Nhẫn Cưới Đính Ước',
      caption: 'Kỷ vật thiêng liêng khắc ghi lời hẹn thề trọn đời son sắt',
      aspect: 'col-span-1',
    },
    {
      src: weddingInfo.outdoorImage,
      title: 'Hạnh Phúc Bình Yên',
      caption: 'Nắm tay nhau đi qua bốn mùa mưa nắng, trọn vẹn yêu thương',
      aspect: 'col-span-1',
    },
  ];

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
          <span>KHOẢNH KHẮC<br />KỶ NIỆM</span>
          <span className="text-[#C5A059]">✦</span>
          <span>GỬI TRỌN<br />YÊU THƯƠNG</span>
        </div>
        <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-[#8B1E22] tracking-wide">
          Album Ảnh Cưới
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-display text-stone-600 leading-relaxed">
          Chạm vào từng bức ảnh<br className="sm:hidden" /> để chiêm ngưỡng trọn vẹn từng khoảnh khắc
        </p>
      </div>

      {/* Grid of Photos with AOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {photos.map((item, idx) => (
          <div
            key={idx}
            data-aos="fade-up"
            data-aos-delay={idx * 120}
            data-aos-duration="750"
            className={`${
              idx === 0
                ? 'sm:col-span-2 sm:row-span-2'
                : idx === 1
                ? 'sm:col-span-2 lg:col-span-2'
                : ''
            }`}
          >
            <div
              onClick={() => setSelectedImageIndex(idx)}
              className={`group relative overflow-hidden rounded-xl border border-[#C5A059]/40 bg-[#FAF4E6] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 w-full ${
                idx === 0
                  ? 'h-[320px] sm:h-[450px] lg:h-[500px]'
                  : idx === 1
                  ? 'h-[200px] sm:h-[220px] lg:h-[238px]'
                  : 'h-[200px] sm:h-[220px] lg:h-[238px]'
              }`}
            >
              <img
                src={item.src}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Hover Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-base sm:text-lg font-bold tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-xs font-display text-stone-200 mt-0.5 line-clamp-1">
                      {item.caption}
                    </p>
                  </div>
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                    <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal (Hình 1: Thêm nút tắt/đóng rõ ràng, dễ chạm trên điện thoại) */}
      {selectedImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Always-visible Floating Close Button in Top-Right Corner */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-black/80 hover:bg-[#8B1E22] text-white px-3.5 py-2 border border-white/40 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
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
            <div className="relative overflow-hidden rounded-xl border border-[#C5A059]/60 shadow-2xl bg-black max-h-[72vh] flex items-center justify-center">
              <img
                src={photos[selectedImageIndex].src}
                alt={photos[selectedImageIndex].title}
                className="max-h-[72vh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />

              {/* In-container Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 hover:bg-[#8B1E22] text-white border border-white/30 transition-colors shadow-md"
                aria-label="Đóng ảnh"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Prev / Next controls */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#8B1E22] transition-colors border border-white/20"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#8B1E22] transition-colors border border-white/20"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Caption & Controls */}
            <div className="mt-3.5 text-center text-white max-w-xl px-2">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#EAD8B7]">
                {photos[selectedImageIndex].title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm font-display text-stone-300">
                {photos[selectedImageIndex].caption}
              </p>
              <p className="mt-1.5 text-xs font-caps text-[#C5A059] font-bold">
                {selectedImageIndex + 1} / {photos.length}
              </p>


            </div>
          </div>
        </div>
      )}
    </section>
  );
};
