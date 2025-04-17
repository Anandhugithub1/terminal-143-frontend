import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';

const languages = ['English', 'Spanish',  'French', 'German', 'Mandarin'];
const statusOptions = ['Postive', 'Negative', 'Prefer not to say', ];

const Step2Bio = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const charLimit = 500;

  const handleNext = () => navigate('/complete/photo');
  const handleBack = () => navigate('/complete/basic');

  const toggleLanguage = (lang) => {
    const updated = formData.languagesKnown?.includes(lang)
      ? formData.languagesKnown.filter(l => l !== lang)
      : [...(formData.languagesKnown || []), lang];
    setFormData({ ...formData, languagesKnown: updated });
  };

  return (
    <div className="animate-fade-in">
      <ProgressBar step={2} totalSteps={4} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Story 💬</h2>
        <p className="text-gray-500">What makes you unique?</p>
      </div>

      {/* Bio Field */}
      <div className="relative mb-8">
        <textarea
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, charLimit) })}
          placeholder="I'm passionate about..."
          className="w-full p-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none min-h-[160px]"
          rows={4}
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-400">
          {formData.bio?.length || 0}/{charLimit}
        </div>
      </div>

      {/* Languages Known */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Languages You Know 🌐</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm ${
                formData.languagesKnown?.includes(lang)
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">STD Status 🧬</h3>
        <select
          value={formData.stdStatus || ''}
          onChange={(e) => setFormData({ ...formData, stdStatus: e.target.value })}
          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300"
        >
          <option value="" disabled>Select your STD status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Navigation */}
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

export default Step2Bio;
