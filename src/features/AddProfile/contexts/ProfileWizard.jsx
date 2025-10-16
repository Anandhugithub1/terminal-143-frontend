import { createContext, useContext, useState, useEffect } from 'react';
import { get, set, del } from 'idb-keyval';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
  const STORAGE_KEY = 'profileWizardData';

  const defaultFormData = {
    name: '',
    bio: '',
    age: '',
    socialMediaLinks: [],
    profilePhoto: null,   // single file
    profilePhotos: [],    // multiple files
    interests: [],
    languages: [],
  };

  const saved = sessionStorage.getItem(STORAGE_KEY);
  const initialData = saved ? JSON.parse(saved) : defaultFormData;

  const [formData, setFormData] = useState(initialData);

  // --- Load photos from IndexedDB asynchronously and create thumbnails ---
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const profilePhoto = await get('profilePhoto');
        const profilePhotos = await get('profilePhotos');

        setFormData((prev) => ({
          ...prev,
          profilePhoto: profilePhoto || prev.profilePhoto,
          profilePhotos: profilePhotos || prev.profilePhotos,
        }));
      } catch (err) {
        console.error('Failed to load photos from IndexedDB:', err);
      }
    };
    loadFiles();
  }, []);

  // --- Persist non-file fields to sessionStorage ---
  useEffect(() => {
    try {
      const { profilePhoto, profilePhotos, ...rest } = formData;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch (err) {
      console.error('Failed to persist wizard data:', err);
    }
  }, [formData]);

  // --- Clear all form data ---
  const clearFormData = async () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormData(defaultFormData);
    try {
      await del('profilePhoto');
      await del('profilePhotos');
    } catch (err) {
      console.error('Failed to clear photos from IndexedDB:', err);
    }
  };

  // --- Remove a single photo ---
  const removePhoto = async (index) => {
    if (!formData.profilePhotos || !formData.profilePhotos[index]) return;

    const newPhotos = [...formData.profilePhotos];
    newPhotos.splice(index, 1);
    setFormData((prev) => ({ ...prev, profilePhotos: newPhotos }));
    await set('profilePhotos', newPhotos);
  };

  // --- Remove single profilePhoto ---
  const removeProfilePhoto = async () => {
    setFormData((prev) => ({ ...prev, profilePhoto: null }));
    await del('profilePhoto');
  };

  return (
    <WizardContext.Provider
      value={{
        formData,
        setFormData,
        clearFormData,
        removePhoto,
        removeProfilePhoto,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => useContext(WizardContext);
