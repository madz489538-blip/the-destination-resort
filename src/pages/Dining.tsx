import React from 'react';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { Utensils, Coffee, Wine, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface DiningProps {
  onNavigate: (path: string) => void;
}

export const Dining: React.FC<DiningProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Editorial Header */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Gastronomy & High Tea
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-2 mb-4">
            Culinary Traditions of Assam
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base font-light leading-relaxed">
            From estate-brewed single-origin orthodox teas to regional Brahmaputra river fish preparations and global classics, every dish is prepared with fresh local ingredients.
          </p>
        </div>
      </ScrollReveal>

      {/* Featured Restaurant 1: Brahmaputra Pavilion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 pb-16 border-b border-stone-200 dark:border-stone-800">
        <ScrollReveal variant="image-reveal" duration={700}>
          <div className="h-80 sm:h-96 rounded overflow-hidden img-luxury-wrapper shadow-xs">
            <ResortVisual type="dining" className="w-full h-full" alt="Brahmaputra Pavilion Dining" />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={150} duration={600}>
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                Signature Dining
              </span>
              <h2 className="font-serif text-3xl text-stone-900 dark:text-[#FAF7F2] mt-1">
                The Brahmaputra Pavilion
              </h2>
              <div className="flex items-center gap-4 text-xs text-stone-400 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Breakfast: 07:30 – 10:30 · Dinner: 19:30 – 22:30
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
              Overlooking the serene water lily ponds, The Brahmaputra Pavilion offers all-day dining featuring curated Assamese thalis, tender local duck delicacies, river trout simmered with herbs, and refined Indian and Continental favourites.
            </p>
            <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400">
              <p>• <strong>Signature Dish:</strong> Chitol Maas Tenga with fresh bamboo shoots and elephant apple</p>
              <p>• <strong>Dress Code:</strong> Smart Casual</p>
              <p>• <strong>Seating:</strong> Indoor air-conditioned salon and al fresco garden terrace</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold border border-[#9E7D42] dark:border-[#C5A880] text-[#9E7D42] dark:text-[#C5A880] hover:bg-[#9E7D42] hover:text-white dark:hover:bg-[#C5A880] dark:hover:text-stone-950 btn-luxury rounded cursor-pointer"
            >
              Reserve Table via Concierge
            </button>
          </div>
        </ScrollReveal>
      </div>

      {/* Featured Restaurant 2: Verandah Tea Lounge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 pb-16 border-b border-stone-200 dark:border-stone-800">
        <ScrollReveal variant="fade-up" duration={600} className="space-y-6 order-2 lg:order-1">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9E7D42] dark:text-[#C5A880] font-semibold">
              Artisanal Tastings
            </span>
            <h2 className="font-serif text-3xl text-stone-900 dark:text-[#FAF7F2] mt-1">
              The Verandah Tea Salon & High Tea
            </h2>
            <div className="flex items-center gap-4 text-xs text-stone-400 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Open Daily: 15:00 – 18:30
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
            Tea is the soul of Assam. Experience artisanal loose-leaf second flush Golden Tips, roasted oolongs, and soothing botanical infusions paired with freshly baked scones, pitha sweets, and finger sandwiches.
          </p>
          <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400">
            <p>• <strong>Tea Flights:</strong> Guided 4-vintage tea tasting with tea sommelier</p>
            <p>• <strong>Atmosphere:</strong> Open verandah facing manicured garden lawn</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/booking-search')}
            className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury cursor-pointer"
          >
            Add High Tea to Your Stay
          </button>
        </ScrollReveal>

        <ScrollReveal variant="image-reveal" delay={150} duration={700} className="order-1 lg:order-2">
          <div className="h-80 sm:h-96 rounded overflow-hidden img-luxury-wrapper shadow-xs">
            <ResortVisual type="tea" className="w-full h-full" alt="Verandah Tea Lounge" />
          </div>
        </ScrollReveal>
      </div>

      {/* Private Dining Experience */}
      <ScrollReveal variant="scale-in" duration={600}>
        <div className="bg-stone-900 dark:bg-[#111413] text-stone-100 p-8 sm:p-12 rounded border border-stone-800 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Intimate Celebrations
          </span>
          <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">
            Private Candlelight Gazebo Dinners
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
            Celebrate an anniversary, proposal, or family milestone in our secluded garden gazebos. Complete with personalized multi-course menus crafted by the head chef, bespoke floral decor, and dedicated butler service.
          </p>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-8 py-3 text-xs uppercase tracking-widest font-semibold bg-[#C5A880] text-stone-950 hover:bg-[#DFC8A5] btn-luxury rounded cursor-pointer"
            >
              Enquire for Private Dining
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
