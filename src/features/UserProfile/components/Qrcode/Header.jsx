// src/pages/components/Header.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Header({ onBack }) {
  return (
    <header className="flex items-center px-6 py-4 bg-white shadow-sm">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-pink-100 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={24} className="text-pink-600" />
      </button>
      <h1 className="flex-1 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
        Share Your Love Code
      </h1>
    </header>
  );
}
