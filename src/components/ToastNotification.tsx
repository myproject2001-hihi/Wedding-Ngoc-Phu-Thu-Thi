import React, { useEffect, useState } from 'react';
import { CheckCircle2, Heart, X, Users, Sparkles } from 'lucide-react';

export interface ToastData {
  id: string;
  name: string;
  attending: 'yes' | 'no';
  guestCount: number;
  time?: string;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  duration = 6000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-96 max-w-md animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#C5A059] bg-[#FFFDF9] p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-6 -bottom-6 text-[#C5A059]/10 pointer-events-none select-none">
          <Heart className="h-28 w-28 fill-current" />
        </div>

        {/* Content row */}
        <div className="flex items-start gap-3.5 relative z-10">
          {/* Status Badge Icon */}
          <div className="relative shrink-0 mt-0.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF0DC] border border-[#C5A059]/50 text-[#8B1E22] shadow-xs">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B1E22] text-[#FAF4E6]">
              <Heart className="h-3 w-3 fill-current" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 pr-4 min-w-0">
            <div className="flex items-center gap-1.5 text-[#8B1E22]">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              <h4 className="font-caps text-xs sm:text-sm font-bold uppercase tracking-wider">
                Xác Nhận Thành Công!
              </h4>
            </div>

            <p className="mt-1 text-xs sm:text-sm font-display text-stone-800 leading-snug">
              Thông tin của bạn đã được gửi thành công đến cô dâu & chú rể.
            </p>

            {/* Guest Summary Card inside Toast */}
            <div className="mt-2.5 rounded-lg bg-[#FAF5E8] border border-[#C5A059]/30 px-3 py-1.5 flex items-center justify-between text-xs font-display text-stone-700">
              <span className="truncate font-semibold text-stone-900">
                {toast.name}
              </span>
              <span className="shrink-0 flex items-center gap-1 text-[#8B1E22] font-semibold text-[11px]">
                {toast.attending === 'yes' ? (
                  <>
                    <Users className="h-3 w-3" />
                    <span>{toast.guestCount} người tham dự</span>
                  </>
                ) : (
                  <span>Gửi lời chúc từ xa</span>
                )}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 text-stone-400 hover:bg-[#FAF0DC] hover:text-[#8B1E22] transition-colors"
            title="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Golden Progress Bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FAF0DC]">
          <div
            className="h-full bg-gradient-to-r from-[#C5A059] to-[#8B1E22] transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
