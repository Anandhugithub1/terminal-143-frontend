import { createContext, useContext, useState, useEffect } from 'react';
import { get } from 'idb-keyval';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
  const STORAGE_KEY = 'profileWizardData';
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    age: '',
    socialMediaLinks: [],
    profilePhoto: null,    // File
    profilePhotos: [],     // For multi-photo users
    interests: [],
    languages: [],
  });

  // Load non-file data from sessionStorage and File objects from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const profilePhoto = await get('profilePhoto');
        const profilePhotos = await get('profilePhotos');
        setFormData({
          ...parsed,
          profilePhoto: profilePhoto || null,
          profilePhotos: profilePhotos || [],
        });
      }
    };
    loadData();
  }, []);

  // Persist non-file fields to sessionStorage
  useEffect(() => {
    const { profilePhoto, profilePhotos, ...rest } = formData;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [formData]);

  const clearFormData = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormData({
      name: '',
      bio: '',
      age: '',
      socialMediaLinks: [],
      profilePhoto: null,
      profilePhotos: [],
      interests: [],
      languages: [],
    });
  };

  return (
    <WizardContext.Provider value={{ formData, setFormData, clearFormData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => useContext(WizardContext);
