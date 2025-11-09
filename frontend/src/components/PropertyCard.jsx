import { Heart } from 'lucide-react';

export default function PropertyCard({ property }) {
  const { img, price, beds, baths, sqft, address, mls, badge } = property;

  return (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 min-w-[300px] max-w-[300px]">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={img} 
          alt={address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition">
          <Heart className="w-5 h-5 text-gray-600 group-hover:fill-red-500 group-hover:text-red-500 transition" />
        </button>

        {badge && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-2xl font-bold text-gray-900">${price.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1">
          {beds} bds | {baths} ba | {sqft.toLocaleString()} sqft | Active
        </p>
        <p className="text-sm text-gray-800 mt-2 line-clamp-1">{address}</p>
        <p className="text-xs text-gray-500 mt-1">{mls}</p>
      </div>
    </div>
  );
}