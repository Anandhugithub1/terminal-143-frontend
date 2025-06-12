// InterestsSection.jsx
import React from 'react';
import { Heart } from 'lucide-react';

export default function InterestsSection({ items }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Heart size={20} className="text-red-500" />
        <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
 