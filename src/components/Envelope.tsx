import React from 'react';
import { Heart, Sparkles, ChevronDown } from 'lucide-react';

interface EnvelopeProps {
  guestName: string;
  groomName: string;
  brideName: string;
  weddingDateFormatted: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const Envelope: React.FC<EnvelopeProps> = ({
  guestName,
  groomName,
  brideName,
  weddingDateFormatted,
  isOpen,
  onOpen,
  onClose,
}) => {
  const handleOpenEnvelope = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  const handleScrollToContent = () => {
    const el = document.getElementById('thiep-moi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden py-10 sm:py-16 px-3 sm:px-6 flex flex-col items-center justify-center">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.3em] uppercase text-[#8B1E22] font-semibold">
          <span>THƯ MỜI CƯỚI</span>
          <span className="text-[#C5A059]">✦</span>
          <span>WEDDING INVITATION</span>
        </div>

        {/* Groom on line 1, '&' on line 2, Bride on line 3 (Hình 2: Đổi thành font chữ viết tay) */}
        <div className="mt-4 flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-handwriting font-bold text-[#8B1E22] tracking-wide break-words text-center py-1 select-none">
            {groomName}
          </h1>
          <span className="font-calligraphy text-2xl sm:text-4xl text-[#C5A059] my-0.5 select-none leading-none font-bold">
            &
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-handwriting font-bold text-[#8B1E22] tracking-wide break-words text-center py-1 select-none">
            {brideName}
          </h2>
        </div>

        <p className="mt-3 text-xs sm:text-sm font-caps tracking-[0.18em] uppercase text-stone-600 font-semibold">
          {weddingDateFormatted}
        </p>
      </div>

      {/* 3D Envelope Wrapper */}
      <div className="relative w-full max-w-[340px] sm:max-w-[460px] md:max-w-[520px] aspect-[4/3] perspective-1200 mx-auto">
        {/* Envelope Container */}
        <div className="relative w-full h-full preserve-3d">
          {/* BACK PANEL OF ENVELOPE */}
          <div className="absolute inset-0 rounded-2xl bg-[#F5ECDB] shadow-2xl border-2 border-[#C5A059]/40 overflow-hidden">
            {/* Elegant silk damask background texture pattern */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(circle at center, #8B1E22 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />
            {/* Top gold inner trim */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#8B1E22] via-[#C5A059] to-[#8B1E22]" />
          </div>

          {/* TOP FLAP (Nắp phong bì mở lên gập xuống 3D) */}
          <div
            className={`absolute top-0 left-0 right-0 h-1/2 z-30 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
            }}
          >
            {/* Triangle flap */}
            <div
              className="absolute inset-0 bg-[#EFE3CD] shadow-md border-b border-[#C5A059]/50"
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
              }}
            >
              {/* Gold hairline inside flap */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: 'polygon(4% 0%, 96% 0%, 50% 95%)',
                  background: 'linear-gradient(180deg, rgba(197, 160, 89, 0.08) 0%, rgba(197, 160, 89, 0.25) 100%)',
                }}
              />
            </div>
          </div>

          {/* INVITATION CARD (Tấm thiệp trượt lên khi mở phong bì) */}
          <div
            className={`absolute left-2.5 right-2.5 sm:left-5 sm:right-5 rounded-xl bg-[#FFFDF9] border border-[#C5A059]/70 p-4 sm:p-7 shadow-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? 'z-40 -translate-y-[62%] sm:-translate-y-[65%] shadow-2xl scale-100 opacity-100'
                : 'z-10 translate-y-3 scale-95 opacity-80 pointer-events-none'
            }`}
          >
            {/* Corner gold ornaments */}
            <div className="absolute top-2 left-2 text-[#C5A059] opacity-75 text-xs select-none">✦</div>
            <div className="absolute top-2 right-2 text-[#C5A059] opacity-75 text-xs select-none">✦</div>
            <div className="absolute bottom-2 left-2 text-[#C5A059] opacity-75 text-xs select-none">✦</div>
            <div className="absolute bottom-2 right-2 text-[#C5A059] opacity-75 text-xs select-none">✦</div>

            <div className="text-center">
              <span className="text-[10px] sm:text-[11px] font-caps tracking-[0.22em] uppercase text-[#8B1E22] font-semibold">
                TRÂN TRỌNG KÍNH MỜI
              </span>
              <div className="mt-1 text-xl sm:text-3xl font-display font-bold text-[#8B1E22] tracking-wide break-words">
                {guestName || 'Quý Khách & Gia Đình'}
              </div>

              <div className="my-2 flex items-center justify-center gap-3">
                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C5A059]" />
                <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22]" />
                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C5A059]" />
              </div>

              <p className="text-xs sm:text-sm font-display text-stone-700 leading-relaxed max-w-sm mx-auto">
                Đến dự tiệc mừng ngày thành hôn của hai con chúng tôi
              </p>

              <div className="my-2 text-2xl sm:text-3xl font-handwriting text-[#8B1E22] select-none font-bold">
                {groomName} & {brideName}
              </div>

              <div className="mt-2 inline-block rounded-md border border-[#8B1E22]/30 bg-[#FAF4E6] px-4 py-1.5 text-xs font-caps tracking-[0.15em] text-[#8B1E22] font-semibold">
                {weddingDateFormatted}
              </div>

              {isOpen && (
                <div className="mt-4 pt-3 border-t border-[#C5A059]/25">
                  <button
                    onClick={handleScrollToContent}
                    className="inline-flex items-center gap-1.5 text-xs font-caps font-semibold uppercase tracking-wider text-[#8B1E22] hover:text-[#5E1215] transition-colors cursor-pointer"
                  >
                    <span>Xem Toàn Bộ Thiệp Cưới</span>
                    <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FRONT POCKET OF ENVELOPE (Túi mặt trước của phong bì) */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl">
            {/* Left pocket triangle */}
            <div
              className="absolute inset-0 bg-[#F5ECDB] shadow-md border-r border-[#C5A059]/25"
              style={{
                clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
              }}
            />
            {/* Right pocket triangle */}
            <div
              className="absolute inset-0 bg-[#F5ECDB] shadow-md border-l border-[#C5A059]/25"
              style={{
                clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
              }}
            />
            {/* Bottom pocket triangle */}
            <div
              className="absolute inset-0 bg-[#EFE3CD] shadow-lg border-t border-[#C5A059]/35"
              style={{
                clipPath: 'polygon(0% 100%, 50% 48%, 100% 100%)',
              }}
            />

            {/* Front Recipient Calligraphy Label (When closed) */}
            {!isOpen && (
              <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 text-center pointer-events-auto w-[88%] sm:w-auto max-w-xs">
                <div className="rounded-xl bg-[#FAF5E8]/95 px-3.5 sm:px-5 py-2 sm:py-2.5 border border-[#C5A059]/40 shadow-sm backdrop-blur-xs">
                  <p className="text-[10px] font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold">
                    KÍNH GỬI
                  </p>
                  <p className="mt-0.5 text-xs sm:text-base font-display font-bold text-[#8B1E22] truncate">
                    {guestName || 'Quý Khách & Gia Đình'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ROYAL CRIMSON WAX SEAL BUTTON */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${
              isOpen
                ? 'top-4 opacity-0 pointer-events-none scale-50'
                : 'top-[47%] -translate-y-1/2 z-40 cursor-pointer'
            }`}
          >
            <button
              onClick={handleOpenEnvelope}
              aria-label="Mở phong bì thiệp cưới"
              className="group relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E22] rounded-full"
            >
              {/* Pulsing golden halo ring */}
              <span className="absolute -inset-3 rounded-full bg-[#C5A059]/25 animate-ping opacity-60 pointer-events-none" />
              <span className="absolute -inset-1.5 rounded-full border border-[#D4AF37]/50 pointer-events-none" />

              {/* Crimson Wax Seal Body */}
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#A31D24] via-[#8B1E22] to-[#5C1014] shadow-2xl transition-transform duration-300 group-hover:scale-105 active:scale-95 border-2 border-[#C53030]/60">
                <div className="absolute inset-1 rounded-full border border-[#FAF6EE]/20 opacity-80" />
                <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-[#480C0F]/50" />
                {/* Embossed Gold Double Happiness (囍) */}
                <div className="relative text-center select-none text-[#F6E6C5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  <div className="text-2xl sm:text-3xl font-serif font-bold leading-none">
                    囍
                  </div>
                  <div className="text-[8px] font-caps tracking-widest uppercase mt-0.5 text-[#F6D799] font-bold">
                    SON HỶ
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Action Prompt Below Envelope */}
      <div className="mt-8 text-center">
        <button
          onClick={handleOpenEnvelope}
          className="group inline-flex items-center gap-2 rounded-full border border-[#8B1E22]/30 bg-[#FAF4E6] px-6 py-2.5 text-xs sm:text-sm font-caps font-semibold tracking-wider text-[#8B1E22] shadow-sm hover:bg-[#8B1E22] hover:text-[#FAF4E6] transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-[#C5A059] group-hover:text-[#F6D799]" />
          <span>{isOpen ? 'Gập lại phong bì' : 'Chạm vào dấu sáp để mở thiệp'}</span>
        </button>
        {!isOpen && (
          <p className="mt-2 text-xs font-display text-stone-500 italic">
            (Chạm vào con dấu sáp để mở phong bì thiệp cưới)
          </p>
        )}
      </div>
    </section>
  );
};
