import React from "react";
import logo from "../../../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";

export default function PublicTopbar() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-3 py-2 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Logo"
            className="h-13 object-contain"
          />
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => navigate("/login")}
          className="text-pink-600 text-sm font-medium hover:underline"
        >
          Sign In
        </button>

      </div>
    </div>
  );
}
