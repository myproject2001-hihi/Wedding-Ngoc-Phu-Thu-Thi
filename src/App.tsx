/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialWeddingInfo } from './data/weddingData';
import { WeddingInfo } from './types';
import { TopBar } from './components/TopBar';
import { Envelope } from './components/Envelope';
import { HeroCard } from './components/HeroCard';
import { CeremonyDetails } from './components/CeremonyDetails';
import { LoveStory } from './components/LoveStory';
import { PhotoGallery } from './components/PhotoGallery';
import { WishingWell } from './components/WishingWell';
import { RsvpModal } from './components/RsvpModal';
import { AdminGuestModal } from './components/AdminGuestModal';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { PetalsCanvas } from './components/PetalsCanvas';
import { Heart, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [weddingInfo] = useState<WeddingInfo>(initialWeddingInfo);
  const [guestName, setGuestName] = useState<string>('Quý Khách & Gia Đình');
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState<boolean>(false);
  const [isRsvpOpen, setIsRsvpOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Check URL params for guest name or admin mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('guest') || urlParams.get('to');
    if (guestParam) {
      setGuestName(guestParam);
    }
    if (urlParams.get('admin') !== null || urlParams.get('manage') !== null) {
      setIsAdminOpen(true);
    }
  }, []);

  // Format date for display: "28 Tháng 11, 2026"
  const formattedDate = new Date(weddingInfo.weddingDate).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Handle successful RSVP submission
  const handleRsvpSubmitted = (guest: {
    name: string;
    attending: 'yes' | 'no';
    guestCount: number;
  }) => {
    setToast({
      id: String(Date.now()),
      name: guest.name,
      attending: guest.attending,
      guestCount: guest.guestCount,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2D2319] selection:bg-[#8B1E22] selection:text-[#FAF6EE] relative font-display">
      {/* Toast Notification at top-right corner */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Floating ambient particles (Golden dust & rose petals) */}
      <PetalsCanvas enabled={true} />

      {/* Clean floating music player without text pill */}
      <FloatingMusicPlayer autoStarted={isEnvelopeOpen} />

      {/* Top Bar Navigation */}
      <TopBar
        groomName={weddingInfo.groomName}
        brideName={weddingInfo.brideName}
        onOpenRsvp={() => setIsRsvpOpen(true)}
      />

      <main className="relative z-10">
        {/* 1. The Interactive 3D Envelope Opening Experience */}
        <Envelope
          guestName={guestName}
          groomName={weddingInfo.groomName}
          brideName={weddingInfo.brideName}
          weddingDateFormatted={formattedDate}
          isOpen={isEnvelopeOpen}
          onOpen={() => setIsEnvelopeOpen(true)}
          onClose={() => setIsEnvelopeOpen(false)}
        />

        {/* 2. Main Invitation Content */}
        <div
          className={`transition-all duration-700 ${
            isEnvelopeOpen ? 'opacity-100 translate-y-0' : 'opacity-95'
          }`}
        >
          {/* Decorative hairline divider with floral crest */}
          <div className="flex items-center justify-center gap-4 py-8 max-w-3xl mx-auto px-4">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C5A059]/50 to-[#C5A059]" />
            <span className="text-[#8B1E22] text-sm font-serif">✦ 囍 ✦</span>
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C5A059]/50 to-[#C5A059]" />
          </div>

          {/* Hero Formal Invitation Card */}
          <HeroCard
            weddingInfo={weddingInfo}
            guestName={guestName}
            onOpenRsvp={() => setIsRsvpOpen(true)}
          />

          {/* Ceremony & Reception Schedule + Venues */}
          <CeremonyDetails weddingInfo={weddingInfo} />

          {/* Love Story Timeline */}
          <LoveStory />

          {/* Wedding Photo Gallery */}
          <PhotoGallery weddingInfo={weddingInfo} />

          {/* Guestbook & Wishing Well */}
          <WishingWell onOpenRsvp={() => setIsRsvpOpen(true)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#C5A059]/30 bg-[#FAF5E8] py-12 text-center text-stone-600">
        <div className="max-w-2xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.2em] uppercase text-[#8B1E22] font-semibold">
            <span>{weddingInfo.groomName}</span>
            <Heart className="h-3.5 w-3.5 fill-[#8B1E22] text-[#8B1E22]" />
            <span>{weddingInfo.brideName}</span>
          </div>

          <p className="font-display text-sm italic text-stone-700">
            "Sự hiện diện của bạn là niềm hạnh phúc lớn nhất của chúng tôi"
          </p>

          <p className="text-xs font-display text-stone-500">
            Trân trọng cảm ơn quý quan khách đã cùng chia vui trong ngày trọng đại
          </p>

          {/* Discreet Admin Management Link for Bride & Groom */}
          <div className="pt-4 border-t border-[#C5A059]/25 flex items-center justify-center">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-caps tracking-wider text-stone-500 hover:text-[#8B1E22] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#FAF0DC]/60 border border-transparent hover:border-[#C5A059]/30"
              title="Xem danh sách khách đã xác nhận tham dự và tải file Excel (.csv)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Dành Cho Cô Dâu & Chú Rể: Sổ Khách Mời & Xuất File Excel</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        defaultGuestName={guestName}
        weddingDateFormatted={formattedDate}
        onSubmitted={handleRsvpSubmitted}
      />

      {/* Admin / Organizer Management Modal */}
      <AdminGuestModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
