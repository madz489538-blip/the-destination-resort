import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle.js';
import { Menu, X, Calendar, Search } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Suites & Villas', path: '/accommodation' },
    { label: 'Dining', path: '/dining' },
    { label: 'Amenities', path: '/amenities' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'My Booking', path: '/booking-lookup' },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden bg-[#FAF8F5]/95 dark:bg-[#0D100F]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 h-18 sm:h-20 min-w-0">
          {/* Zone 1: Brand Wordmark (Responsive, luxury typography) */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="text-left flex flex-col justify-center min-w-0 py-1 transition-opacity hover:opacity-90"
          >
            <span className="font-serif text-sm sm:text-lg md:text-xl font-normal tracking-[0.06em] sm:tracking-[0.1em] text-stone-900 dark:text-[#FAF7F2] whitespace-nowrap truncate">
              THE DESTINATION
            </span>
            <span className="text-[8px] sm:text-[10px] tracking-[0.22em] uppercase font-medium text-[#9E7D42] dark:text-[#C5A880] leading-none">
              Resort · Tezpur
            </span>
          </button>

          {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase font-medium text-stone-600 dark:text-stone-300">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => handleNav(link.path)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
                  currentPath === link.path
                    ? 'border-[#9E7D42] dark:border-[#C5A880] text-stone-900 dark:text-white font-semibold'
                    : 'border-transparent hover:text-stone-900 dark:hover:text-white hover:border-stone-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => handleNav('/booking-search')}
              className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs tracking-widest uppercase font-medium text-white bg-[#9E7D42] hover:bg-[#866730] dark:bg-[#C5A880] dark:hover:bg-[#D8BD97] dark:text-[#0C0C0E] rounded btn-luxury whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Your Stay</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white focus-visible:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#151918] px-4 sm:px-6 py-5 space-y-4 w-full max-w-full overflow-hidden">
          <nav className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`text-left text-sm uppercase tracking-wider font-medium py-2 ${
                currentPath === '/' ? 'text-[#9E7D42] dark:text-[#C5A880] font-semibold' : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              Home
            </button>
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => handleNav(link.path)}
                className={`text-left text-sm uppercase tracking-wider font-medium py-2 ${
                  currentPath === link.path ? 'text-[#9E7D42] dark:text-[#C5A880] font-semibold' : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNav('/about')}
              className="text-left text-sm uppercase tracking-wider font-medium py-2 text-stone-700 dark:text-stone-300"
            >
              About Resort
            </button>
            <button
              type="button"
              onClick={() => handleNav('/contact')}
              className="text-left text-sm uppercase tracking-wider font-medium py-2 text-stone-700 dark:text-stone-300"
            >
              Guest Concierge & Contact
            </button>
          </nav>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => handleNav('/booking-search')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs tracking-widest uppercase font-medium text-white bg-[#9E7D42] dark:bg-[#C5A880] dark:text-[#0C0C0E] rounded btn-luxury cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Your Stay</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
