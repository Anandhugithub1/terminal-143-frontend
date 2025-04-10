// Step3PhotoUpload.jsx
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ProgressBar } from './Progess';

const Step3PhotoUpload = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormData({ ...formData, profilePhoto: file });
      setUploading(false);
    }
  };

  const handleNext = () => navigate('/complete/tags');
  const handleBack = () => navigate('/complete/bio');

  return (
    <div className="animate-fade-in">
      <ProgressBar step={3} totalSteps={4} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Show Your Sparkle ✨</h2>
        <p className="text-gray-500">Upload at least 3 photos to get started</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div 
            key={index}
            className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {index === 0 && formData.profilePhoto && (
              <img
                src={URL.createObjectURL(formData.profilePhoto)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            
            <div className={`absolute inset-0 flex items-center justify-center transition-all ${
              formData.profilePhoto && index === 0 ? 'bg-black/40 opacity-0 group-hover:opacity-100' : ''
            }`}>
              <div className="p-3 bg-white/80 rounded-full">
                {uploading ? (
                  <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3PhotoUpload;