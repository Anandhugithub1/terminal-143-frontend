import { useWizard } from '../../contexts/ProfileWizard';

import { useNavigate } from 'react-router-dom';
import { InputField } from '../../shared/common';

const Step1BasicInfo = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!formData.name.trim()) return;
    navigate('/complete/bio');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Step 1: Basic Info</h2>
      <InputField
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name *"
      />
      <InputField
        type="number"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        placeholder="Age"
        min="18"
        max="100"
      />
      <button
        onClick={handleNext}
        className="mt-4 bg-pink-500 text-white py-2 px-4 rounded-xl"
      >
        Next
      </button>
    </div>
  );
};

export default Step1BasicInfo;
