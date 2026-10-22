import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Delay in ms
  duration?: number; // Duration in ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // Offset in px before reveal
  threshold?: number;
  once?: boolean;
  repeatOnScrollToTop?: boolean;
}

/**
 * Reusable scroll reveal component that adds a gentle, silky fade-and-slide
 * animation as elements scroll into the viewport.
 * When user scrolls or jumps back to the top of the page, off-screen elements reset
 * so that scrolling down again replays the smooth reveal animation.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 800,
  direction = 'up',
  distance = 28,
  threshold = 0.1,
  once = false,
  repeatOnScrollToTop = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const currentEl = elementRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once && repeatOnScrollToTop) {
          // If the element exits the viewport to the BOTTOM (user scrolled UP past it),
          // reset it so it can smoothly animate again when the user scrolls back down.
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const rect = entry.boundingClientRect;
          if (rect.top >= viewportHeight * 0.85) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(currentEl);

    // Reset handler when user returns to top of page (either via ScrollToTop button or natural scroll)
    const handleReset = () => {
      if (!elementRef.current || once || !repeatOnScrollToTop) return;
      const rect = elementRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      // If the element is below the active viewport or below the top fold, reset it
      if (rect.top >= viewportHeight * 0.5) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      if (window.scrollY <= 70) {
        handleReset();
      }
    };

    window.addEventListener('reset-scroll-reveal', handleReset);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.unobserve(currentEl);
      window.removeEventListener('reset-scroll-reveal', handleReset);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, once, repeatOnScrollToTop]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'none':
        return 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: isVisible ? `${duration}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};
