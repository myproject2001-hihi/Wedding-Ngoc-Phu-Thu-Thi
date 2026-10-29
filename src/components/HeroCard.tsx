import React, { useState, useEffect } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { WeddingInfo } from '../types';

interface HeroCardProps {
  weddingInfo: WeddingInfo;
  guestName: string;
  onOpenRsvp: () => void;
  onOpenGiftBox?: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  weddingInfo,
  guestName,
  onOpenRsvp,
}) => {
  // Countdown calculation
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(`${weddingInfo.weddingDate}T${weddingInfo.weddingTime}:00`).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [weddingInfo.weddingDate, weddingInfo.weddingTime]);

  return (
    <section id="thiep-moi" className="relative py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Outer Card Frame with double gold hairline border & AOS */}
      <div data-aos="fade-up" data-aos-duration="900">
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#FFFDF9] border-2 border-[#C5A059]/60 p-4 sm:p-8 lg:p-12 shadow-2xl overflow-hidden">
        {/* Vintage ornate corner ornaments */}
        <div className="absolute top-3 left-3 text-[#C5A059] opacity-80 select-none text-base">✦</div>
        <div className="absolute top-3 right-3 text-[#C5A059] opacity-80 select-none text-base">✦</div>
        <div className="absolute bottom-3 left-3 text-[#C5A059] opacity-80 select-none text-base">✦</div>
        <div className="absolute bottom-3 right-3 text-[#C5A059] opacity-80 select-none text-base">✦</div>

        {/* Hình 1: Đổi design huy hiệu trái tim lồng chữ P&T đè lên viền cực kỳ sang trọng và nghệ thuật (khớp đúng ảnh mẫu mới gửi) */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* SVG Heart Crest matching the uploaded reference image exactly */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full drop-shadow-md select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goldLuxury3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C5A059" />
                  <stop offset="40%" stopColor="#F5E6CC" />
                  <stop offset="70%" stopColor="#9E7632" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
                <linearGradient id="creamHeart3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDF9" />
                  <stop offset="100%" stopColor="#FAF2E2" />
                </linearGradient>
              </defs>

              {/* Heart Shape */}
              <path
                d="M100 25 C115 10, 142 12, 160 26 C178 40, 187 64, 180 89 C172 116, 146 142, 100 185 C54 142, 28 116, 20 89 C13 64, 22 40, 40 26 C58 12, 85 10, 100 25 Z"
                fill="url(#creamHeart3)"
                stroke="url(#goldLuxury3)"
                strokeWidth="3.5"
              />
              {/* Inner dashed Heart outline */}
              <path
                d="M100 37 C112 25, 134 27, 148 39 C162 51, 170 71, 163 92 C156 115, 134 137, 100 171 C66 137, 44 115, 37 92 C30 71, 38 51, 52 39 C66 27, 88 25, 100 37 Z"
                fill="#FFFDF9"
                stroke="url(#goldLuxury3)"
                strokeWidth="1.8"
                strokeDasharray="4 2"
              />
              {/* Top ornaments */}
              <circle cx="100" cy="20" r="3.5" fill="url(#goldLuxury3)" />
              <circle cx="89" cy="22" r="2.5" fill="url(#goldLuxury3)" />
              <circle cx="111" cy="22" r="2.5" fill="url(#goldLuxury3)" />
              <circle cx="100" cy="191" r="3.5" fill="url(#goldLuxury3)" />
            </svg>

            {/* P&T Handwriting monogram overlapping gracefully out of the heart (khớp ảnh) */}
            <div className="absolute inset-0 flex items-center justify-center pt-2.5">
              <span className="font-wedding-names text-4xl sm:text-5xl font-bold text-[#8B1E22] select-none tracking-tight drop-shadow-sm scale-110">
                P&T
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold mt-3">
            THƯ MỜI TÂN HÔN
          </div>
          <div className="mt-1.5 h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto" />
        </div>

        {/* Two Families Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-center border-y border-[#C5A059]/30 py-6">
          {/* Nhà Trai */}
          <div className="space-y-1">
            <p className="text-xs font-caps uppercase tracking-widest text-[#8B1E22] font-bold">
              NHÀ TRAI
            </p>
            <p className="font-display text-base text-stone-800">
              Ông: <span className="font-semibold text-stone-900">{weddingInfo.groomFather}</span>
            </p>
            <p className="font-display text-base text-stone-800">
              Bà: <span className="font-semibold text-stone-900">{weddingInfo.groomMother}</span>
            </p>
            <p className="text-xs font-display text-[#8B1E22] font-medium pt-0.5">
              {weddingInfo.groomHometown || 'TP.HCM'}
            </p>
          </div>

          {/* Nhà Gái */}
          <div className="space-y-1">
            <p className="text-xs font-caps uppercase tracking-widest text-[#8B1E22] font-bold">
              NHÀ GÁI
            </p>
            <p className="font-display text-base text-stone-800">
              Ông: <span className="font-semibold text-stone-900">{weddingInfo.brideFather}</span>
            </p>
            <p className="font-display text-base text-stone-800">
              Bà: <span className="font-semibold text-stone-900">{weddingInfo.brideMother}</span>
            </p>
            <p className="text-xs font-display text-[#8B1E22] font-medium pt-0.5">
              {weddingInfo.brideHometown || 'Tỉnh Đắk Lắk'}
            </p>
          </div>
        </div>

        {/* Couple Section */}
        <div className="mt-8 text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-display uppercase tracking-widest text-stone-600 mb-4 font-semibold text-center leading-relaxed">
            TRÂN TRỌNG BÁO TIN<br />
            LỄ TÂN HÔN CỦA CON CHÚNG TÔI
          </p>

          <div className="relative rounded-2xl border border-[#C5A059]/50 bg-gradient-to-b from-[#FAF5E8]/90 to-[#FFFDF9] p-6 sm:p-8 shadow-xs">
            {/* Groom Row with handwriting font (Hình 1: Ngắt 2 chữ trên mobile, chữ to hơn, in đậm) */}
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-[11px] sm:text-xs font-caps tracking-[0.2em] uppercase text-[#8B1E22] font-semibold bg-[#FAF0DC] px-2.5 py-0.5 rounded border border-[#C5A059]/30">
                {weddingInfo.groomTitle}
              </span>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-wedding-names font-bold text-[#8B1E22] tracking-wide text-center py-1 select-none leading-tight">
                Huỳnh Lê <br className="block sm:hidden" /> Ngọc Phú
              </h2>
            </div>

            {/* Golden Ampersand Divider */}
            <div className="my-2 sm:my-2.5 flex items-center justify-center gap-3">
              <span className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#C5A059]" />
              <span className="font-calligraphy text-3xl sm:text-4xl text-[#C5A059] leading-none select-none font-bold">
                &
              </span>
              <span className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#C5A059]" />
            </div>

            {/* Bride Row with handwriting font (Hình 1: Ngắt 2 chữ trên mobile, chữ to hơn, in đậm) */}
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-[11px] sm:text-xs font-caps tracking-[0.2em] uppercase text-[#8B1E22] font-semibold bg-[#FAF0DC] px-2.5 py-0.5 rounded border border-[#C5A059]/30">
                {weddingInfo.brideTitle}
              </span>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-wedding-names font-bold text-[#8B1E22] tracking-wide text-center py-1 select-none leading-tight">
                Huỳnh Thị <br className="block sm:hidden" /> Thu Thi
              </h2>
            </div>

            {/* Ceremony at Home Highlights (10h00 Thứ Bảy 19/12/2026) - Ngắt dòng sau chữ Tư gia */}
            <div className="mt-5 pt-4 border-t border-[#C5A059]/30 text-stone-700 text-xs sm:text-sm font-display">
              <p className="font-semibold text-stone-800 leading-relaxed">
                Đến dự tiệc mừng ngày thành hôn<br />
                của hai con chúng tôi
              </p>
              <p className="text-[#8B1E22] font-bold text-base mt-2 tracking-wider">
                19 | 12 | 2026
              </p>
              <p className="text-stone-500 text-xs italic">
                ({weddingInfo.lunarDate})
              </p>
            </div>
          </div>
        </div>

        {/* Couple Portrait Photo */}
        <div className="mt-8 relative max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-xl border-4 border-[#FAF4E6] shadow-xl">
            <div className="absolute inset-0 border border-[#C5A059]/60 pointer-events-none z-10 rounded-lg" />
            <img
              src={weddingInfo.coverImage}
              alt="Ảnh cưới Huỳnh Lê Ngọc Phú & Huỳnh Thị Thu Thi"
              className="w-full aspect-[3/4] max-h-[520px] object-cover object-top hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('anh1.jpg')) {
                  target.src = '/assets/anh1.jpg';
                }
              }}
            />
            {/* Scrim gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 text-center z-10">
              <p className="text-white font-display text-sm tracking-wider leading-relaxed">
                "Sự hiện diện của bạn<br />
                là niềm hạnh phúc lớn nhất<br className="sm:hidden" />{" "}
                của chúng tôi"
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Guest Invitee Invitation Box */}
        <div className="mt-10 rounded-2xl bg-[#FAF5E8] border border-[#C5A059]/50 p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-xs">
          <p className="text-xs font-caps uppercase tracking-[0.25em] text-[#8B1E22] font-bold">
            TRÂN TRỌNG KÍNH MỜI
          </p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-display font-bold text-[#8B1E22]">
            {guestName || 'Quý Khách & Gia Đình'}
          </p>
          <p className="mt-3 text-sm sm:text-base font-display text-stone-700 leading-relaxed max-w-lg mx-auto">
            Đến dự buổi tiệc chung vui<br className="sm:hidden" /> cùng gia đình chúng tôi tại:
            <br />
            <strong className="text-[#8B1E22] font-bold text-base sm:text-lg block mt-1.5 leading-snug">
              TRUNG TÂM HỘI NGHỊ<br />
              TIỆC CƯỚI ASIANA PLAZA
            </strong>
            <span className="text-[#8B1E22] font-bold block text-sm sm:text-base">
              TÂN PHÚ - SẢNH AKINA (TẦNG 8)
            </span>
            <span className="text-stone-600 block text-xs sm:text-sm mt-1">
              284-286 Vườn Lài - P. Phú Thọ Hòa - TPHCM
            </span>
          </p>

          <div className="mt-4 pt-3 border-t border-[#C5A059]/30 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 text-xs sm:text-sm font-caps text-[#8B1E22] font-bold">
            <span>🍸 Đón Khách: 18H00</span>
            <span className="hidden sm:inline text-[#C5A059]">✦</span>
            <span>🍴 Khai Tiệc: 19H00</span>
          </div>
        </div>

        {/* Real-time Countdown Timer to Dec 19, 2026 */}
        <div className="mt-10 pt-6 border-t border-[#C5A059]/30 text-center">
          <p className="text-xs font-caps tracking-[0.25em] uppercase text-stone-500 mb-4 font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
            <span className="text-center">ĐẾM NGƯỢC ĐẾN<br className="sm:hidden" /> NGÀY THÀNH HÔN (19/12/2026)</span>
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
          </p>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 max-w-md mx-auto">
            <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF6EE] p-2 sm:p-3 shadow-xs">
              <span className="block text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#8B1E22] tabular-nums">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-[11px] font-caps uppercase tracking-wider text-stone-500 font-medium">
                Ngày
              </span>
            </div>
            <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF6EE] p-2 sm:p-3 shadow-xs">
              <span className="block text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#8B1E22] tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-caps uppercase tracking-wider text-stone-500 font-medium">
                Giờ
              </span>
            </div>
            <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF6EE] p-2 sm:p-3 shadow-xs">
              <span className="block text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#8B1E22] tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-caps uppercase tracking-wider text-stone-500 font-medium">
                Phút
              </span>
            </div>
            <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF6EE] p-2 sm:p-3 shadow-xs">
              <span className="block text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#8B1E22] tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-caps uppercase tracking-wider text-stone-500 font-medium">
                Giây
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action RSVP button */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <button
            onClick={onOpenRsvp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E22] px-8 py-3.5 text-xs sm:text-sm font-caps font-bold uppercase tracking-wider text-[#FAF4E6] shadow-md hover:bg-[#6E1418] hover:shadow-lg active:scale-95 transition-all max-w-sm cursor-pointer"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Xác Nhận Tham Dự</span>
          </button>
        </div>
      </div>
      </div>
    </section>
  );
};
