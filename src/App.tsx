import React, { useState, useEffect } from 'react';
import { WelcomeIntro } from './components/WelcomeIntro.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { DemoNotice } from './components/DemoNotice.js';
import { Home } from './pages/Home.js';
import { Accommodation } from './pages/Accommodation.js';
import { Dining } from './pages/Dining.js';
import { Amenities } from './pages/Amenities.js';
import { Gallery } from './pages/Gallery.js';
import { BookingSearch } from './pages/BookingSearch.js';
import { BookingCheckout } from './pages/BookingCheckout.js';
import { BookingConfirmation } from './pages/BookingConfirmation.js';
import { BookingLookup } from './pages/BookingLookup.js';
import { Contact } from './pages/Contact.js';
import { About } from './pages/About.js';
import { Policies } from './pages/Policies.js';
import { AdminPortal } from './pages/admin/AdminPortal.js';
import { RoomType, Reservation } from './types/resort.js';

export function App() {
  // Cinematic Welcome Intro session state
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('tdr_intro_seen');
      return !seen;
    }
    return false;
  });

  // Client-side routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Flow State
  const [searchParams, setSearchParams] = useState<any>(null);
  const [selectedRoomForCheckout, setSelectedRoomForCheckout] = useState<RoomType | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Sync with browser history popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, state?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPath(path);
    window.history.pushState({}, '', path);

    if (state) {
      if (state.checkInDate) {
        setSearchParams(state);
      }
      if (state.preselectedRoom) {
        setSearchParams((prev: any) => ({ ...prev, preselectedRoom: state.preselectedRoom }));
      }
    }
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('tdr_intro_seen', 'true');
    setShowIntro(false);
  };

  const handleSelectRoomForCheckout = (searchData: any, room: RoomType) => {
    setSearchParams(searchData);
    setSelectedRoomForCheckout(room);
    navigate('/checkout');
  };

  const handleBookingComplete = (reservation: Reservation) => {
    setConfirmedReservation(reservation);
    navigate('/confirmation');
  };

  // If on Admin Portal route, render dedicated admin view without guest header/footer
  if (currentPath === '/admin') {
    return <AdminPortal onNavigateHome={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0C0E] text-stone-800 dark:text-stone-200 transition-colors">
      {/* 1. Cinematic Welcome Intro (Session-based) */}
      {showIntro && <WelcomeIntro onComplete={handleIntroComplete} />}

      {/* 2. Concept Demonstration Notice Banner */}
      <DemoNotice variant="banner" />

      {/* 3. Top Navigation Bar (3-Zone Contract) */}
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {/* 4. Page Routing Content */}
      <main className="flex-1">
        {currentPath === '/' && <Home onNavigate={navigate} />}

        {currentPath === '/accommodation' && <Accommodation onNavigate={navigate} />}

        {currentPath === '/dining' && <Dining onNavigate={navigate} />}

        {currentPath === '/amenities' && <Amenities onNavigate={navigate} />}

        {currentPath === '/gallery' && <Gallery onNavigate={navigate} />}

        {currentPath === '/booking-search' && (
          <BookingSearch
            initialState={searchParams}
            onSelectRoomForCheckout={handleSelectRoomForCheckout}
          />
        )}

        {currentPath === '/checkout' && (
          <BookingCheckout
            searchData={
              searchParams || {
                checkInDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                adults: 2,
                children: 0,
                roomsCount: 1,
              }
            }
            selectedRoom={
              selectedRoomForCheckout || {
                id: 'deluxe-heritage-cottage',
                name: 'Deluxe Heritage Cottage',
                description: 'Artisanal wooden cottage set amidst tea canopy with private garden sit-out.',
                shortDesc: 'Artisanal wooden cottage amidst tea canopy with private garden sit-out.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                bedConfig: '1 King Bed',
                roomSizeSqft: 450,
                amenities: ['Private Verandah', 'Garden View', 'Artisanal Tea Station'],
                images: [],
                published: true,
                baseNightlyRate: 6500,
                weekendRate: 7200,
                extraGuestCharge: 1200,
              }
            }
            onBookingComplete={handleBookingComplete}
            onBackToSearch={() => navigate('/booking-search')}
          />
        )}

        {currentPath === '/confirmation' && confirmedReservation && (
          <BookingConfirmation reservation={confirmedReservation} onNavigate={navigate} />
        )}

        {currentPath === '/booking-lookup' && <BookingLookup onNavigate={navigate} />}

        {currentPath === '/contact' && <Contact onNavigate={navigate} />}

        {currentPath === '/about' && <About onNavigate={navigate} />}

        {currentPath === '/policies' && <Policies onNavigate={navigate} />}

        {/* Fallback 404 / Unavailable page */}
        {![
          '/',
          '/accommodation',
          '/dining',
          '/amenities',
          '/gallery',
          '/booking-search',
          '/checkout',
          '/confirmation',
          '/booking-lookup',
          '/contact',
          '/about',
          '/policies',
        ].includes(currentPath) && (
          <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#9E7D42] dark:text-[#C5A880] font-semibold">
              404 · Destination Not Found
            </span>
            <h1 className="font-serif text-3xl text-stone-900 dark:text-white">
              Page Unavailable
            </h1>
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              The requested page does not exist or has been relocated.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded hover:opacity-90"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 5. Editorial Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
export default App;
