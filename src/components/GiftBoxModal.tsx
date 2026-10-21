import React, { useState } from 'react';
import { X, Copy, Check, Gift } from 'lucide-react';
import { WeddingInfo } from '../types';

interface GiftBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingInfo: WeddingInfo;
}

export const GiftBoxModal: React.FC<GiftBoxModalProps> = ({
  isOpen,
  onClose,
  weddingInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'groom' | 'bride'>('groom');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBank =
    activeTab === 'groom' ? weddingInfo.groomBank : weddingInfo.brideBank;
  const currentPerson =
    activeTab === 'groom' ? weddingInfo.groomName : weddingInfo.brideName;
  const currentRole = activeTab === 'groom' ? 'Chú Rể' : 'Cô Dâu';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const vietQrUrl = `https://img.vietqr.io/image/${currentBank.bankName.toLowerCase()}-${currentBank.accountNumber}-compact.png?amount=0&addInfo=${encodeURIComponent(`Mung cuoi ${currentPerson}`)}&accountName=${encodeURIComponent(currentBank.accountHolder)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#C5A059]/50 bg-[#FFFDF9] p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF4E6] border border-[#C5A059]/40 text-[#8B1E22] mb-2">
            <Gift className="h-6 w-6" />
          </div>
          <span className="text-[11px] font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold">
            HỘP MỪNG CƯỚI ONLINE
          </span>
          <h3 className="mt-1 text-2xl font-display font-bold text-[#8B1E22]">
            Gửi Món Quà Chúc Phúc
          </h3>
          <p className="mt-1 text-xs font-display text-stone-600">
            Dành cho quý khách ở xa muốn gửi lời chúc và món quà đến tân lang tân nương.
          </p>
        </div>

        {/* Tab switch for Groom / Bride */}
        <div className="flex rounded-xl bg-[#FAF5E8] p-1 border border-[#C5A059]/30 mb-6">
          <button
            onClick={() => setActiveTab('groom')}
            className={`flex-1 py-2 text-xs font-caps font-semibold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'groom'
                ? 'bg-[#8B1E22] text-[#FAF4E6] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mừng Chú Rể
          </button>
          <button
            onClick={() => setActiveTab('bride')}
            className={`flex-1 py-2 text-xs font-caps font-semibold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'bride'
                ? 'bg-[#8B1E22] text-[#FAF4E6] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mừng Cô Dâu
          </button>
        </div>

        {/* Bank & QR Details */}
        <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF6EE] p-5 text-center">
          {/* QR Code */}
          <div className="mx-auto mb-4 w-44 h-44 rounded-lg bg-white p-2 border border-stone-200 shadow-xs flex items-center justify-center overflow-hidden">
            <img
              src={vietQrUrl}
              alt={`Mã QR mừng cưới ${currentRole}`}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-2 text-left bg-white/70 p-3.5 rounded-lg border border-[#C5A059]/20">
            <div className="flex items-center justify-between text-xs font-caps">
              <span className="text-stone-500 uppercase tracking-wider font-medium">Ngân hàng</span>
              <span className="font-bold text-stone-800">{currentBank.bankName}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-caps">
              <span className="text-stone-500 uppercase tracking-wider font-medium">Chủ tài khoản</span>
              <span className="font-bold text-[#8B1E22]">{currentBank.accountHolder}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-caps pt-1 border-t border-stone-200">
              <span className="text-stone-500 uppercase tracking-wider font-medium">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-stone-900 text-sm tracking-wide">
                  {currentBank.accountNumber}
                </span>
                <button
                  onClick={() => handleCopy(currentBank.accountNumber)}
                  className="rounded p-1 text-stone-500 hover:text-[#8B1E22] hover:bg-stone-100 transition-colors"
                  title="Sao chép số tài khoản"
                >
                  {copiedAccount === currentBank.accountNumber ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopy(currentBank.accountNumber)}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#FAF5E8] border border-[#8B1E22]/40 py-2.5 px-4 text-xs font-caps font-semibold uppercase tracking-wider text-[#8B1E22] hover:bg-[#8B1E22] hover:text-[#FAF4E6] transition-colors"
          >
            {copiedAccount === currentBank.accountNumber ? (
              <>
                <Check className="h-4 w-4" />
                <span>Đã Sao Chép Số Tài Khoản!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Sao Chép Số Tài Khoản</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
