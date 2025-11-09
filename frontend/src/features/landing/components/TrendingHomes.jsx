import { useRef } from 'react';
import PropertyCard from '../../../components/PropertyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock Data
const trendingHomes = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    price: 484900,
    beds: 2,
    baths: 2,
    sqft: 1156,
    address: '12305 SW 94th Ter, Miami, FL, 33186',
    mls: 'MLS ID #A11910329, AHMANTERI REALTY GROUP, Felipe Guifarro',
    badge: '22 hours ago'
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    price: 435000,
    beds: 2,
    baths: 2,
    sqft: 1117,
    address: '13377 SW 112th Ln, Miami, FL, 33186',
    mls: 'MLS ID #A11878476, ONE STOP REALTY, Edian Burciaga',
    badge: 'Private patio'
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    price: 410000,
    beds: 3,
    baths: 1,
    sqft: 1015,
    address: '12413 SW 112th Ter, Miami, FL, 33186',
    mls: 'MLS ID #A11878476, ONE STOP REALTY, Edian Burciaga',
    badge: 'Granite countertop'
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    price: 649900,
    beds: 4,
    baths: 3,
    sqft: 2089,
    address: '13666 SW 116th Ln, Miami, FL, 33186',
    mls: 'MLS ID #A11879932, COLDWELL BANKER, Cooper Garcia',
    badge: 'Price cut: $99 (10/15)'
  }
];

export default function TrendingHomes() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 320; // card width + gap
      current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Trending Homes in The Crossings, FL
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Viewed and saved the most in the area over the past 24 hours
            </p>
          </div>

          {/* Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingHomes.map((home) => (
            <div key={home.id} className="snap-start shrink-0">
              <PropertyCard property={home} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}