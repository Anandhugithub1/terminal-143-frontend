import { useWizard } from '../../contexts/ProfileWizard';

import { useNavigate } from 'react-router-dom';
import { useRef,  } from 'react';

const Step3PhotoUpload = () => {
  const { formData, setFormData } = useWizard();
  const navigate = useNavigate();
  const inputRef = useRef();

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Step 3: Upload Photo</h2>
      <button
        onClick={() => inputRef.current.click()}
        className="w-full bg-gray-100 py-3 rounded-xl mb-3"
      >
        Choose Photo
      </button>
      {formData.profilePhoto && (
        <img
          src={URL.createObjectURL(formData.profilePhoto)}
          alt="Preview"
          className="w-20 h-20 rounded-full object-cover"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <div className="mt-4 flex justify-between">
        <button onClick={() => navigate('/complete/bio')} className="text-pink-500">
          Back
        </button>
        <button
          onClick={() => navigate('/complete/tags')}
          className="bg-pink-500 text-white py-2 px-4 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3PhotoUpload;
