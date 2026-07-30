import React from 'react'
import { useInView } from "react-intersection-observer";

const FeatureCard = ({ title, icon, desc }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      rootMargin: "-50px 0px",
      threshold: 0.1,
    });

    const Icon = icon;

    return (
      <div
        ref={ref}
        className={`p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div className="w-12 h-12 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-105">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
      </div>
    );
  };

export default FeatureCard