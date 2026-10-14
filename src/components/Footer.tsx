import React from 'react';
import { ScrollReveal } from './ScrollReveal.js';
import { MapPin, Phone, Mail, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full max-w-full overflow-hidden bg-[#F4EFEA] dark:bg-[#0D100F] text-stone-700 dark:text-stone-300 border-t border-stone-200 dark:border-stone-800/80 transition-colors pt-12 sm:pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up" duration={600}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            {/* Brand & Concept */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg sm:text-xl tracking-wider text-stone-900 dark:text-[#FAF7F2]">
                THE DESTINATION RESORT
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                Your Escape. Your Destination. An intimate luxury haven inspired by the verdant tea garden heritage and tranquil Brahmaputra landscape of Tezpur, Assam.
              </p>
              <div className="pt-1">
                <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-widest text-[#9E7D42] dark:text-[#C5A880] border-b border-[#9E7D42]/30 dark:border-[#C5A880]/30 pb-0.5">
                  Tezpur · Assam · India
                </span>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-[11px] sm:text-xs uppercase tracking-widest text-stone-900 dark:text-stone-300 font-semibold">
                The Resort
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/accommodation')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Suites & Private Cottages
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/dining')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Brahmaputra Pavilion Dining
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/amenities')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Infinity Pool & Botanical Spa
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/gallery')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Visual Collection & Grounds
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/about')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Our Heritage & Philosophy
                  </button>
                </li>
              </ul>
            </div>

            {/* Guest Services & Lookup */}
            <div className="space-y-3">
              <h4 className="text-[11px] sm:text-xs uppercase tracking-widest text-stone-900 dark:text-stone-300 font-semibold">
                Guest Services
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/booking-search')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors inline-flex items-center gap-1 text-left font-medium cursor-pointer"
                  >
                    <span>Reserve a Stay</span>
                    <ArrowUpRight className="w-3 h-3 text-[#9E7D42] dark:text-[#C5A880]" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/booking-lookup')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    View / Manage Reservation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/contact')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Guest Concierge Enquiry
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/policies')}
                    className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors text-left cursor-pointer"
                  >
                    Booking Terms & Policies
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/admin')}
                    className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors text-left cursor-pointer"
                  >
                    Staff Management Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Location & Verified Coordinates */}
            <div className="space-y-3">
              <h4 className="text-[11px] sm:text-xs uppercase tracking-widest text-stone-900 dark:text-stone-300 font-semibold">
                Location & Contact
              </h4>
              <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#9E7D42] dark:text-[#C5A880] shrink-0 mt-0.5" />
                  <address className="not-italic leading-relaxed">
                    NH715, Bhojkhowa, Kachari Pam,<br />
                    Tezpur, Assam 784027, India
                  </address>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#9E7D42] dark:text-[#C5A880] shrink-0" />
                  <a href="tel:+918638473551" className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors">
                    +91 86384 73551
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#9E7D42] dark:text-[#C5A880] shrink-0" />
                  <a href="mailto:reservations@destinationresort.in" className="hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors truncate">
                    reservations@destinationresort.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Concept Demonstration Disclaimer Block */}
        <ScrollReveal variant="fade-in" duration={500} delay={100}>
          <div className="p-4 rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151918] mb-8 text-xs text-stone-600 dark:text-stone-400 card-luxury">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-stone-900 dark:text-stone-200 text-xs">
                  Notice of Unofficial Concept Demonstration
                </p>
                <p className="leading-relaxed text-[11px] text-stone-500 dark:text-stone-400">
                  This digital platform is an independent concept demonstration engineered for The Destination Resort management presentation. It is not owned, authorized, approved, or operated by the resort. Room categories, inventory counts, nightly tariffs, taxes, and policies displayed are illustrative demonstration data and must be verified by resort ownership before accepting live bookings.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-500">
          <p className="text-center sm:text-left text-[11px]">
            © 2026 The Destination Resort Concept. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px]">
            <button type="button" onClick={() => onNavigate('/policies')} className="hover:text-stone-900 dark:hover:text-stone-300 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button type="button" onClick={() => onNavigate('/policies')} className="hover:text-stone-900 dark:hover:text-stone-300 transition-colors cursor-pointer">
              Terms of Stay
            </button>
            <button type="button" onClick={() => onNavigate('/policies')} className="hover:text-stone-900 dark:hover:text-stone-300 transition-colors cursor-pointer">
              Refund Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
