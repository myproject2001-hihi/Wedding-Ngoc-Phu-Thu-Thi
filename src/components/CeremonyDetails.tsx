import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Heart, Sun, Moon } from 'lucide-react';
import { WeddingInfo } from '../types';

interface CeremonyDetailsProps {
  weddingInfo: WeddingInfo;
}

export const CeremonyDetails: React.FC<CeremonyDetailsProps> = ({ weddingInfo }) => {
  const homeCeremonyTimeline = [
    {
      time: '10:00',
      title: 'Hôn Lễ Cử Hành Tại Tư Gia',
      desc: 'Nghi thức lễ gia tiên thành hôn trang trọng tại tư gia nhà trai.',
    },
    {
      time: '11:00',
      title: 'Lễ Chúc Phúc & Chụp Ảnh Kỷ Niệm',
      desc: 'Gia đình hai họ nâng ly chúc mừng hạnh phúc đôi tân lang tân nương và chụp ảnh lưu niệm.',
    },
  ];

  const eveningBanquetTimeline = [
    {
      time: '18:00',
      title: 'Đón Tiếp Quan Khách',
      desc: 'Check-in, đón tiếp người thân và chụp ảnh lưu niệm cùng cô dâu chú rể tại photobooth Sảnh Akina (Tầng 8).',
    },
    {
      time: '19:00',
      title: 'Khai Tiệc & Nghi Thức Thành Hôn',
      desc: 'Cô dâu chú rể bước vào lễ đường, trao nhẫn cưới, cắt bánh kem, rót tháp rượu tình yêu và nâng ly mừng hạnh phúc.',
    },
    {
      time: '19:45',
      title: 'Dạ Tiệc & Giao Lưu Thân Mật',
      desc: 'Thưởng thức thực đơn tiệc cưới tinh hoa cùng các tiết mục âm nhạc acoustic lãng mạn.',
    },
    {
      time: '20:30',
      title: 'Tung Hoa Cưới & Minigame',
      desc: 'Khoảnh khắc bắt hoa cưới may mắn và các tiết mục minigame vui tươi gắn kết bạn bè.',
    },
    {
      time: '21:00',
      title: 'Tiễn Khách & Trao Quà Kỷ Niệm',
      desc: 'Gia đình hai họ gửi lời cảm ơn chân thành và gửi trao món quà tri ân tới quý khách.',
    },
  ];

  return (
    <section id="lich-trinh" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header with AOS */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold text-center">
          <span>THỜI GIAN<br className="sm:hidden" /> & ĐỊA ĐIỂM</span>
          <span className="text-[#C5A059]">✦</span>
          <span>PROGRAM<br className="sm:hidden" /> & VENUES</span>
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#8B1E22] tracking-wide">
          Lễ Cưới & Tiệc Mừng
        </h2>
        <p className="mt-2 text-sm sm:text-base font-display text-stone-600 leading-relaxed">
          Thứ Bảy, 19/12/2026<br />
          Nhằm ngày 11 tháng 11 năm Bính Ngọ
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* CỘT 1 (Left 6/12): THÔNG TIN TỔ CHỨC TIỆC CƯỚI */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="800"
          className="lg:col-span-6 flex flex-col"
        >
          <div className="w-full h-full rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/50 p-5 sm:p-7 lg:p-8 shadow-lg flex flex-col justify-between">
          <div>
            <div className="inline-block rounded-md border border-[#8B1E22]/30 bg-[#FAF4E6] px-4 py-1.5 text-xs font-caps font-bold uppercase tracking-wider text-[#8B1E22] mb-5">
              THÔNG TIN TỔ CHỨC TIỆC CƯỚI
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#8B1E22] leading-snug">
              Trung Tâm Hội Nghị<br />
              Tiệc Cưới Asiana Plaza<br />
              Tân Phú
            </h3>
            <p className="text-sm sm:text-base font-caps uppercase tracking-wider text-[#C5A059] font-bold mt-1.5">
              {weddingInfo.receptionVenue.hall}
            </p>

            <div className="mt-6 space-y-5 text-stone-800">
              {/* Thời gian tiệc tối tại nhà hàng */}
              <div className="flex items-start gap-3.5">
                <Clock className="h-6 w-6 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    Thời gian tiệc tối: <br/>
                    Đón Khách: 18H00 <br className="sm:hidden" />
                    Khai Tiệc: 19H00
                  </p>
                  <p className="text-sm sm:text-base font-display text-[#8B1E22] font-semibold mt-1">
                    Thứ Bảy, ngày 19 tháng 12 năm 2026
                  </p>
                  <p className="text-xs sm:text-sm font-display text-stone-600 italic">
                    ({weddingInfo.lunarDate})
                  </p>
                </div>
              </div>

              {/* Địa chỉ nhà hàng */}
              <div className="flex items-start gap-3.5">
                <MapPin className="h-6 w-6 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    Địa chỉ nhà hàng:
                  </p>
                  <p className="text-sm sm:text-base font-display text-stone-800 leading-relaxed mt-1">
                    {weddingInfo.receptionVenue.address}
                  </p>
                </div>
              </div>

              {/* Lễ gia tiên tại tư gia (10h00 Trưa Thứ Bảy) - Ngắt dòng sau chữ Tư gia */}
              <div className="pt-4 border-t border-[#C5A059]/25 flex items-start gap-3.5">
                <Calendar className="h-6 w-6 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    Hôn Lễ Cử Hành Tại Tư Gia<br />
                    (Giờ Trưa): 10H00 – Thứ Bảy
                  </p>
                  <p className="text-sm sm:text-base font-display text-[#8B1E22] font-semibold mt-1">
                    19 | 12 | 2026 <br className="sm:hidden" />({weddingInfo.lunarDate})
                  </p>
                  <p className="text-xs sm:text-sm font-display text-stone-600 italic mt-0.5">
                    Nghi thức thành hôn tại tư gia gia đình nhà trai
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button: Chỉ Đường Đến Nhà Hàng */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#C5A059]/25">
            <a
              href={weddingInfo.receptionVenue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E22] px-5 py-3.5 text-xs sm:text-sm font-caps font-bold uppercase tracking-wider text-[#FAF4E6] shadow-md hover:bg-[#6E1418] hover:shadow-lg transition-all group cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-[#C5A059] group-hover:scale-110 transition-transform" />
              <span>Chỉ Đường Đến Nhà Hàng</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* CỘT 2 (Right 6/12): TIMELINE */}
      <div
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="800"
        className="lg:col-span-6 flex flex-col"
      >
        <div className="w-full h-full rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/50 p-5 sm:p-7 lg:p-8 shadow-lg flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-block rounded-md border border-[#8B1E22]/30 bg-[#FAF4E6] px-4 py-1.5 text-xs font-caps font-bold uppercase tracking-wider text-[#8B1E22]">
                TIMELINE CHƯƠNG TRÌNH ĐÁM CƯỚI
              </div>
            </div>

            {/* PHẦN 1: GIỜ TRƯA - HÔN LỄ TẠI TƯ GIA */}
            <div className="rounded-xl border border-[#C5A059]/30 bg-[#FAF6EE] p-4">
              <div className="flex items-center gap-2 text-[#8B1E22] font-caps font-bold text-xs uppercase tracking-wider mb-3">
                <Sun className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="leading-snug">
                  Buổi Sáng & Buổi Trưa:<br />
                  Hôn Lễ Tại Tư Gia
                </span>
              </div>
              <div className="relative border-l-2 border-[#C5A059]/40 ml-2.5 space-y-3.5 pl-4">
                {homeCeremonyTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FAF5E8] border border-[#C5A059]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8B1E22]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-caps font-bold text-xs text-[#8B1E22] tabular-nums bg-[#FAF0DC] px-2 py-0.5 rounded border border-[#C5A059]/30">
                        {item.time}
                      </span>
                      <h4 className="font-display font-bold text-sm text-stone-900 leading-snug">
                        {item.title.includes('&') ? (
                          <>
                            {item.title.split('&')[0].trim()}
                            <br className="sm:hidden" />
                            &amp; {item.title.split('&')[1].trim()}
                          </>
                        ) : (
                          item.title
                        )}
                      </h4>
                    </div>
                    <p className="mt-0.5 text-xs font-display text-stone-600">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PHẦN 2: BUỔI TỐI - TIỆC CƯỚI CHÍNH TẠI NHÀ HÀNG ASIANA PLAZA */}
            <div className="rounded-xl border border-[#8B1E22]/20 bg-[#FAF5E8] p-4">
              <div className="flex items-center gap-2 text-[#8B1E22] font-caps font-bold text-xs uppercase tracking-wider mb-3">
                <Moon className="h-4 w-4 text-[#8B1E22] shrink-0" />
                <span className="leading-snug">
                  Buổi Tối:<br />
                  Tiệc Cưới Tại<br className="sm:hidden" /> Nhà Hàng Asiana Plaza
                </span>
              </div>
              <div className="relative border-l-2 border-[#8B1E22]/30 ml-2.5 space-y-3.5 pl-4">
                {eveningBanquetTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FAF5E8] border border-[#8B1E22]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8B1E22]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-caps font-bold text-xs text-[#8B1E22] tabular-nums bg-white px-2 py-0.5 rounded border border-[#8B1E22]/30">
                        {item.time}
                      </span>
                      <h4 className="font-display font-bold text-sm text-stone-900 leading-snug">
                        {item.title.includes('&') ? (
                          <>
                            {item.title.split('&')[0].trim()}
                            <br className="sm:hidden" />
                            &amp; {item.title.split('&')[1].trim()}
                          </>
                        ) : (
                          item.title
                        )}
                      </h4>
                    </div>
                    <p className="mt-0.5 text-xs font-display text-stone-600">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#C5A059]/20 text-center">
            <p className="text-xs sm:text-sm font-display text-stone-600 italic flex items-center justify-center gap-1.5 leading-relaxed">
              <Heart className="h-3.5 w-3.5 text-[#8B1E22] fill-[#8B1E22] shrink-0" />
              <span>
                Sự hiện diện của quý khách<br />
                là niềm vinh hạnh cho gia đình chúng tôi!
              </span>
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
