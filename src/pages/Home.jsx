// import React, { useState, memo } from 'react';
// import { useSwipeable } from 'react-swipeable';
// // eslint-disable-next-line no-unused-vars
// import {  motion,AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { profilesData } from '../Utlis/utlis';
// import { BottomNav } from '../shared/common';
// import { FiSettings, FiBell } from 'react-icons/fi';

// const cardVariants = {
//   enter: (direction) => ({
//     x: direction > 0 ? '150%' : '-150%',
//     opacity: 0,
//     scale: 0.95
//   }),
//   center: {
//     x: 0,
//     opacity: 1,
//     scale: 1,
//     transition: { type: 'spring', stiffness: 320, damping: 35 }
//   },
//   exit: (direction) => ({
//     x: direction > 0 ? '-150%' : '150%',
//     opacity: 0,
//     scale: 0.95,
//     transition: { duration: 0.25 }
//   })
// };

// const Header = memo(() => (
//   <header className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
//     <div className="h-16 flex items-center justify-between px-4 max-w-md mx-auto">
//       <Link
//         to="/profile"
//         className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-pink-400 flex items-center justify-center shadow-lg"
//         aria-label="Profile"
//       >
//         <span className="text-white font-extrabold text-xl">Logo</span>
//       </Link>
//       <div className="flex flex-col items-center">
//         <button className="text-sm text-gray-700 font-semibold">
//           <span className="inline-flex items-center">
//             <svg className="w-4 h-4 text-pink-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
//             </svg>
//             Thailand
//           </span>
//         </button>
//         <span className="text-xs text-pink-500">JC Street, Acer Point</span>
//       </div>
//       <div className="flex space-x-2">
//         <button className="p-2.5 rounded-full bg-white shadow-md" aria-label="Settings">
//           <FiSettings className="w-6 h-6 text-pink-500" />
//         </button>
//         <button className="p-2.5 rounded-full bg-white shadow-md" aria-label="Notifications">
//           <FiBell className="w-6 h-6 text-pink-500" />
//         </button>
//       </div>
//     </div>
//   </header>
// ));



// const ProfileCard = ({ profile, isActive, cardOffset, direction, onAnimationComplete }) => {
//   const style = {
//     zIndex: profilesData.length - profile.id,
//     scale: 1 - Math.abs(cardOffset) * 0.03,
//     top: `${Math.abs(cardOffset) * 12}px`,
//     filter: `brightness(${1 - Math.abs(cardOffset) * 0.1})`
//   };

//   return (
//     <motion.div
//       custom={direction}
//       variants={cardVariants}
//       initial="enter"
//       animate={isActive ? 'center' : 'exit'}
//       exit="exit"
//       className="absolute w-full h-full origin-center"
//       style={style}
//       onAnimationComplete={onAnimationComplete}
//     >
//       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 w-full h-full">
//         <div className="relative aspect-[3/4] w-full">
//           <img
//             src={profile.image}
//             alt={`Profile of ${profile.name}`}
//             className="w-full h-full object-cover select-none"
//             draggable="false"
//           />
//           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4">
//             <h2 className="text-lg font-bold text-white">
//               {profile.name}, {profile.age}
//             </h2>
//             <div className="flex items-center gap-2 mt-1">
//               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
//               </svg>
//               <span className="text-white text-sm">{profile.distance}</span>
//             </div>
//           </div>
//         </div>
//         <div className="p-4 flex-1 overflow-hidden">
//           <p className="text-gray-700 text-sm">{profile.bio}</p>
//           <div className="flex flex-wrap gap-2 mt-3">
//             {['Art', 'Coffee', 'Hiking'].map(tag => (
//               <span key={tag} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export const HomeScreen = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [isAnimating, setIsAnimating] = useState(false);

//   const swipeHandlers = useSwipeable({
//     onSwipedLeft: () => handleSwipe('left'),
//     onSwipedRight: () => handleSwipe('right'),
//     trackMouse: true,
//     delta: 10
//   });

//   const handleSwipe = (dir) => {
//     if (isAnimating || currentIndex >= profilesData.length) return;
//     setDirection(dir === 'right' ? 1 : -1);
//     setIsAnimating(true);
//     setCurrentIndex((prev) => prev + 1);
//   };

//   const resetProfiles = () => {
//     setCurrentIndex(0);
//     setIsAnimating(false);
//   };

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col">
//       <Header />
//       <main className="flex-1 mt-16 mb-16 overflow-y-auto">
//         <div className="max-w-md mx-auto px-4 py-6" {...(currentIndex < profilesData.length && swipeHandlers)}>
//           <div className="relative w-full h-[70vh] min-h-[500px] md:h-[600px] max-w-[500px] mx-auto">

//             {currentIndex < profilesData.length ? (
//               profilesData.map((profile, index) => {
//                 const isActive = index === currentIndex;
//                 const cardOffset = index - currentIndex;
//                 return (
//                   <AnimatePresence custom={direction} key={profile.id}>
//                     {index >= currentIndex && (
//                       <ProfileCard 
//                         profile={profile} 
//                         isActive={isActive} 
//                         cardOffset={cardOffset} 
//                         direction={direction}
//                         onAnimationComplete={() => setIsAnimating(false)}
//                       />
//                     )}
//                   </AnimatePresence>
//                 );
//               })
//             ) : (
//               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
//                 <div className="text-gray-500 mb-6">
//                   <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636L16.95 7.05A7 7 0 0019 12a7 7 0 11-7-7c1.93 0 3.68.78 4.95 2.05l1.414-1.414A9 9 0 103 12a9 9 0 0118 0 9 9 0 01-2.636 6.364l-1.414-1.414A7 7 0 105 12a7 7 0 0012 6.95l1.414 1.414A9 9 0 1121 12a9 9 0 00-2.636-6.364z"/>
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-700 mb-2">No more profiles!</h3>
//                 <p className="text-gray-500 mb-6">You've reached the end of potential matches. Check back later!</p>
//                 <button 
//                   onClick={resetProfiles} 
//                   className="bg-pink-500 text-white px-8 py-3 rounded-full shadow-lg hover:bg-pink-600 transition-colors font-medium"
//                 >
//                   Reset Swipes
//                 </button>
//               </div>
//             )}
//           </div>
//           {currentIndex < profilesData.length && (
//             <div className="mt-6 flex justify-center gap-8">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => handleSwipe('left')}
//                 className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-gray-100"
//                 aria-label="Dislike"
//                 disabled={isAnimating}
//               >
//                 <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
//                 </svg>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => handleSwipe('right')}
//                 className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 shadow-xl flex items-center justify-center"
//                 aria-label="Like"
//                 disabled={isAnimating}
//               >
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
//                 </svg>
//               </motion.button>
//             </div>
//           )}
//         </div>
//       </main>
//       <BottomNav />
//     </div>
//   );
// };
