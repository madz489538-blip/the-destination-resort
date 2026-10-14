import React, { useState, useEffect } from 'react';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { Maximize2, X } from 'lucide-react';

interface GalleryProps {
  onNavigate: (path: string) => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: 'architecture' | 'suites' | 'dining' | 'nature';
  visualType: 'exterior' | 'cottage' | 'suite' | 'villa' | 'serene' | 'dining' | 'pool' | 'tea' | 'spa';
  subtitle: string;
}

const CATEGORY_TABS = [
  { key: 'all', label: 'All Collections' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'suites', label: 'Suites & Villas' },
  { key: 'dining', label: 'Gastronomy' },
  { key: 'nature', label: 'Pool & Leisure' },
];

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  architecture: 'Architecture',
  suites: 'Suites & Villas',
  dining: 'Gastronomy',
  nature: 'Pool & Leisure',
};

export const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!activeItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem]);

  const galleryItems: GalleryItem[] = [
    {
      id: 'ext_twilight',
      title: 'Pavilion Reflection at Twilight',
      category: 'architecture',
      visualType: 'exterior',
      subtitle: 'Main central resort pavilion over calm water mirrors',
    },
    {
      id: 'cottage_veranda',
      title: 'Deluxe Heritage Veranda',
      category: 'suites',
      visualType: 'cottage',
      subtitle: 'Handcrafted teak wood and open sky verandah',
    },
    {
      id: 'plantation_suite',
      title: 'Luxury Plantation Suite Salon',
      category: 'suites',
      visualType: 'suite',
      subtitle: 'King canopy bed with expansive tea estate vistas',
    },
    {
      id: 'villa_courtyard',
      title: 'Presidential Brahmaputra Villa',
      category: 'architecture',
      visualType: 'villa',
      subtitle: 'Private sundeck and heated plunge pool',
    },
    {
      id: 'candlelight_dining',
      title: 'Al Fresco Candlelight Service',
      category: 'dining',
      visualType: 'dining',
      subtitle: 'Evening tables set with fine bone china and candlelight',
    },
    {
      id: 'infinity_sunset',
      title: 'Palm-Fringed Infinity Pool',
      category: 'nature',
      visualType: 'pool',
      subtitle: 'Sunset golden hour reflections and private cabanas',
    },
    {
      id: 'morning_tea_trails',
      title: 'Tea Garden Morning Canopy',
      category: 'nature',
      visualType: 'tea',
      subtitle: 'Rolling tea estate hills in morning mist',
    },
    {
      id: 'ayurvedic_spa',
      title: 'Botanical Sanctuary & Ritual Suite',
      category: 'suites',
      visualType: 'spa',
      subtitle: 'Ayurvedic stone basins, therapeutic oils and orchids',
    },
    {
      id: 'serene_suite',
      title: 'Boutique Water Courtyard Suite',
      category: 'suites',
      visualType: 'serene',
      subtitle: 'Intimate reading alcove and tranquil courtyard views',
    },
  ];

  const filtered = galleryItems.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Header */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Visual Anthology
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-2 mb-4">
            Moments of Stillness
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base font-light leading-relaxed">
            Glimpses into our residences, dining verandas, and serene grounds in Tezpur, Assam.
          </p>
        </div>
      </ScrollReveal>

      {/* Category Filter Tabs - Horizontally scrollable on mobile without overlap or clipping */}
      <ScrollReveal variant="fade-up" duration={450} delay={100}>
        <div className="w-full max-w-full overflow-hidden mb-10 sm:mb-12">
          <div
            role="tablist"
            aria-label="Gallery category filters"
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1 sm:px-0 sm:justify-center no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(tab.key)}
                  className={`shrink-0 whitespace-nowrap px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-stone-900 text-[#FAF7F2] border-stone-900 dark:bg-[#C5A880] dark:text-stone-950 dark:border-[#C5A880] shadow-sm'
                      : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-100 border-stone-300/80 dark:bg-[#151918] dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 dark:border-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Gallery Grid with Staggered Entrances and Permanent Readable Card Text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <ScrollReveal key={item.id} variant="fade-up" delay={idx * 70} duration={500}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveItem(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveItem(item);
                }
              }}
              className="group relative h-84 sm:h-92 rounded-md overflow-hidden cursor-pointer bg-stone-900 border border-stone-200 dark:border-stone-800 card-luxury img-luxury-wrapper shadow-xs focus:outline-none focus:ring-2 focus:ring-[#9E7D42] dark:focus:ring-[#C5A880]"
              aria-label={`View ${item.title} photography and details`}
            >
              <ResortVisual
                type={item.visualType}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                alt={item.title}
              />

              {/* Subtle dark gradient overlay at bottom for optimal text contrast while keeping photographs radiant */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 via-35% to-transparent pointer-events-none transition-colors duration-300" />

              {/* Image Text Details - Permanently visible on mobile, tablet and desktop without requiring click or hover */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col justify-end text-left pointer-events-none">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#E5D0AC] dark:text-[#C5A880] font-semibold drop-shadow-xs">
                    {CATEGORY_DISPLAY_NAMES[item.category] || item.category}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs text-white/90 flex items-center justify-center shrink-0 border border-white/15 group-hover:border-white/40 transition-colors"
                    title="Click to enlarge"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-stone-200" />
                  </div>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-white leading-snug drop-shadow-sm line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-200/90 font-light mt-1 leading-relaxed drop-shadow-xs line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal with Smooth Scale & Blur Animation */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#111113] border border-stone-800 rounded-md overflow-hidden shadow-2xl transform transition-transform duration-300 scale-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              aria-label="Close image lightbox"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-900/80 text-white flex items-center justify-center hover:bg-stone-800 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-80 sm:h-[460px] w-full relative">
              <ResortVisual type={activeItem.visualType} className="w-full h-full object-cover" alt={activeItem.title} />
            </div>

            <div className="p-6 bg-[#161619] border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
                  {CATEGORY_DISPLAY_NAMES[activeItem.category] || activeItem.category}
                </span>
                <h3 className="font-serif text-2xl text-[#FAF7F2] mt-0.5">{activeItem.title}</h3>
                <p className="text-xs text-stone-400 mt-1">{activeItem.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveItem(null);
                  onNavigate('/booking-search');
                }}
                className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#C5A880] text-stone-950 hover:bg-[#DFC8A5] btn-luxury rounded cursor-pointer shrink-0"
              >
                Book This Experience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
