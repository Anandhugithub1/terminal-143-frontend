import React, { useRef, useState, useEffect } from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import PhotoGrid from '../../components/PhotoGrid';
import { set, get, del } from 'idb-keyval';

const Step3PhotoUpload = () => {
  const { formData, setFormData } = useWizard();
  const userType = localStorage.getItem('userType');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const maxSlots = userType === 'mp' ? 3 : 1;
  const uploadedPhotos = userType === 'mp' ? formData.profilePhotos || [] : [formData.profilePhoto];

  // Load persisted photos from IndexedDB on mount
  useEffect(() => {
    const loadPhotos = async () => {
      if (userType === 'mp') {
        const photos = await get('profilePhotos');
        if (photos?.length) {
          setFormData((prev) => ({ ...prev, profilePhotos: photos }));
        }
      } else {
        const photo = await get('profilePhoto');
        if (photo) {
          setFormData((prev) => ({ ...prev, profilePhoto: photo }));
        }
      }
    };
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const handleSlotChange = (index) => {
  inputRef.current.dataset.replaceIndex = index;
  inputRef.current.click();
};

const handleSlotRemove = async (index) => {
  if (userType === 'mp') {
    const newPhotos = [...(formData.profilePhotos || [])];
    newPhotos.splice(index, 1);
    setFormData(prev => ({ ...prev, profilePhotos: newPhotos }));
    await set('profilePhotos', newPhotos);
  } else {
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    await del('profilePhoto');
  }
};

const handlePhotoUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  await new Promise(res => setTimeout(res, 300));

  const replaceIndex = e.target.dataset.replaceIndex;
  if (userType === 'mp') {
    const existing = formData.profilePhotos || [];
    if (replaceIndex !== undefined) {
      existing[replaceIndex] = file;
    } else if (existing.length < maxSlots) {
      existing.push(file);
    }
    setFormData(prev => ({ ...prev, profilePhotos: existing }));
    await set('profilePhotos', existing);
  } else {
    setFormData(prev => ({ ...prev, profilePhoto: file }));
    await set('profilePhoto', file);
  }

  e.target.value = null;
  delete e.target.dataset.replaceIndex;
  setUploading(false);
};


 

  const handleNext = () => navigate('/complete/tags');
  const handleBack = () => navigate('/complete/bio');

  return (
    <div className="animate-fade-in">
      <ProgressBar step={3} totalSteps={4} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {userType === 'mp' ? 'Show Your Sparkle ✨' : 'Upload Your Photo'}
        </h2>
        <p className="text-gray-500">
          {userType === 'mp'
            ? `Upload at least ${maxSlots} photos to get started`
            : 'Upload photo to get started'}
        </p>
      </div>

   

      <PhotoGrid
  photos={uploadedPhotos}
  maxSlots={maxSlots}
  onSlotChange={handleSlotChange}
  onSlotRemove={handleSlotRemove}
  uploading={uploading}
/>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
                     text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3PhotoUpload;
