import React from 'react';

interface TopBarProps {
  groomName: string;
  brideName: string;
  onOpenRsvp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenRsvp,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-6 border-b border-[#C5A059]/30 bg-[#FAF6EE]/95 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-md">
      {/* Zone 1: P & T as requested in Hình 1 */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          window.dispatchEvent(new CustomEvent('reset-scroll-reveal'));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('reset-scroll-reveal'));
          }, 400);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('reset-scroll-reveal'));
          }, 800);
        }}
        className="font-display text-xl sm:text-2xl font-bold tracking-wider text-[#8B1E22] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center select-none cursor-pointer"
        title="Lên đầu trang"
      >
        <span>P</span>
        <span className="font-calligraphy text-2xl sm:text-3xl text-[#C5A059] mx-1 leading-none font-bold">
          &
        </span>
        <span>T</span>
      </a>

      {/* Zone 2: Navigation links */}
      <nav className="hidden md:flex items-center gap-4 lg:gap-7 text-xs font-caps tracking-[0.14em] uppercase text-stone-700 font-semibold">
        <a
          href="#thiep-moi"
          className="whitespace-nowrap shrink-0 hover:text-[#8B1E22] transition-colors"
        >
          Lời Mời
        </a>
        <a
          href="#lich-trinh"
          className="whitespace-nowrap shrink-0 hover:text-[#8B1E22] transition-colors"
        >
          Lịch Trình
        </a>
        <a
          href="#chuyen-tinh-yeu"
          className="whitespace-nowrap shrink-0 hover:text-[#8B1E22] transition-colors"
        >
          Chuyện Tình
        </a>
        <a
          href="#album-anh"
          className="whitespace-nowrap shrink-0 hover:text-[#8B1E22] transition-colors"
        >
          Album Cưới
        </a>
        <a
          href="#so-luu-but"
          className="whitespace-nowrap shrink-0 hover:text-[#8B1E22] transition-colors"
        >
          Sổ Lưu Bút
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenRsvp}
          className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-caps font-semibold uppercase tracking-wider text-[#FAF4E6] bg-[#8B1E22] rounded-lg hover:bg-[#6E1418] transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          Xác Nhận Tham Dự
        </button>
      </div>
    </header>
  );
};
