import React, { useState, useEffect } from 'react';

interface WelcomeIntroProps {
  onComplete: () => void;
}

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Check if reduced motion is requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Sequence stages:
    // 0ms: Deep charcoal with ambient light
    // 350ms: Wordmark fades in
    // 1000ms: Tagline reveals
    // 2100ms: Fadeout transition
    // 2600ms: Complete
    const timer1 = setTimeout(() => setStage(1), 350);
    const timer2 = setTimeout(() => setStage(2), 1000);
    const timer3 = setTimeout(() => setFadingOut(true), 2100);
    const timer4 = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      role="dialog"
      aria-label="Welcome presentation"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0C0E] text-[#FAF7F2] overflow-hidden max-w-full transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Refined Light Glow */}
      <div
        className="absolute w-[280px] sm:w-[500px] max-w-[90vw] h-[200px] sm:h-[300px] rounded-full bg-gradient-to-r from-amber-600/10 via-amber-400/15 to-transparent blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          transform: stage >= 1 ? 'scale(1.1) translateY(0)' : 'scale(0.8) translateY(20px)',
          opacity: stage >= 1 ? 0.8 : 0,
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 text-center max-w-xl w-full">
        <span
          className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C5A880] mb-3 sm:mb-4 transition-all duration-700 ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          Tezpur · Assam
        </span>

        {/* Wordmark */}
        <h1
          className={`font-serif text-2xl sm:text-4xl md:text-5xl font-normal tracking-[0.06em] sm:tracking-[0.12em] text-[#FAF7F2] transition-all duration-1000 ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          THE DESTINATION RESORT
        </h1>

        {/* Hairline Divider */}
        <div
          className={`w-16 h-[1px] bg-[#C5A880]/40 my-5 transition-all duration-700 ${
            stage >= 2 ? 'w-24 opacity-100' : 'w-0 opacity-0'
          }`}
        />

        {/* Tagline */}
        <p
          className={`text-xs sm:text-sm tracking-[0.25em] text-[#B8B2A7] uppercase font-light transition-all duration-700 ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          YOUR ESCAPE. YOUR DESTINATION.
        </p>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-8 right-8 text-xs tracking-wider uppercase text-stone-500 hover:text-[#C5A880] transition-colors py-2 px-3 border border-stone-800 rounded hover:border-[#C5A880]/30"
      >
        Skip Intro
      </button>
    </div>
  );
};
