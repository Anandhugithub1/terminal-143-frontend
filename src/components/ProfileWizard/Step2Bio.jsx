import { useWizard } from '../../contexts/ProfileWizard';

import { useNavigate } from 'react-router-dom';

const Step2Bio = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Step 2: Bio</h2>
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Short Bio"
        className="w-full p-3 rounded-xl border"
        rows={4}
      />
      <div className="mt-4 flex justify-between">
        <button onClick={() => navigate('/complete/basic')} className="text-pink-500">
          Back
        </button>
        <button
          onClick={() => navigate('/complete/photo')}
          className="bg-pink-500 text-white py-2 px-4 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2Bio;
