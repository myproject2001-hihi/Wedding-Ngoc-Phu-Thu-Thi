import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, User, CheckCircle } from 'lucide-react';
import { GuestWish } from '../types';
import { initialWishes, quickWishesPresets } from '../data/weddingData';

interface WishingWellProps {
  onOpenRsvp?: () => void;
}

export const WishingWell: React.FC<WishingWellProps> = ({ onOpenRsvp }) => {
  const [wishes, setWishes] = useState<GuestWish[]>(() => {
    const saved = localStorage.getItem('wedding_wishes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove virtual demo wishes so application starts completely clean
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  }, [wishes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newWish: GuestWish = {
      id: `wish-${Date.now()}`,
      name: name.trim(),
      relation,
      message: message.trim(),
      createdAt: 'Vừa xong',
      likes: 0,
    };

    setWishes([newWish, ...wishes]);
    setName('');
    setMessage('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
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
          Sổ Lưu Bút Chúc Phúc
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

          {/* Quick preset chips */}
          <div className="mt-4">
            <p className="text-[11px] font-caps uppercase tracking-wider text-stone-500 mb-2 font-semibold">
              Chọn nhanh lời chúc hay:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickWishesPresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(preset)}
                  className="text-left text-xs font-display text-stone-700 hover:text-[#8B1E22] border border-[#C5A059]/30 rounded-md px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#FAF0DC] transition-colors line-clamp-1"
                >
                  "{preset}"
                </button>
              ))}
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
                Bấm vào đây để gửi phản hồi tham dự tiệc cưới đến gia đình
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
                Sổ Lưu Bút Chưa Có Lời Chúc Nào
              </h4>
              <p className="mt-2 text-xs sm:text-sm font-display text-stone-600 max-w-sm leading-relaxed">
                Hãy là người đầu tiên gửi những lời chúc phúc tốt đẹp và ý nghĩa nhất tới đôi uyên ương Ngọc Phú &amp; Thu Thi!
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
};
