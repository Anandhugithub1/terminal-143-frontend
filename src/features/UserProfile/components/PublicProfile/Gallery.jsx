// GallerySection.jsx
import React from 'react';
import { Image } from 'lucide-react';

export default function GallerySection({ urls }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Image size={20} className="text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-800">Gallery</h3>
        <span className="ml-auto bg-gray-100 text-gray-600 text-sm px-2.5 py-0.5 rounded-full">
          {urls.length} photos
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {urls.map((url, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md group relative">
            <img
              src={url}
              alt={`Gallery ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transform transition duration-300"
              loading="lazy"
            />
            {i === 0 && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                Profile
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
