// src/pages/components/QRShareCard.jsx
import React from 'react';
import { Share2 } from 'lucide-react';
import {Button} from '../../../../shared/Button'
export default function QRShareCard({ profile, onShare }) {
  const qrCodeSrc = profile?.qrCodeUrl?.startsWith('http')
    ? profile.qrCodeUrl
    : `https://${profile.qrCodeUrl}`;

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center space-y-6">
      
      {/* Heading */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-gray-600 text-sm max-w-xs">
          Share this to let others view your dating profile and connect with you!
        </p>
      </div>

      {/* QR Code */}
      <div className="relative p-6 bg-white rounded-2xl shadow-inner border-4 border-dotted border-pink-100">
        <img
          src={qrCodeSrc}
          alt="Dating profile QR code"
          className="w-64 h-64 object-contain bg-gray-100"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full animate-pulse" />
        </div>
      </div>

  
      <Button onClick={onShare}
      
      disabled={!profile.profileLink} className='flex items-center justify-center  transition-all disabled:opacity-50 active:scale-95'>
        
            <Share2 className="mr-3" size={20} />
        Share Profile


      </Button>
    </div>
  );
}
