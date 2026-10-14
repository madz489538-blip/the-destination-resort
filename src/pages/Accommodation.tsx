import React, { useState, useEffect } from 'react';
import { RoomType } from '../types/resort.js';
import { ResortVisual } from '../components/ResortVisual.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { Users, Bed, Maximize2, Check, ArrowRight, ShieldAlert, Sparkles, X } from 'lucide-react';

interface AccommodationProps {
  onNavigate: (path: string, state?: any) => void;
}

export const Accommodation: React.FC<AccommodationProps> = ({ onNavigate }) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOccupancy, setFilterOccupancy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price_asc');
  const [selectedRoomModal, setSelectedRoomModal] = useState<RoomType | null>(null);

  useEffect(() => {
    fetch('/api/room-types')
      .then((res) => res.json())
      .then((data) => {
        setRoomTypes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load room types:', err);
        setLoading(false);
      });
  }, []);

  const getVisualType = (id: string): 'cottage' | 'suite' | 'villa' | 'serene' => {
    if (id.includes('cottage')) return 'cottage';
    if (id.includes('suite')) return 'suite';
    if (id.includes('villa')) return 'villa';
    return 'serene';
  };

  const filtered = roomTypes.filter((rt) => {
    if (filterOccupancy === 'couples') return rt.maxOccupancy <= 2;
    if (filterOccupancy === 'family') return rt.maxOccupancy >= 4;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'price_asc') return a.baseNightlyRate - b.baseNightlyRate;
    if (sortBy === 'price_desc') return b.baseNightlyRate - a.baseNightlyRate;
    return 0;
  });

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Editorial Header */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Luxury Living
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1 mb-3">
            Accommodation & Private Villas
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light leading-relaxed">
            Thoughtfully appointed residences blending Assam’s architectural charm with contemporary comfort. All suites and cottages offer high-speed Wi-Fi, organic bath amenities, and estate views.
          </p>
        </div>
      </ScrollReveal>

      {/* Demo Notice Banner */}
      <ScrollReveal variant="fade-in" duration={450} delay={100}>
        <div className="mb-8 p-3.5 sm:p-4 rounded bg-stone-100 dark:bg-[#151918] border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start sm:items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-snug">
            <strong>Demo Inventory Notice:</strong> Room categories, dimensions, and prices shown below are sample demonstration data for presentation purposes.
          </span>
        </div>
      </ScrollReveal>

      {/* Filter and Sort Toolbar */}
      <ScrollReveal variant="fade-up" duration={450} delay={150}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 mb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Filter:</span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded">
              <button
                type="button"
                onClick={() => setFilterOccupancy('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 cursor-pointer ${
                  filterOccupancy === 'all'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                All Types
              </button>
              <button
                type="button"
                onClick={() => setFilterOccupancy('couples')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 cursor-pointer ${
                  filterOccupancy === 'couples'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Couples (1-2)
              </button>
              <button
                type="button"
                onClick={() => setFilterOccupancy('family')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 cursor-pointer ${
                  filterOccupancy === 'family'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Suites & Villas (3-6)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort room types"
              className="text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-1.5 rounded text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </ScrollReveal>

      {/* Room Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500 text-xs sm:text-sm animate-pulse">
          Loading accommodation collection...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {filtered.map((room, index) => {
            const visualType = getVisualType(room.id);
            return (
              <ScrollReveal key={room.id} variant="fade-up" delay={index * 120} duration={650}>
                <div
                  className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded overflow-hidden flex flex-col group card-luxury shadow-xs w-full min-w-0"
                >
                  <div className="relative h-64 sm:h-72 w-full img-luxury-wrapper">
                    <ResortVisual
                      type={visualType}
                      className="w-full h-full"
                      alt={room.name}
                    />
                    <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-sm text-amber-300 dark:text-[#C5A880] px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase border border-amber-500/20 rounded">
                      Demo Rate
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Unboxed Metadata with Typographic Separator */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-2">
                        <span>{room.roomSizeSqft} sq.ft</span>
                        <span aria-hidden="true">·</span>
                        <span>{room.bedConfig}</span>
                        <span aria-hidden="true">·</span>
                        <span>Max {room.maxOccupancy} Guests</span>
                      </div>

                      <h2 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-[#FAF7F2] mb-2">
                        {room.name}
                      </h2>

                      <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed mb-5">
                        {room.description}
                      </p>

                      {/* Curated Key Amenities */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-6">
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                            <Check className="w-3.5 h-3.5 text-[#9E7D42] dark:text-[#C5A880] shrink-0" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                          Standard Nightly Tariff
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-xl sm:text-2xl font-normal text-stone-900 dark:text-[#FAF7F2] tabular-nums">
                            ₹{room.baseNightlyRate.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-stone-400 font-light">/ night + taxes</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRoomModal(room)}
                          className="flex-1 sm:flex-none px-3.5 py-2 text-xs uppercase tracking-wider font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-700 rounded btn-luxury text-center cursor-pointer"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigate('/booking-search', { preselectedRoom: room.id })}
                          className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury text-center shadow-xs cursor-pointer"
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Room Details Modal */}
      {selectedRoomModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedRoomModal(null)}
        >
          <div
            className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 max-w-xl w-full rounded overflow-hidden max-h-[92vh] flex flex-col shadow-2xl transform transition-transform duration-300 scale-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-52 sm:h-60 relative shrink-0">
              <ResortVisual type={getVisualType(selectedRoomModal.id)} className="w-full h-full" alt={selectedRoomModal.name} />
              <button
                type="button"
                onClick={() => setSelectedRoomModal(null)}
                aria-label="Close modal"
                className="absolute top-3 right-3 bg-stone-900/80 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-stone-900 text-sm cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
              <div>
                <span className="text-[10px] sm:text-[11px] text-[#9E7D42] dark:text-[#C5A880] uppercase tracking-widest font-semibold">
                  Residence Specifications
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-[#FAF7F2] mt-0.5">
                  {selectedRoomModal.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedRoomModal.roomSizeSqft} sq.ft · {selectedRoomModal.bedConfig} · Up to {selectedRoomModal.maxOccupancy} Guests (Max {selectedRoomModal.maxAdults} Adults)
                </p>
              </div>

              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">Description</h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                  {selectedRoomModal.description}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Amenities Included</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedRoomModal.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                      <Check className="w-3.5 h-3.5 text-[#9E7D42] dark:text-[#C5A880] shrink-0" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-1">
                <p><strong>Check-in:</strong> 14:00 onwards · <strong>Check-out:</strong> 11:00</p>
                <p><strong>Weekend Tariff:</strong> ₹{selectedRoomModal.weekendRate?.toLocaleString('en-IN') || selectedRoomModal.baseNightlyRate.toLocaleString('en-IN')} (Fri & Sat)</p>
                <p><strong>Extra Guest Tariff:</strong> ₹{selectedRoomModal.extraGuestCharge.toLocaleString('en-IN')} / night</p>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase text-stone-400 block font-medium">Demo Nightly Rate</span>
                  <span className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white tabular-nums font-semibold">
                    ₹{selectedRoomModal.baseNightlyRate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-stone-400"> / night</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const id = selectedRoomModal.id;
                    setSelectedRoomModal(null);
                    onNavigate('/booking-search', { preselectedRoom: id });
                  }}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury cursor-pointer"
                >
                  Book This Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
