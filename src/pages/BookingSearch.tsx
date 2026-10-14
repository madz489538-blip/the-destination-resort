import React, { useState, useEffect } from 'react';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { Calendar, Users, Check, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface BookingSearchProps {
  initialState?: {
    checkInDate?: string;
    checkOutDate?: string;
    adults?: number;
    children?: number;
    roomsCount?: number;
    preselectedRoom?: string;
  };
  onSelectRoomForCheckout: (searchData: any, selectedRoom: any) => void;
}

export const BookingSearch: React.FC<BookingSearchProps> = ({ initialState, onSelectRoomForCheckout }) => {
  const today = new Date();
  const defaultIn = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
  const defaultOut = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(initialState?.checkInDate || defaultIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(initialState?.checkOutDate || defaultOut);
  const [adults, setAdults] = useState<number>(initialState?.adults || 2);
  const [children, setChildren] = useState<number>(initialState?.children || 0);
  const [roomsCount, setRoomsCount] = useState<number>(initialState?.roomsCount || 1);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const runSearch = async (inDate: string, outDate: string, ad: number, ch: number, rm: number) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/availability/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInDate: inDate,
          checkOutDate: outDate,
          adults: ad,
          children: ch,
          roomsCount: rm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to search availability.');
        setSearchResults([]);
      } else {
        setSearchResults(data.results || []);
      }
    } catch (err: any) {
      setErrorMsg('Network error while querying room availability. Please check server status.');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    runSearch(checkInDate, checkOutDate, adults, children, roomsCount);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(checkInDate, checkOutDate, adults, children, roomsCount);
  };

  const getVisualType = (id: string): 'cottage' | 'suite' | 'villa' | 'serene' => {
    if (id.includes('cottage')) return 'cottage';
    if (id.includes('suite')) return 'suite';
    if (id.includes('villa')) return 'villa';
    return 'serene';
  };

  return (
    <div className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Title */}
      <ScrollReveal variant="fade-up" duration={450}>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Step 1 & 2 · Live Inventory Engine
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1 mb-2">
            Check Room Availability
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light">
            Dates are verified against server-authoritative room inventory and existing bookings in Tezpur.
          </p>
        </div>
      </ScrollReveal>

      {/* Search Input Box */}
      <ScrollReveal variant="scale-in" duration={550} delay={100}>
        <div className="bg-white dark:bg-[#151918] p-4 sm:p-6 rounded border border-stone-200 dark:border-stone-800 shadow-sm mb-8 w-full min-w-0 card-luxury">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
              Check-In Date
            </label>
            <input
              type="date"
              value={checkInDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOutDate}
              min={checkInDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
              Guests
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                aria-label="Number of adults"
                className="w-full px-2 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
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
                className="w-full px-2 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Update Search'}
            </button>
          </div>
        </form>
      </div>
      </ScrollReveal>

      {/* Validation Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Results */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-xs sm:text-sm">
          Checking physical room inventory and calculating rates...
        </div>
      ) : hasSearched && searchResults.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-[#161918] border border-stone-200 dark:border-stone-800 rounded p-6">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="font-serif text-lg text-stone-800 dark:text-stone-200 mb-1">No Rooms Available</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-3">
            No accommodations match your chosen dates or guest count. Please try modifying your check-in dates.
          </p>
        </div>
      ) : (
        <div className="space-y-6 w-full min-w-0">
          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 pb-2 border-b border-stone-200 dark:border-stone-800">
            <span>
              Showing {searchResults.length} categories for{' '}
              <strong>{searchResults[0]?.pricing?.nights || 1} night(s)</strong>
            </span>
            <span className="text-[11px] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
              Live Verified Rates
            </span>
          </div>

          {searchResults.map((item) => {
            const rt = item.roomType;
            const pricing = item.pricing;
            const isAvail = item.isAvailable;

            return (
              <ScrollReveal key={rt.id} variant="fade-up" duration={550}>
                <div
                  className={`bg-white dark:bg-[#151918] border rounded overflow-hidden flex flex-col md:flex-row transition-all w-full min-w-0 card-luxury ${
                    isAvail
                      ? 'border-stone-200 dark:border-stone-800 hover:border-[#9E7D42]/40 dark:hover:border-[#C5A880]/40 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800/50 opacity-70 bg-stone-50/50 dark:bg-stone-900/30'
                  }`}
                >
                  {/* Visual */}
                  <div className="md:w-72 lg:w-80 h-52 sm:h-60 md:h-auto relative shrink-0 img-luxury-wrapper">
                    <ResortVisual type={getVisualType(rt.id)} className="w-full h-full" alt={rt.name} />
                    {!isAvail && (
                      <div className="absolute inset-0 bg-stone-950/70 flex items-center justify-center p-4 text-center">
                        <span className="text-xs uppercase tracking-wider font-semibold text-rose-300 bg-rose-950/80 px-3 py-1.5 rounded border border-rose-800">
                          Unavailable For Dates
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                        <h2 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-[#FAF7F2] truncate">
                          {rt.name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                          <span>{rt.roomSizeSqft} sq.ft</span>
                          <span>·</span>
                          <span>{rt.bedConfig}</span>
                          <span>·</span>
                          <span>Max {rt.maxOccupancy} Guests</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-3">
                        {rt.shortDesc}
                      </p>

                      {/* Unavailability Explanation if any */}
                      {!isAvail && item.unavailabilityReason && (
                        <div className="mb-3 p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.unavailabilityReason}</span>
                        </div>
                      )}

                      {/* Available amenities */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400 mb-4">
                        {rt.amenities.slice(0, 5).map((a: string, i: number) => (
                          <div key={i} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#9E7D42] dark:text-[#C5A880]" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing and Action */}
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-xl sm:text-2xl font-normal text-stone-900 dark:text-white tabular-nums">
                            ₹{pricing ? pricing.finalTotal.toLocaleString('en-IN') : rt.baseNightlyRate.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-stone-500 font-light">
                            total ({pricing?.nights || 1} nights, incl. taxes)
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-stone-400">
                          ₹{rt.baseNightlyRate.toLocaleString('en-IN')} / night base tariff
                          {pricing?.weekendSurcharge > 0 && ` + ₹${pricing.weekendSurcharge} weekend adj.`}
                        </div>
                      </div>

                      <div>
                        {isAvail ? (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectRoomForCheckout(
                                { checkInDate, checkOutDate, adults, children, roomsCount },
                                rt
                              )
                            }
                            className="w-full sm:w-auto px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <span>Select & Continue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full sm:w-auto px-4 py-2 text-xs uppercase tracking-wider font-medium bg-stone-200 dark:bg-stone-800 text-stone-400 rounded cursor-not-allowed"
                          >
                            Fully Booked
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
};
