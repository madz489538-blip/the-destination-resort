import React from 'react';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { Waves, Sparkles, Coffee, Compass, Trees, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

interface AmenitiesProps {
  onNavigate: (path: string) => void;
}

export const Amenities: React.FC<AmenitiesProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Header */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Resort Facilities
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-2 mb-4">
            Wellness, Leisure & Nature
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base font-light leading-relaxed">
            Designed to soothe the mind and rejuvenate the senses. Discover peaceful corners across our lush grounds in Tezpur.
          </p>
        </div>
      </ScrollReveal>

      {/* Grid of Key Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-20">
        {/* 1. Infinity Pool */}
        <ScrollReveal variant="fade-up" delay={50} duration={650}>
          <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded overflow-hidden flex flex-col card-luxury shadow-xs h-full">
            <div className="h-72 relative img-luxury-wrapper">
              <ResortVisual type="pool" className="w-full h-full" alt="Resort Infinity Swimming Pool" />
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                  Open Daily · 06:00 – 20:00
                </span>
                <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2] mt-1 mb-3">
                  Sunset Infinity Swimming Pool
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-4">
                  Framed by tall areca palms and water features, our crystal-clear infinity pool offers shaded cabanas, plush sun loungers, and complimentary pool-side iced refreshments.
                </p>
              </div>
              <div className="text-xs text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-3">
                Towels & sun care amenities provided complimentary for resident guests.
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 2. Botanical Spa */}
        <ScrollReveal variant="fade-up" delay={150} duration={650}>
          <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded overflow-hidden flex flex-col card-luxury shadow-xs h-full">
            <div className="h-72 relative img-luxury-wrapper">
              <ResortVisual type="spa" className="w-full h-full" alt="Botanical Spa & Ayurvedic Therapy" />
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                  Holistic Wellness
                </span>
                <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2] mt-1 mb-3">
                  Botanical Spa & Ayurvedic Healing
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-4">
                  Authentic therapies rooted in Vedic wellness. Includes signature herbal body wraps, soothing hot-stone therapy, deep tissue massage, and custom facial rituals using local organic botanicals.
                </p>
              </div>
              <div className="text-xs text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-3">
                Couples treatment suite available on advance appointment.
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
        <ScrollReveal variant="fade-up" delay={80} duration={550}>
          <div className="p-6 bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded card-luxury h-full">
            <Trees className="w-7 h-7 text-[#9E7D42] dark:text-[#C5A880] mb-3" />
            <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2] mb-2">
              Tea Estate Trail Walks
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              Meander along shaded trails amidst vibrant tea flora. Guided early morning bird watching sessions are hosted on request.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={160} duration={550}>
          <div className="p-6 bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded card-luxury h-full">
            <HeartHandshake className="w-7 h-7 text-[#9E7D42] dark:text-[#C5A880] mb-3" />
            <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2] mb-2">
              Weddings & Celebrations
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              Sprawling manicured lawn and elegant banquet facilities designed for dream destination weddings and executive retreats.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={240} duration={550}>
          <div className="p-6 bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded card-luxury h-full">
            <Compass className="w-7 h-7 text-[#9E7D42] dark:text-[#C5A880] mb-3" />
            <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2] mb-2">
              Kaziranga & Nameri Expeditions
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              Seamless private day trips arranged by our concierge, complete with permits, 4x4 safari vehicles, and packed gourmet lunches.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* CTA */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center pt-8 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => onNavigate('/booking-search')}
            className="px-8 py-3.5 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury cursor-pointer"
          >
            Check Stay Dates & Experience Packages
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
};
