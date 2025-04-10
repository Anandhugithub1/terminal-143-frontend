// import { useWizard } from './WizardContext';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { TagSection } from '../Tags'

const predefinedInterests = ['Travel', 'Music', 'Sports', 'Reading', 'Cooking'];
const predefinedLanguages = ['English', 'Spanish', 'French', 'German', 'Hindi'];

const Step4Tags = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();

  const toggle = (opt, listName) => {
    const list = formData[listName];
    const updated = list.includes(opt) ? list.filter(x => x !== opt) : [...list, opt];
    setFormData({ ...formData, [listName]: updated });
  };

  const handleSubmit = () => {
    console.log('Final Payload:', formData);
    // Add backend submission here
    navigate('/dashboard');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Step 4: Tags</h2>
      <TagSection
        label="Interests"
        predefinedOptions={predefinedInterests}
        selectedOptions={formData.interests}
        onToggle={(opt) => toggle(opt, 'interests')}
      />
      <TagSection
        label="Languages"
        predefinedOptions={predefinedLanguages}
        selectedOptions={formData.languages}
        onToggle={(opt) => toggle(opt, 'languages')}
      />
      <div className="mt-4 flex justify-between">
        <button onClick={() => navigate('/complete/photo')} className="text-pink-500">
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-pink-500 text-white py-2 px-4 rounded-xl"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default Step4Tags;
