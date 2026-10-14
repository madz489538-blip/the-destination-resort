import React, { useState } from 'react';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { Calendar, Users, ArrowRight, ShieldCheck, MapPin, Coffee, Utensils, Waves, Check, Star, Quote } from 'lucide-react';

interface HomeProps {
  onNavigate: (path: string, state?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Quick booking state
  const today = new Date();
  const defaultCheckIn = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
  const defaultCheckOut = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('/booking-search', {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      children,
      roomsCount: rooms,
    });
  };

  const guestReviews = [
    {
      name: 'Dr. Arindam & Manashi Hazarika',
      origin: 'Guwahati, Assam',
      rating: 5,
      stay: 'Deluxe Heritage Cottage',
      quote: 'An oasis of peace right off NH715. The morning verandah tea overlooking the green grounds and the authentic Assamese dinner at the Brahmaputra Pavilion made our anniversary unforgettable.',
    },
    {
      name: 'Rohan & Srishti Singhania',
      origin: 'Kolkata, West Bengal',
      rating: 5,
      stay: 'Luxury Plantation Suite',
      quote: 'The level of craftsmanship and understated luxury took our breath away. The quietness, the infinity pool at sunset, and the attentive concierge made this our favorite retreat in Northeast India.',
    },
    {
      name: 'Vikramaditya Roy',
      origin: 'New Delhi',
      rating: 5,
      stay: 'Executive Brahmaputra Villa',
      quote: 'Exceptional private villa with plunge pool. Ideal stopover during our Kaziranga and Nameri wildlife trip. Transparent booking, warm staff, and serene tea atmosphere.',
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[84vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Real Luxury Hospitality Photography Background with subtle entrance scale */}
        <div className="absolute inset-0 z-0">
          <ResortVisual
            type="hero"
            priority={true}
            className="w-full h-full transform transition-transform duration-1000 ease-out"
            alt="The Destination Resort Pavilion at Dusk in Tezpur Assam"
          />
        </div>

        {/* Hero Content Overlay with Layered Staggered Text Animations */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center text-white min-w-0">
          <ScrollReveal variant="fade-up" duration={450} delay={100}>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#DFC8A5] font-semibold mb-3 sm:mb-4">
              WELCOME TO THE DESTINATION RESORT
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" duration={750} delay={200}>
            <h1 className="clamp-hero-title font-serif font-normal tracking-tight mb-4 sm:mb-6 text-[#FAF7F2] text-balance drop-shadow-sm">
              Your Escape. Your Destination.
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" duration={550} delay={350}>
            <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-stone-200 font-light leading-relaxed mb-8 sm:mb-10 text-balance px-2">
              Discover comfort, warm hospitality and a relaxing stay in Tezpur, Assam. Unwind amidst tranquil greenery, serene water bodies, and authentic Assamese warmth.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" duration={500} delay={450}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <button
                type="button"
                onClick={() => onNavigate('/accommodation')}
                className="w-full sm:w-auto px-7 py-3.5 text-xs tracking-widest uppercase font-semibold text-stone-950 bg-[#FAF7F2] hover:bg-[#DFC8A5] btn-luxury rounded shadow-md cursor-pointer"
              >
                EXPLORE THE RESORT
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/booking-search')}
                className="w-full sm:w-auto px-7 py-3.5 text-xs tracking-widest uppercase font-semibold text-[#FAF7F2] border border-[#FAF7F2]/60 hover:border-[#DFC8A5] hover:text-[#DFC8A5] btn-luxury rounded backdrop-blur-sm cursor-pointer"
              >
                BOOK YOUR STAY
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Subtle scroll cue */}
        <div className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1.5 opacity-60">
          <span className="text-[9px] tracking-widest uppercase text-stone-200">Scroll</span>
          <div className="w-[1px] h-5 bg-gradient-to-b from-stone-200 to-transparent" />
        </div>
      </section>

      {/* 2. Professional Booking Search Widget */}
      <section className="relative z-20 -mt-8 sm:-mt-12 max-w-5xl mx-auto px-3 sm:px-6">
        <ScrollReveal variant="scale-in" duration={600} delay={100}>
          <div className="bg-white dark:bg-[#151918] rounded-md shadow-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 md:p-8 card-luxury">
            <div className="mb-4 hidden sm:flex items-center justify-between text-xs pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-serif text-sm text-stone-900 dark:text-[#FAF7F2]">
                Check Availability & Rates
              </span>
              <span className="text-[11px] text-[#9E7D42] dark:text-[#C5A880] font-medium">
                Direct Booking · Best Rate Guarantee
              </span>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
              <div>
                <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Guests
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    aria-label="Number of adults"
                    className="w-full px-2 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Ad
                      </option>
                    ))}
                  </select>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    aria-label="Number of children"
                    className="w-full px-2 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} Ch
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Rooms
                </label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  aria-label="Number of rooms"
                  className="w-full px-3 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} Room{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs uppercase tracking-widest font-semibold text-white bg-[#9E7D42] hover:bg-[#866730] dark:bg-[#C5A880] dark:hover:bg-[#DFC8A5] dark:text-stone-950 rounded btn-luxury shadow-sm cursor-pointer"
                >
                  Search Dates
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. Narrative Story & Tezpur Context */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal variant="fade-up" duration={450}>
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            An Authentic Sanctuary
          </span>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" duration={700} delay={100}>
          <h2 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-2 mb-5">
            Where Tea Estate Heritage Meets Quiet Luxury
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" duration={550} delay={200}>
          <div className="w-12 h-[1px] bg-[#9E7D42] dark:bg-[#C5A880] mx-auto mb-6" />
          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-light max-w-2xl mx-auto mb-10">
            Located along the NH715 highway in Bhojkhowa, Kachari Pam, The Destination Resort provides travelers and families an idyllic gateway to Tezpur and Upper Assam. Surrounded by gentle breezes from the Brahmaputra valley and emerald tea plantations, our retreat offers refined private cottages, serene dining, and heartfelt hospitality.
          </p>
        </ScrollReveal>

        {/* 4-Item Trust Strip (Staggered Scroll Entrance) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-stone-200 dark:border-stone-800 text-left">
          {[
            { label: 'Location', primary: 'Tezpur, Assam', secondary: 'NH715 Bhojkhowa' },
            { label: 'Atmosphere', primary: 'Quiet Garden Retreat', secondary: 'Private verandas & lawns' },
            { label: 'Dining', primary: 'Assamese & Global', secondary: 'Estate tea lounge' },
            { label: 'Concierge Desk', primary: '+91 86384 73551', secondary: 'Direct reservations' },
          ].map((item, index) => (
            <ScrollReveal key={item.label} variant="fade-up" delay={index * 90} duration={500}>
              <div className="p-3.5 rounded bg-stone-100/60 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 card-luxury">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">{item.label}</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100 text-xs sm:text-sm mt-0.5">{item.primary}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{item.secondary}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4. Curated Accommodation Showcase with Real Photography */}
      <section className="py-16 sm:py-20 bg-stone-100/70 dark:bg-[#111413] border-y border-stone-200 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <ScrollReveal variant="fade-up">
              <div>
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                  Private Residences
                </span>
                <h2 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1">
                  Suites, Cottages & Villas
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={150}>
              <button
                type="button"
                onClick={() => onNavigate('/accommodation')}
                className="text-xs uppercase tracking-widest font-semibold text-[#9E7D42] dark:text-[#C5A880] hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>View All 4 Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. Deluxe Heritage Cottage */}
            <ScrollReveal variant="fade-up" delay={50} duration={600}>
              <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded overflow-hidden flex flex-col group card-luxury shadow-xs">
                <div className="h-60 sm:h-64 img-luxury-wrapper">
                  <ResortVisual
                    type="cottage"
                    className="w-full h-full"
                    alt="Deluxe Heritage Cottage"
                  />
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">
                      <span>450 sq.ft</span>
                      <span aria-hidden="true">·</span>
                      <span>1 King Bed</span>
                      <span aria-hidden="true">·</span>
                      <span>Max 3 Guests</span>
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2] mb-2">
                      Deluxe Heritage Cottage
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-4">
                      Artisanal wooden cottage set amidst tea canopy with private garden sit-out and rainforest shower.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block">From (Demo Rate)</span>
                      <span className="font-serif text-lg text-stone-900 dark:text-stone-100 font-semibold tabular-nums">
                        ₹6,500
                      </span>
                      <span className="text-[11px] text-stone-400"> / night</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('/booking-search', { preselectedRoom: 'deluxe-heritage-cottage' })}
                      className="px-4 py-2 text-xs tracking-wider uppercase font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury cursor-pointer"
                    >
                      Select Room
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 2. Luxury Plantation Suite */}
            <ScrollReveal variant="fade-up" delay={150} duration={600}>
              <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded overflow-hidden flex flex-col group card-luxury shadow-xs">
                <div className="h-60 sm:h-64 img-luxury-wrapper">
                  <ResortVisual
                    type="suite"
                    className="w-full h-full"
                    alt="Luxury Plantation Suite"
                  />
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">
                      <span>680 sq.ft</span>
                      <span aria-hidden="true">·</span>
                      <span>Super King + Salon</span>
                      <span aria-hidden="true">·</span>
                      <span>Max 4 Guests</span>
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2] mb-2">
                      Luxury Plantation Suite
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-4">
                      Expansive private suite with panoramic views of organic tea plantations, soaking tub, and lounge.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block">From (Demo Rate)</span>
                      <span className="font-serif text-lg text-stone-900 dark:text-stone-100 font-semibold tabular-nums">
                        ₹9,800
                      </span>
                      <span className="text-[11px] text-stone-400"> / night</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('/booking-search', { preselectedRoom: 'luxury-plantation-suite' })}
                      className="px-4 py-2 text-xs tracking-wider uppercase font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury cursor-pointer"
                    >
                      Select Room
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 3. Executive Brahmaputra Villa */}
            <ScrollReveal variant="fade-up" delay={250} duration={600} className="md:col-span-2 lg:col-span-1">
              <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded overflow-hidden flex flex-col group card-luxury shadow-xs">
                <div className="h-60 sm:h-64 img-luxury-wrapper">
                  <ResortVisual
                    type="villa"
                    className="w-full h-full"
                    alt="Executive Brahmaputra Villa"
                  />
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">
                      <span>950 sq.ft</span>
                      <span aria-hidden="true">·</span>
                      <span>2 Master Bedrooms</span>
                      <span aria-hidden="true">·</span>
                      <span>Max 6 Guests</span>
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2] mb-2">
                      Executive Brahmaputra Villa
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-4">
                      Exclusive presidential residence with temperature-regulated private plunge pool and dedicated attendant.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block">From (Demo Rate)</span>
                      <span className="font-serif text-lg text-stone-900 dark:text-stone-100 font-semibold tabular-nums">
                        ₹14,500
                      </span>
                      <span className="text-[11px] text-stone-400"> / night</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('/booking-search', { preselectedRoom: 'executive-brahmaputra-villa' })}
                      className="px-4 py-2 text-xs tracking-wider uppercase font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury cursor-pointer"
                    >
                      Select Room
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. Distinctive Experiences & Amenities */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
              Bespoke Experiences
            </span>
            <h2 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1 mb-3">
              Curated For Serenity & Discovery
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light">
              Every moment at The Destination Resort is shaped by nature, mindful relaxation, and Upper Assam culture.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <ScrollReveal variant="fade-up" delay={80} duration={600}>
            <div className="border border-stone-200 dark:border-stone-800 p-6 sm:p-8 rounded bg-white dark:bg-[#151918] card-luxury">
              <Utensils className="w-7 h-7 text-[#9E7D42] dark:text-[#C5A880] mb-3" />
              <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2] mb-2">Brahmaputra Pavilion</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light mb-4">
                Celebrates local indigenous Assamese flavours, river delicacies, and pan-Indian culinary classics prepared with organic estate herbs.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/dining')}
                className="text-xs uppercase tracking-wider font-semibold text-[#9E7D42] dark:text-[#C5A880] hover:underline cursor-pointer"
              >
                Explore Dining →
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={160} duration={600}>
            <div className="border border-stone-200 dark:border-stone-800 p-6 sm:p-8 rounded bg-white dark:bg-[#151918] card-luxury">
              <Waves className="w-7 h-7 text-[#9E7D42] dark:text-[#C5A880] mb-3" />
              <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2] mb-2">Sunset Infinity Pool</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light mb-4">
                Rest on cushioned sun loungers while watching the evening skies turn gold over the tranquil water surface and palm canopy.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/amenities')}
                className="text-xs uppercase tracking-wider font-semibold text-[#9E7D42] dark:text-[#C5A880] hover:underline cursor-pointer"
              >
                View Amenities →
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={240} duration={600}>
            <div className="border border-stone-200 dark:border-stone-800 p-6 sm:p-8 rounded bg-white dark:bg-[#151918] card-luxury">
              <Coffee className="w-7 h-7 text-[#9E7D42] dark:text-[#C5A880] mb-3" />
              <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2] mb-2">Tea Garden Walking Trails</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light mb-4">
                Stroll through lush tea bushes at dawn, learn the craft of orthodox leaf picking, and taste artisanal brews with our resident connoisseur.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/gallery')}
                className="text-xs uppercase tracking-wider font-semibold text-[#9E7D42] dark:text-[#C5A880] hover:underline cursor-pointer"
              >
                View Gallery →
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. Guest Reviews & Testimonials Section */}
      <section className="py-16 sm:py-20 bg-stone-100/60 dark:bg-[#111413] border-t border-stone-200 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" duration={500}>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                Guest Reflections
              </span>
              <h2 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1 mb-3">
                Memories from Tezpur
              </h2>
              <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light">
                Discover what travelers and families say about their tranquil stays with us.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {guestReviews.map((rev, idx) => (
              <ScrollReveal key={rev.name} variant="fade-up" delay={idx * 110} duration={600}>
                <div className="bg-white dark:bg-[#151918] p-6 sm:p-7 rounded border border-stone-200 dark:border-stone-800 card-luxury flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 dark:text-[#C5A880] mb-4">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light italic leading-relaxed mb-6">
                      "{rev.quote}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80">
                    <p className="font-serif font-medium text-stone-900 dark:text-[#FAF7F2] text-sm">
                      {rev.name}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {rev.origin} · <span className="text-[#9E7D42] dark:text-[#C5A880]">{rev.stay}</span>
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Reservation Callout Strip */}
      <section className="bg-stone-900 dark:bg-[#0B0D0C] text-stone-100 py-14 sm:py-16 px-4 border-t border-stone-800">
        <ScrollReveal variant="fade-up" duration={600}>
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
              RESERVATIONS & GUEST CONCIERGE
            </p>
            <h2 className="clamp-section-title font-serif text-[#FAF7F2]">
              Begin Your Journey to Tezpur
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-lg mx-auto">
              Book online with real-time room availability, instant temporary inventory holds, and server-verified rate calculations.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/booking-search')}
                className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-widest font-semibold bg-[#C5A880] text-stone-950 hover:bg-[#DFC8A5] btn-luxury rounded shadow-lg cursor-pointer"
              >
                Search Dates & Availability
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
