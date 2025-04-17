import React from 'react'
import { useInView } from "react-intersection-observer";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  


const FeatureCard = ({ title, icon, desc }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      rootMargin: "-50px 0px",
      threshold: 0.1,
    });
  
    const Icon = icon;
  
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={itemVariants}
        className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300"
      >
        <motion.div
          className="w-12 h-12 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-xl flex items-center justify-center mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
      </motion.div>
    );
  };

export default FeatureCard