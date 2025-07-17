import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import placeholderImage from '../../assets/woman.png';

// Demo data remains the same
// const demoMatches = [ /* unchanged */ ];
const demoMatches = [
    {
      id: 1,
      name: 'Alice',
      age: 25,
      gender: 'Female',
      bio: 'Loves hiking and outdoor adventures.',
      socialMediaLinks: [
        { platform: 'IG', usernameOrLink: '@alice_hikes' },
        { platform: 'Telegram', usernameOrLink: '@aliceTG' },
      ],
    },
    {
      id: 2,
      name: 'Bob',
      age: 28,
      gender: 'Male',
      bio: 'Coffee enthusiast and book lover.',
      socialMediaLinks: [
        { platform: 'FB', usernameOrLink: 'fb.com/bob.latte' },
      ],
    },
    {
      id: 3,
      name: 'Clara',
      age: 22,
      gender: 'Female',
      bio: 'Tech geek who enjoys painting on weekends.',
      socialMediaLinks: [
        { platform: 'Line', usernameOrLink: '@claraPaints' },
        { platform: 'IG', usernameOrLink: '@clara.tech' },
      ],
    },
  ];


export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatches(demoMatches);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="px-4 pt-4 pb-20">
          <h1 className="text-2xl font-semibold mb-6">Matches</h1>
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Skeleton circle width={64} height={64} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={20} width="40%" />
                  <Skeleton height={16} width="80%" />
                  <div className="space-y-1.5">
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={16} width="70%" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          <div className="bg-gray-100 p-8 rounded-2xl text-center max-w-md">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
            <p className="text-gray-600">Start swiping to find your perfect match!</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Platform icon mapping
  const platformIcons = {
    IG: '📸',
    Telegram: '✈️',
    FB: '👍',
    Line: '💬'
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-semibold mb-6">Your Matches</h1>

        <div className="space-y-5">
          {matches.map(match => (
            <div
              key={match.id}
              className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={placeholderImage}
                    alt={match.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {match.age}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="font-bold text-lg">{match.name}</h2>
                  </div>
                  
                  <p className="text-gray-600 mt-1 mb-3 text-sm">{match.bio}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Connect:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.socialMediaLinks.map((link, i) => (
                        <a
                          key={i}
                          href={
                            link.usernameOrLink.startsWith('http')
                              ? link.usernameOrLink
                              : '#'
                          }
                          className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-sm shadow-xs border border-gray-200 hover:bg-blue-50 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="text-base">{platformIcons[link.platform] || '🔗'}</span>
                          <span className="font-medium text-blue-600">{link.usernameOrLink}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}