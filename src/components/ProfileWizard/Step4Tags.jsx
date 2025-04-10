// Step4Tags.jsx
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';

const categories = {
  '🎮 Entertainment': ['Travel', 'Movies', 'Gaming', 'Sports', 'Art', 'Reading'],
  '🎵 Music Genres': ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'EDM', 'Classical'],
  '🍔 Food & Drink': ['Coffee', 'Cocktails', 'BBQ', 'Sushi', 'Wine', 'Dessert']
};

const Step4Tags = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();

  const toggle = (category, value) => {
    const current = formData[category] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [category]: updated });
  };

  const handleSubmit = () => navigate('/dashboard');
  const handleBack = () => navigate('/complete/photo');

  return (
    <div className="animate-fade-in">
      <ProgressBar step={4} totalSteps={4} />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Touch! 🌟</h2>
        <p className="text-gray-500">Select your interests to find better matches</p>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
            <div className="flex flex-wrap gap-3">
              {items.map(item => (
                <button
                  key={item}
                  onClick={() => toggle(title, item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    formData[title]?.includes(item)
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default Step4Tags;