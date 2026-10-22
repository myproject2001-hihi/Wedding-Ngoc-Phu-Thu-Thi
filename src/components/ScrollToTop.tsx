import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import AOS from 'aos';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    // Immediately and progressively signal scroll-reveal elements and AOS to reset
    window.dispatchEvent(new CustomEvent('reset-scroll-reveal'));
    AOS.refresh();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('reset-scroll-reveal'));
      AOS.refresh();
    }, 400);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('reset-scroll-reveal'));
      AOS.refresh();
    }, 800);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059]/60 bg-[#FAF6EE] text-[#8B1E22] shadow-lg transition-transform duration-300 hover:scale-105 hover:border-[#8B1E22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E22]"
        title="Lên đầu trang"
      >
        <ArrowUp className="h-6 w-6 text-[#8B1E22] group-hover:text-[#6E1418]" />
      </button>
    </div>
  );
};
