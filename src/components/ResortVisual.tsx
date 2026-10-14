import React, { useState } from 'react';

export type VisualType =
  | 'hero'
  | 'exterior'
  | 'cottage'
  | 'suite'
  | 'villa'
  | 'serene'
  | 'dining'
  | 'pool'
  | 'tea'
  | 'spa'
  | 'nature';

interface ResortVisualProps {
  type: VisualType;
  className?: string;
  alt?: string;
  priority?: boolean;
}

const PHOTOGRAPHY_MAP: Record<VisualType, { url: string; fallbackLabel: string }> = {
  hero: {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
    fallbackLabel: 'The Destination Resort Twilight Pavilion',
  },
  exterior: {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
    fallbackLabel: 'Resort Architecture & Grounds',
  },
  cottage: {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Deluxe Heritage Cottage',
  },
  suite: {
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Luxury Plantation Suite',
  },
  villa: {
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Executive Brahmaputra Villa',
  },
  serene: {
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Boutique Serene Room',
  },
  dining: {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Brahmaputra Pavilion Dining',
  },
  pool: {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Sunset Infinity Pool',
  },
  tea: {
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Verandah Tea Salon & High Tea',
  },
  spa: {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Botanical Spa & Ayurvedic Therapy',
  },
  nature: {
    url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=1200&q=80',
    fallbackLabel: 'Assam Tea Estate Trails',
  },
};

export const ResortVisual: React.FC<ResortVisualProps> = ({
  type,
  className = '',
  alt = 'The Destination Resort',
  priority = false,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const photoInfo = PHOTOGRAPHY_MAP[type] || PHOTOGRAPHY_MAP.exterior;

  return (
    <div className={`relative overflow-hidden bg-stone-900 ${className}`}>
      {!loadError ? (
        <>
          <img
            src={photoInfo.url}
            alt={alt || photoInfo.fallbackLabel}
            loading={priority ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setLoadError(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${
              loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
          {/* Subtle loading placeholder shimmer */}
          {!loaded && (
            <div className="absolute inset-0 bg-stone-800 animate-pulse" />
          )}
        </>
      ) : (
        /* Zero-broken-image fallback: Refined architectural gradient container */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 text-stone-300">
          <div className="w-10 h-10 mb-2 rounded-full border border-amber-600/30 flex items-center justify-center text-amber-300 font-serif">
            TR
          </div>
          <span className="font-serif text-sm tracking-wide text-[#FAF7F2]">
            {photoInfo.fallbackLabel}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] mt-1">
            The Destination Resort
          </span>
        </div>
      )}

      {/* Measured luxury scrim overlay to guarantee text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
    </div>
  );
};
