// import React, { useEffect, useMemo, useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProfiles } from '../../features/Profiles';
// import TopNav from '../../components/Layout/TopNavigation';
// import BottomNav from '../../components/Layout/BottomNavigation';
// import { LoadingSpinner } from '../../components/Ui/Spinner';
// import { ProfileCard, ProfileCardSkeleton } from '../../features/Explore/components/Card';
// import ExploreFilterBar from '../../features/Explore/components/Filter';
// import EmptyExploreState from '../../features/Explore/components/EmptyExploreState';

// export default function ExplorePage() {
//   const dispatch = useDispatch();
//   const { list: profiles, status, error } = useSelector((state) => state.profiles);
//   const preferences = useMemo(() => ['F'], []);
//   const [activeFilter, setActiveFilter] = useState('All');
//   const [refreshing, setRefreshing] = useState(false);
  
//   const filteredProfiles = useMemo(() => {
//     if (activeFilter === 'All') return profiles;
    
//     return profiles.filter(profile => {
//       if (activeFilter === 'Nearby') return profile.distance < 50;
//       if (activeFilter === 'Popular') return profile.popular;
//       if (activeFilter === 'New') return profile.isNew;
//       return true;
//     });
//   }, [profiles, activeFilter]);

//   const fetchData = useCallback(async () => {
//     await dispatch(fetchProfiles({ preferences }));
//     setRefreshing(false);
//   }, [dispatch, preferences]);

//   useEffect(() => {
//     if (status === 'idle') fetchData();
//   }, [status, fetchData]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   const handleFilterChange = useCallback((filter) => {
//     setActiveFilter(filter);
//   }, []);

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
//         <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
//           <div className="text-red-500 font-medium mb-4">Error: {error}</div>
//           <button
//             onClick={handleRefresh}
//             className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center mx-auto"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const isEmpty = filteredProfiles.length === 0;

//   return (
//     <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
//       <TopNav />
//       <ExploreFilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />

//       <div className="pt-4 px-4 pb-24">
//         {status === 'loading' && !refreshing ? (
//           <div className="columns-2 sm:columns-3 gap-4 space-y-4 md:columns-none md:grid md:grid-cols-4 md:gap-4 md:space-y-0">
//             {Array.from({ length: 8 }).map((_, idx) => (
//               <ProfileCardSkeleton key={idx} />
//             ))}
//           </div>
//         ) : isEmpty ? (
//           <EmptyExploreState onRefresh={handleRefresh} />
//         ) : (
//           <>
//             {refreshing && (
//               <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
//                 <LoadingSpinner size="md" />
//               </div>
//             )}
//             <div 
//               className={`columns-2 sm:columns-3 gap-4 space-y-4 md:columns-none md:grid md:grid-cols-4 md:gap-4 md:space-y-0 transition-opacity ${
//                 refreshing ? 'opacity-70' : 'opacity-100'
//               }`}
//             >
//               {filteredProfiles.map((profile) => (
//                 <ProfileCard key={profile.userId} profile={profile} />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       <BottomNav />
//     </div>
//   );
// }
