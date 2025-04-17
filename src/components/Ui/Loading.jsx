const Loading = ({ size = 16, className = '' }) => {
  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <div className={`relative w-${size} h-${size}`}>
        {/* Gradient Background */}
        <div className="absolute w-full h-full rounded-full animate-spin
                      bg-gradient-to-r from-[var(--color-gradient-primary)] 
                      to-[var(--color-gradient-secondary)] 
                      blur-[2px]"></div>
        
        {/* Front Spinner Element */}
        <div className="absolute w-full h-full rounded-full animate-spin
                      border-4 border-transparent border-t-[var(--color-primary)]
                      border-l-[var(--color-primary)]"></div>
        
        {/* Inner Circle */}
        <div className="absolute inset-1.5 bg-[var(--color-input)] rounded-full"></div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1.2s cubic-bezier(0.5, 0.2, 0.5, 0.8) infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;