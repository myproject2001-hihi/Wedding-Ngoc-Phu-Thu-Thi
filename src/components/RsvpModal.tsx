import React, { useState } from 'react';
import { X, CheckCircle, Users, User, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { triggerFireworks } from '../utils/fireworks';
import { saveGuestRsvp } from '../utils/guestStorage';
import { RsvpData } from '../types';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGuestName?: string;
  weddingDateFormatted: string;
  onSubmitted?: (guest: { name: string; attending: 'yes' | 'no'; guestCount: number }) => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  defaultGuestName = '',
  weddingDateFormatted,
  onSubmitted,
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [relationship, setRelationship] = useState('Người thân của nhà chú rể cô dâu');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [wishes, setWishes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Vui lòng nhập họ và tên của bạn để xác nhận tham dự!');
      return;
    }

    const guestNameValue = name.trim();

    const rsvpItem: RsvpData = {
      id: String(Date.now()),
      name: guestNameValue,
      relationship,
      attending,
      guestCount: attending === 'yes' ? guestCount : 0,
      wishes: wishes.trim(),
      submittedAt: new Date().toLocaleString('vi-VN'),
    };

    // Save to high-capacity persistent storage (IndexedDB + localStorage, supporting 1000+ guests)
    saveGuestRsvp(rsvpItem);

    // Also push to wishes if wishes provided
    if (wishes.trim()) {
      const existingWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
      existingWishes.unshift({
        id: 'wish-' + Date.now(),
        name: guestNameValue,
        relation: relationship,
        message: wishes.trim(),
        createdAt: 'Vừa xong',
        likes: 0,
      });
      localStorage.setItem('wedding_wishes', JSON.stringify(existingWishes));
    }

    // Trigger celebratory fireworks effect across the screen
    triggerFireworks(4500);

    // Trigger toast notification callback ("bảng có dòng chạy ở trên")
    if (onSubmitted) {
      onSubmitted({
        name: guestNameValue,
        attending,
        guestCount: attending === 'yes' ? guestCount : 0,
      });
    }

    // Reset and close modal immediately (Bỏ bảng to, chỉ giữ bảng có dòng chạy ở trên)
    setName('');
    setNameError('');
    setWishes('');
    setGuestCount(1);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/60 shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="relative bg-[#FAF4E6] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="pr-8">
            <span className="text-[10px] sm:text-[11px] font-caps tracking-[0.25em] text-[#8B1E22] uppercase font-bold block">
              XÁC NHẬN THAM DỰ
            </span>
            <h3 className="text-base sm:text-xl font-display font-bold text-stone-900 leading-tight">
              Gửi Lời Phản Hồi Đến Cô Dâu & Chú Rể
            </h3>
            <p className="text-[11px] sm:text-xs font-display text-stone-500 mt-0.5 line-clamp-1">
              Ngày cưới: {weddingDateFormatted}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full p-2 text-stone-500 hover:bg-[#FAF0DC] hover:text-[#8B1E22] transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="rounded-xl bg-[#FAF5E8] border border-[#C5A059]/30 p-3 text-xs font-display text-stone-600 flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#8B1E22] fill-[#8B1E22] shrink-0" />
              <span>
                Vui lòng gửi phản hồi sớm để gia đình chuẩn bị đón tiếp bạn chu đáo nhất!
              </span>
            </div>

            {/* Guest Name (Bắt buộc điền mới xác nhận) */}
            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-700 mb-1.5 font-bold">
                Họ và tên của bạn <span className="text-[#8B1E22]">* (Bắt buộc điền)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setNameError('');
                  }}
                  placeholder={defaultGuestName || "Quý Khách & Gia Đình"}
                  className={`w-full rounded-xl border ${
                    nameError ? 'border-red-500 ring-2 ring-red-400 bg-red-50/20' : 'border-stone-300 bg-white'
                  } pl-10 pr-3.5 py-2.5 text-sm sm:text-base font-display text-stone-900 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22] transition-colors placeholder:text-stone-400`}
                />
              </div>
              {nameError && (
                <p className="mt-1.5 text-xs text-red-600 font-display font-medium flex items-center gap-1">
                  <span>⚠️</span> {nameError}
                </p>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-700 mb-1.5 font-bold">
                Mối quan hệ với cô dâu chú rể *
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-8 py-2.5 text-sm sm:text-base font-display text-stone-900 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22] transition-colors appearance-none"
                >
                  <option value="Người thân của nhà chú rể cô dâu">Người thân của nhà chú rể cô dâu</option>
                  <option value="Bạn của chú rể">Bạn của chú rể</option>
                  <option value="Bạn của cô dâu">Bạn của cô dâu</option>
                  <option value="Bạn chung hai bên">Bạn chung hai bên</option>
                  <option value="Đồng nghiệp & đối tác">Đồng nghiệp & đối tác</option>
                  <option value="Khách quý của gia đình">Khách quý của gia đình</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Attendance Choice */}
            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-700 mb-2 font-bold">
                Khả năng tham dự
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setAttending('yes')}
                  className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                    attending === 'yes'
                      ? 'border-[#8B1E22] bg-[#FAF4E6] text-[#8B1E22] font-bold shadow-xs ring-1 ring-[#8B1E22]'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="block text-sm sm:text-base font-display">Sẽ tham dự</span>
                  <span className="block text-[11px] text-stone-500 font-normal mt-0.5">Chắc chắn có mặt!</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttending('no')}
                  className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                    attending === 'no'
                      ? 'border-[#8B1E22] bg-[#FAF4E6] text-[#8B1E22] font-bold shadow-xs ring-1 ring-[#8B1E22]'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="block text-sm sm:text-base font-display">Rất tiếc vắng mặt</span>
                  <span className="block text-[11px] text-stone-500 font-normal mt-0.5">Gửi lời chúc từ xa</span>
                </button>
              </div>
            </div>

            {/* Number of Guests */}
            {attending === 'yes' && (
              <div className="rounded-xl border border-[#C5A059]/40 bg-[#FFFDF9] p-3.5 space-y-2">
                <label className="block text-xs font-caps uppercase tracking-wider text-stone-700 font-bold">
                  Số lượng người tham dự (Bạn và người đi cùng) *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Users className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={guestCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setGuestCount(isNaN(val) ? 1 : Math.max(1, val));
                      }}
                      placeholder="Nhập số người..."
                      className="w-full rounded-lg border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm sm:text-base font-display font-semibold text-stone-900 focus:border-[#8B1E22] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1 border border-stone-300 rounded-lg bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="h-9 w-9 flex items-center justify-center rounded-md text-stone-600 hover:bg-[#FAF4E6] hover:text-[#8B1E22] font-bold text-lg active:scale-95 transition-all"
                      title="Giảm 1 người"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="h-9 w-9 flex items-center justify-center rounded-md text-stone-600 hover:bg-[#FAF4E6] hover:text-[#8B1E22] font-bold text-lg active:scale-95 transition-all"
                      title="Thêm 1 người"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lời chúc riêng đến cô dâu chú rể */}
            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-stone-700 mb-1.5 font-bold">
                Lời chúc riêng đến cô dâu chú rể
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <textarea
                  rows={3}
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Gửi lời chúc phúc ngọt ngào đến Ngọc Phú & Thu Thi..."
                  className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm sm:text-base font-display text-stone-900 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B1E22] py-3.5 px-4 text-xs sm:text-sm font-caps font-bold uppercase tracking-wider text-[#FAF4E6] shadow-md hover:bg-[#6E1418] active:scale-[0.99] transition-all cursor-pointer"
              >
                {attending === 'yes' ? (
                  <>
                    <Sparkles className="h-4 w-4 text-[#FFD700]" />
                    <span>Xác Nhận Tham Dự</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Xác Nhận Phản Hồi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
