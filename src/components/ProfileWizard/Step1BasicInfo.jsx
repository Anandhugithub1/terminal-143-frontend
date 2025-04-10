// Step1BasicInfo.jsx
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../shared/common';
import { ProgressBar } from './Progess';

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!formData.name.trim()) return;
    navigate('/complete/bio');
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={1} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome! 👋</h2>
        <p className="text-gray-500">Let's start with the basics</p>
      </div>

      <div className="space-y-6">
        <InputField
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full Name *"
          className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
        />

        <InputField
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          placeholder="Date of Birth"
          className="w-full p-4 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <button
        onClick={handleNext}
        className="mt-8 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg shadow-pink-500/20"
      >
        Continue
      </button>
    </div>
  );
};

export default Step1BasicInfo;
