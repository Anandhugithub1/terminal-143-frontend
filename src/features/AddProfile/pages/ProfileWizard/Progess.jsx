// Progress.jsx
export const ProgressBar = ({ step, totalSteps }) => {
    const progress = (step / totalSteps) * 100;
  
    return (
      <div className="mb-8">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-right text-sm text-gray-500">
          Step {step} of {totalSteps}
        </div>
      </div>
    );
  };