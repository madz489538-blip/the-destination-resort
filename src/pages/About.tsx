import React from 'react';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { ShieldCheck, Heart, Leaf, MapPin, ArrowRight } from 'lucide-react';

interface AboutProps {
  onNavigate: (path: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Editorial Header */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Heritage & Vision
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-2 mb-4">
            A Haven of Peace in Tezpur
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base font-light leading-relaxed">
            Rooted in the timeless romance and lush natural bounty of Assam, The Destination Resort was envisioned as an intimate sanctuary where hospitality is personal and unhurried.
          </p>
        </div>
      </ScrollReveal>

      {/* Story & Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 pb-16 border-b border-stone-200 dark:border-stone-800">
        <ScrollReveal variant="image-reveal" duration={700}>
          <div className="h-80 sm:h-96 rounded overflow-hidden img-luxury-wrapper shadow-xs">
            <ResortVisual type="exterior" className="w-full h-full" alt="The Destination Resort Architecture" />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={150} duration={600}>
          <div className="space-y-6">
            <h2 className="font-serif text-3xl text-stone-900 dark:text-[#FAF7F2]">
              Inspired by Assam's Tea Estates
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
              Tezpur has long captivated poets and travelers with its historic temples, tranquil river ghats, and expansive tea gardens. Located on NH715 in Bhojkhowa, Kachari Pam, our resort takes inspiration from traditional plantation bungalows.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
              Our architecture features sloped teak roofs that withstand Assam’s monsoon showers, wide breezy verandas where mornings begin with aromatic loose-leaf tea, and courtyards filled with indigenous bamboo and flowering shrubs.
            </p>
            <div className="pt-2">
              <span className="inline-block text-xs uppercase tracking-widest text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                Tezpur, Sonitpur District · Assam
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Core Values */}
      <div className="mb-20">
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
              Our Commitments
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-[#FAF7F2] mt-1">
              Mindful Hospitality
            </h3>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <ScrollReveal variant="fade-up" delay={80} duration={550}>
            <div className="p-8 bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded space-y-3 card-luxury h-full shadow-xs">
              <Heart className="w-6 h-6 text-[#9E7D42] dark:text-[#C5A880]" />
              <h4 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2]">
                Warmth of 'Atithi Devo Bhava'
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                In Assamese culture, a guest brings blessings to the home. Our team provides attentive, dignified service where your privacy and peace are foremost.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={160} duration={550}>
            <div className="p-8 bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded space-y-3 card-luxury h-full shadow-xs">
              <Leaf className="w-6 h-6 text-[#9E7D42] dark:text-[#C5A880]" />
              <h4 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2]">
                Eco-Conscious Grounds
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                We practice rainwater harvesting, eliminate single-use plastics from suites, source organic produce from local Tezpur farmers, and preserve native bird habitats.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={240} duration={550}>
            <div className="p-8 bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded space-y-3 card-luxury h-full shadow-xs">
              <ShieldCheck className="w-6 h-6 text-[#9E7D42] dark:text-[#C5A880]" />
              <h4 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2]">
                Community Empowerment
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                Over 80% of our staff and artisan partners hail from surrounding villages in Sonitpur, ensuring the economic benefit of hospitality stays in the region.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* CTA */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('/accommodation')}
            className="px-8 py-3.5 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Explore Suites & Cottages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
};
