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




export  function LoginPopupModal() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-center mb-3">Unlock Full Profile</h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Please register or login to view the complete profile details.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/register">
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90">
              Register
            </button>
          </Link>
          <Link to="/login">
            <button className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

