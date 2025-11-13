// src/pages/components/Toast.jsx
import React from 'react';
import { Heart } from 'lucide-react';

export default function Toast({ open, message }) {
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 transform -translate-x-1/2
        px-6 py-3 rounded-full shadow-lg flex items-center space-x-2
        bg-pink-600 text-white transition-all duration-300
        ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <Heart size={18} className="fill-current" />
      <span>{message}</span>
    </div>
  );
}
