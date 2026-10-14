import React, { useEffect, useRef, useState } from 'react';

// Shared IntersectionObserver pool for maximum performance
type Callback = (entry: IntersectionObserverEntry) => void;
const observerCallbacks = new Map<Element, Callback>();

let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  if (!('IntersectionObserver' in window)) return null;

  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = observerCallbacks.get(entry.target);
          if (cb) {
            cb(entry);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px', // Trigger slightly before it hits bottom of viewport
        threshold: 0.1,
      }
    );
  }
  return sharedObserver;
}

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'fade-up' | 'fade-in' | 'scale-in' | 'line-reveal' | 'image-reveal';
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span' | 'p' | 'header' | 'footer';
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  as: Component = 'div',
  style = {},
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Accessibility: Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const el = elementRef.current;
    if (!el) return;

    // 2. Safety Fallback: Never let content stay invisible if JS or observer fails
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    const observer = getSharedObserver();
    if (!observer) {
      setIsVisible(true);
      clearTimeout(safetyTimer);
      return;
    }

    const callback: Callback = (entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(el);
        observerCallbacks.delete(el);
        clearTimeout(safetyTimer);
      }
    };

    observerCallbacks.set(el, callback);
    observer.observe(el);

    return () => {
      clearTimeout(safetyTimer);
      if (el) {
        observer.unobserve(el);
        observerCallbacks.delete(el);
      }
    };
  }, []);

  // Compute CSS styles based on visibility and variant
  const getVariantStyles = (): React.CSSProperties => {
    const transitionTiming = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const transitionDuration = `${duration}ms`;
    const transitionDelay = `${delay}ms`;

    const baseTransition = {
      transitionProperty: 'opacity, transform, clip-path',
      transitionDuration,
      transitionTimingFunction: transitionTiming,
      transitionDelay,
      willChange: 'opacity, transform',
    };

    if (isVisible) {
      return {
        ...baseTransition,
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        clipPath: 'inset(0 0 0 0)',
      };
    }

    // Initial hidden state per variant
    switch (variant) {
      case 'fade-up':
        return {
          ...baseTransition,
          opacity: 0,
          transform: 'translate3d(0, 24px, 0)',
        };
      case 'fade-in':
        return {
          ...baseTransition,
          opacity: 0,
        };
      case 'scale-in':
        return {
          ...baseTransition,
          opacity: 0,
          transform: 'scale(0.96)',
        };
      case 'line-reveal':
        return {
          ...baseTransition,
          opacity: 0,
          transform: 'translate3d(0, 18px, 0)',
        };
      case 'image-reveal':
        return {
          ...baseTransition,
          opacity: 0.1,
          transform: 'scale(1.04)',
          clipPath: 'inset(0 0 12% 0)',
        };
      default:
        return {
          ...baseTransition,
          opacity: 0,
          transform: 'translate3d(0, 20px, 0)',
        };
    }
  };

  const Tag = Component as any;

  return (
    <Tag
      ref={elementRef}
      className={className}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};
