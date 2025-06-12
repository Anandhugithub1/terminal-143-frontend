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
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export  function LoginRegisterModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Join to Unlock Full Profile</h2>
        <div className="flex flex-col gap-3">
          <Link to="/register" className="w-full">
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90">
              Register
            </button>
          </Link>
          <Link to="/login" className="w-full">
            <button className="w-full py-3 rounded-xl bg-white border text-gray-700 font-semibold hover:bg-gray-50">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
