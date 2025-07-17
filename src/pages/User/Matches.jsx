import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import placeholderImage from '../../assets/woman.png';


// Demo data for matches
const demoMatches = [
  { id: 1, name: 'Alice', bio: 'Loves hiking and outdoor adventures.' },
  { id: 2, name: 'Bob', bio: 'Coffee enthusiast and book lover.' },
  { id: 3, name: 'Clara', bio: 'Tech geek who enjoys painting on weekends.' },
];

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setMatches(demoMatches);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="px-4 pt-4 space-y-4 animate-pulse flex-1">
          <Skeleton height={30} width={120} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton circle width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton height={16} width="50%" />
                <Skeleton height={12} width="80%" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // No matches
  if (!matches.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-lg">No matches found</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />

      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-semibold">Matches</h1>

        {matches.map(match => (
          <div
            key={match.id}
            className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg shadow-sm"
          >
            <img
              src={placeholderImage}
              alt={match.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{match.name}</p>
              <p className="text-sm text-gray-500">{match.bio}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
