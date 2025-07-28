// import React, { memo } from 'react';
// import { motion } from 'framer-motion';

// const AnimatedCard = memo(({ idx, direction, children }) => (
//   <motion.div
//     key={idx}
//     initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
//     animate={{ x: 0, opacity: 1 }}
//     exit={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
//     transition={{ duration: 0.35 }}
//     style={{ willChange: 'transform, opacity' }}
//     className="relative"
//   >
//     {children}
//   </motion.div>
// ));

// export default AnimatedCard;
