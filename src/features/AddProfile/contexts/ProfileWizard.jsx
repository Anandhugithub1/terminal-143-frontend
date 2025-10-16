/* ========== WizardContext.jsx ========== */
import { createContext, useContext, useState, useEffect } from 'react';
import { get, del } from 'idb-keyval';

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

  // --- Initialize state from sessionStorage synchronously ---
  const saved = sessionStorage.getItem(STORAGE_KEY);
  const initialData = saved ? JSON.parse(saved) : defaultFormData;

  const [formData, setFormData] = useState(initialData);

  // --- Load photos from IndexedDB asynchronously and merge into formData ---
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const profilePhoto = await get('profilePhoto');
        const profilePhotos = await get('profilePhotos');

        setFormData((prev) => ({
          ...prev,                      // keep typed/sessionStorage data
          profilePhoto: profilePhoto || prev.profilePhoto,
          profilePhotos: profilePhotos || prev.profilePhotos,
        }));
      } catch (err) {
        console.error('Failed to load photos from IndexedDB:', err);
      }
    };
    loadFiles();
  }, []);

  // --- Persist non-file fields to sessionStorage whenever formData changes ---
  useEffect(() => {
    try {
      const { profilePhoto, profilePhotos, ...rest } = formData;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch (err) {
      console.error('Failed to persist wizard data:', err);
    }
  }, [formData]);

  // --- Clear all form data (sessionStorage + IndexedDB) ---
  const clearFormData = async () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormData(defaultFormData);

    try {
      await del('profilePhoto');
      await del('profilePhotos');
    } catch (err) {
      console.error('Failed to clear photo data from IndexedDB:', err);
    }
  };

  return (
    <WizardContext.Provider value={{ formData, setFormData, clearFormData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => useContext(WizardContext);
