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

  const [formData, setFormData] = useState(defaultFormData);

  // --- Load saved data safely on mount ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load non-file fields from sessionStorage
        const saved = sessionStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : {};

        // Load file fields from IndexedDB
        const profilePhoto = await get('profilePhoto');
        const profilePhotos = await get('profilePhotos');

        setFormData({
          ...defaultFormData,    // ensure all default keys exist
          ...parsed,             // restore typed/array data
          profilePhoto: profilePhoto || null,
          profilePhotos: profilePhotos || [],
        });
      } catch (err) {
        console.error('Failed to load wizard data:', err);
        setFormData(defaultFormData);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
