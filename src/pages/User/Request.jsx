import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';

// Demo request data
const demoRequests = [

];

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(demoRequests);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Loading Requests...</h1>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl shadow-md p-4 bg-gray-50 flex flex-col gap-2"
            >
              <Skeleton height={20} width="40%" />
              <Skeleton height={16} width="80%" />
              <Skeleton height={16} width="60%" />
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="bg-gray-100 p-6 rounded-xl shadow max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3" />
            <h2 className="text-lg font-bold">No Requests Yet</h2>
            <p className="text-sm text-gray-500">You haven't made any requests.</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Your Requests</h1>
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 transition hover:shadow-lg"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">{req.title}</h2>
                <span className="text-sm text-gray-500">{req.date}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{req.description}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
