import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, CheckCircle, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { GuestWish } from '../types';
import { initialWishes, quickWishesPresets } from '../data/weddingData';
import { subscribeToWishes, submitWishToFirebase, likeWishInFirebase } from '../lib/firebase';

interface WishingWellProps {
  onOpenRsvp?: () => void;
}

export const WishingWell: React.FC<WishingWellProps> = ({ onOpenRsvp }) => {
  const cardsScrollRef = useRef<HTMLDivElement | null>(null);

  const handleScrollCards = (direction: 'left' | 'right') => {
    if (!cardsScrollRef.current) return;
    const scrollAmount = direction === 'left' ? -240 : 240;
    cardsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const [wishes, setWishes] = useState<GuestWish[]>(() => {
    const saved = localStorage.getItem('wedding_wishes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((w: GuestWish) => !['wish-1', 'wish-2', 'wish-3'].includes(w.id));
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Người thân của nhà chú rể cô dâu');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Subscribe to real-time Firestore guestbook updates
  useEffect(() => {
    const unsubscribe = subscribeToWishes((firebaseWishes) => {
      if (firebaseWishes) {
        setWishes(firebaseWishes);
        localStorage.setItem('wedding_wishes', JSON.stringify(firebaseWishes));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  }, [wishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    setIsSubmitting(true);

    try {
      await submitWishToFirebase(trimmedName, relation, trimmedMessage);
    } catch {
      // Local fallback in case offline
      const newWish: GuestWish = {
        id: `wish-${Date.now()}`,
        name: trimmedName,
        relation,
        message: trimmedMessage,
        createdAt: 'Vừa xong',
        likes: 0,
      };
      setWishes((prev) => [newWish, ...prev]);
    } finally {
      setIsSubmitting(false);
      setName('');
      setMessage('');
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 4000);
    }
  };

  return (
    <section id="so-luu-but" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header with AOS */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold text-center">
          <span>GỬI TRỌN<br className="sm:hidden" /> YÊU THƯƠNG</span>
          <span className="text-[#C5A059]">✦</span>
          <span>GUESTBOOK<br className="sm:hidden" /> & WISHES</span>
        </div>
        <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-[#8B1E22] tracking-wide">
          Sổ Lưu Bút <br className="sm:hidden" />Chúc Phúc
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-display text-stone-600 max-w-lg mx-auto">
          Mỗi lời chúc thân thương của bạn là món quà vô giá đồng hành cùng khởi đầu mới của cô dâu chú rể.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wish Form (Left 5 cols) with AOS */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="800"
          className="lg:col-span-5"
        >
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/40 p-6 sm:p-8 shadow-md">
          <h3 className="text-xl font-display font-bold text-[#8B1E22] flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#C5A059]" />
            <span>Gửi Lời Chúc Mừng</span>
          </h3>

          {/* Mẫu thiết kế mới: Bưu thiếp lời chúc nghệ thuật (Vuốt xem & chạm để tự điền) */}
          <div className="mt-4 pt-3 border-t border-[#C5A059]/25">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-caps uppercase tracking-wider text-[#8B1E22] font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Gợi ý lời chúc ý nghĩa:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-display text-stone-500 italic hidden sm:inline">
                  Vuốt ngang để xem thêm
                </span>
                <button
                  type="button"
                  onClick={() => handleScrollCards('left')}
                  className="h-6 w-6 rounded-full bg-[#FAF4E6] hover:bg-[#8B1E22] text-[#8B1E22] hover:text-white border border-[#C5A059]/40 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  aria-label="Xem câu chúc trước"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollCards('right')}
                  className="h-6 w-6 rounded-full bg-[#FAF4E6] hover:bg-[#8B1E22] text-[#8B1E22] hover:text-white border border-[#C5A059]/40 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  aria-label="Xem câu chúc sau"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Dải bưu thiếp lời chúc trượt ngang: Hiển thị 100% trọn vẹn từng câu chữ, không bao giờ bị cắt ... */}
            <div
              ref={cardsScrollRef}
              className="flex gap-2.5 overflow-x-auto pb-2 pt-1 snap-x scrollbar-thin scrollbar-thumb-[#C5A059]/40 scrollbar-track-transparent py-0.5"
            >
              {[
                {
                  badge: '🌸 Trăm Năm Hạnh Phúc',
                  text: 'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! Chúc cho tình yêu của Phú và Thi mãi bền chặt, cùng nhau sẻ chia mọi khoảnh khắc ngọt ngào của cuộc sống.',
                },
                {
                  badge: '🏡 Tổ Ấm Yêu Thương',
                  text: 'Chúc tổ ấm nhỏ luôn ngập tràn tiếng cười, bình an và ấm áp. Mong hai bạn luôn là điểm tựa bình yên nhất của nhau sau những bộn bề cuộc sống.',
                },
                {
                  badge: '✨ Mừng Ngày Chung Đôi',
                  text: 'Mừng ngày hai bạn chính thức về chung một nhà! Chúc chặng đường mới luôn rực rỡ niềm vui, vạn sự cát tường và cùng nhau chạm tới mọi ước mơ.',
                },
                {
                  badge: '💍 Son Sắt Trọn Đời',
                  text: 'Chúc tân lang tân nương mãi mãi một lòng son sắt, luôn thấu hiểu, bao dung và nắm chặt tay nhau vượt qua mọi thử thách trên đường đời.',
                },
                {
                  badge: '🌾 Tài Lộc Viên Mãn',
                  text: 'Hôn nhân hạnh phúc viên mãn, công danh sự nghiệp thăng hoa, gia đạo an khang thịnh vượng và cuộc sống luôn sung túc, trọn vẹn đủ đầy.',
                },
                {
                  badge: '🕊️ Bách Niên Giai Lão',
                  text: 'Gặp gỡ là duyên, nên vợ nên chồng là phúc trăm năm. Chúc hai bạn bách niên giai lão, dù năm tháng đổi thay vẫn vẹn nguyên nghĩa tình thủy chung.',
                },
                {
                  badge: '🍃 Bình Yên Chung Lối',
                  text: 'Chúc cho mỗi sớm mai thức dậy hai bạn đều thấy nụ cười của nhau, cùng nấu những bữa cơm ấm áp và cùng già đi trong sự dịu dàng, êm đềm.',
                },
                {
                  badge: '🌟 Đồng Lòng Dựng Xây',
                  text: 'Chúc Phú và Thi luôn là hậu phương vững chắc và là người bạn đồng hành tuyệt vời nhất của nhau, đồng tâm hiệp lực xây đắp mái ấm vững bền.',
                },
                {
                  badge: '👶 Hạnh Phúc Đơm Hoa',
                  text: 'Chúc hai bạn sớm đón những thiên thần nhỏ kháu khỉnh, tiếng cười trẻ thơ rộn vang để niềm hạnh phúc gia đình thêm trọn vẹn và viên mãn.',
                },
                {
                  badge: '❤️ Vẹn Nguyên Thuở Đầu',
                  text: 'Chúc tình yêu của hai bạn luôn tươi mới và nồng nàn như ngày đầu tiên gặp gỡ, mỗi ngày bên nhau đều là một ngày ngập tràn điều kỳ diệu và lãng mạn.',
                },
              ].map((item, idx) => {
                const isSelected = message === item.text;
                return (
                  <div
                    key={idx}
                    onClick={() => setMessage(item.text)}
                    className={`relative shrink-0 w-[260px] sm:w-[290px] snap-center rounded-xl p-3 sm:p-3.5 border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xs select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#8B1E22] to-[#6E1418] text-[#FAF4E6] border-[#C5A059] shadow-md ring-2 ring-[#C5A059]/60'
                        : 'bg-[#FAF6EE] hover:bg-[#FAF0DC] border-[#C5A059]/40 text-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`text-[10px] font-caps font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-[#F5E6C8]'
                              : 'bg-[#FAF0DC] text-[#8B1E22] border border-[#C5A059]/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                        <span
                          className={`text-base font-serif leading-none ${
                            isSelected ? 'text-[#F5E6C8]' : 'text-[#C5A059]'
                          }`}
                        >
                          “
                        </span>
                      </div>

                      <p
                        className={`text-xs font-display leading-relaxed ${
                          isSelected ? 'text-stone-100 font-medium' : 'text-stone-700'
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/15 flex items-center justify-between text-[11px] font-semibold">
                      <span className={isSelected ? 'text-[#F5E6C8]' : 'text-[#8B1E22]'}>
                        {isSelected ? '✓ Đã chọn câu này' : '+ Chạm để áp dụng'}
                      </span>
                      {isSelected && (
                        <div className="h-4 w-4 rounded-full bg-[#C5A059] text-[#8B1E22] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-600 mb-1 font-semibold">
                Tên hoặc danh xưng của bạn *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Anh Minh & Chị Lan, Bạn Tuấn Anh..."
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-display text-stone-800 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22]"
              />
            </div>

            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-600 mb-1 font-semibold">
                Mối quan hệ với cô dâu chú rể
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-display text-stone-800 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22]"
              >
                <option value="Người thân của nhà chú rể cô dâu">Người thân của nhà chú rể cô dâu</option>
                <option value="Bạn của chú rể">Bạn của chú rể</option>
                <option value="Bạn của cô dâu">Bạn của cô dâu</option>
                <option value="Bạn chung hai bên">Bạn chung hai bên</option>
                <option value="Đồng nghiệp & đối tác">Đồng nghiệp & đối tác</option>
                <option value="Khách quý của gia đình">Khách quý của gia đình</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-600 mb-1 font-semibold">
                Lời chúc phúc chân thành *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập lời nhắn gửi của bạn tới cô dâu và chú rể..."
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-display text-stone-800 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22]"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#8B1E22] py-2.5 px-4 text-xs sm:text-sm font-display font-semibold uppercase tracking-wider text-[#FAF4E6] shadow-sm hover:bg-[#6E1418] transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Gửi Lời Chúc Phúc</span>
            </button>

            {isSubmitted && (
              <p className="text-center text-xs font-display text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-lg">
                Cảm ơn bạn! Lời chúc đã được lưu vào sổ lưu bút thành công.
              </p>
            )}

            {/* Attendance Confirmation Button at bottom of card as requested in Hình 1 */}
            <div className="pt-4 mt-2 border-t border-[#C5A059]/30">
              <button
                type="button"
                onClick={onOpenRsvp}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#8B1E22] bg-[#FAF4E6] py-2.5 px-4 text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[#8B1E22] hover:bg-[#8B1E22] hover:text-[#FAF4E6] shadow-xs transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Xác Nhận Tham Dự</span>
              </button>
              <p className="mt-1.5 text-center text-[11px] font-display text-stone-500 italic">
                Bấm vào đây để gửi phản hồi tham dự tiệc cưới <br className="sm:hidden" />đến với gia đình chúng con
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Wishes List (Right 7 cols) with AOS */}
      <div
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="800"
        className="lg:col-span-7"
      >
        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
          {wishes.length > 0 ? (
            wishes.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#C5A059]/30 bg-[#FFFDF9] p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF4E6] border border-[#C5A059]/40 text-[#8B1E22]">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold text-[#8B1E22]">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-display text-stone-500">
                        <span>{item.relation}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-sm font-display text-stone-800 leading-relaxed pl-11">
                  "{item.message}"
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#C5A059]/40 bg-[#FFFDF9]/90 p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[260px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5E8] border border-[#C5A059]/50 text-[#8B1E22] mb-3">
                <MessageCircle className="h-7 w-7 text-[#C5A059]" />
              </div>
              <h4 className="font-display text-lg font-bold text-[#8B1E22]">
                Sổ Lưu Bút <br className="sm:hidden" />
                Chưa Có Lời Chúc Nào
              </h4>
              <p className="mt-2 text-xs sm:text-sm font-display text-stone-600 max-w-sm leading-relaxed">
                Hãy là người đầu tiên gửi những lời chúc phúc tốt đẹp và ý nghĩa nhất <br className="sm:hidden" />tới đôi uyên ương Ngọc Phú &amp; Thu Thi!
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
};
