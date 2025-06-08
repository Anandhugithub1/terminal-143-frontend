import React, {  useState,  memo } from 'react';
import placeholderImage from '../../../assets/woman.png';
import Skeleton from 'react-loading-skeleton';
import { 
    HeartIcon, 
    MapPinIcon, 
    SparklesIcon
  } from '@heroicons/react/24/outline';
  import Link from 'react-router-dom';
  // Filter button co
import 'react-loading-skeleton/dist/skeleton.css';

// Memoized ProfileCard
export const ProfileCard = memo(({ profile }) => {
    const firstImage = profile.images?.[0] || placeholderImage;
    const [imageLoaded, setImageLoaded] = useState(false);
    
    return (
      <Link
        to={`/profile/${profile.userId}`}
        className="group block mb-4 break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="relative aspect-[3/4]">
          {!imageLoaded && (
            <Skeleton 
              className="absolute inset-0 !rounded-xl" 
              containerClassName="absolute inset-0"
            />
          )}
          <img
            src={firstImage}
            alt={profile.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
  
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
            <h3 className="text-white font-bold text-lg truncate">
              {profile.name || 'Unnamed'}{profile.age && `, ${profile.age}`}
            </h3>
            {profile.location && (
              <div className="flex items-center text-gray-200 text-sm mt-1">
                <MapPinIcon className="h-4 w-4 mr-1 text-gray-300" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
  
          {/* Like button */}
          <button
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            onClick={(e) => e.preventDefault()}
          >
            <HeartIcon className="h-5 w-5 text-rose-500" />
          </button>
          
          {/* Online status */}
          {profile.online && (
            <span className="absolute top-3 left-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
          )}
          
          {/* Popular badge */}
          {profile.popular && (
            <span className="absolute bottom-3 left-3 flex items-center bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              <SparklesIcon className="h-3 w-3 mr-1" />
              Popular
            </span>
          )}
        </div>
      </Link>
    );
  });
  

  // Skeleton loader using react-loading-skeleton
 export const ProfileCardSkeleton = memo(() => (
    <div className="mb-4 break-inside-avoid rounded-xl overflow-hidden">
      <div className="relative aspect-[3/4]">
        <Skeleton 
          className="!rounded-xl h-full" 
          containerClassName="absolute inset-0"
        />
      </div>
      <div className="pt-3">
        <Skeleton width="70%" height={20} />
        <Skeleton width="40%" height={16} className="mt-2" />
      </div>
    </div>
  ));

