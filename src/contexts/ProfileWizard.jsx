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
    profilePhoto: null,    // single file
    profilePhotos: [],     // multiple files
    interests: [],
    languages: [],
  });

  // Load saved data (both non-file and file data)
  useEffect(() => {
    const loadData = async () => {
      // Load non-file fields from sessionStorage
      const saved = sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};

      // Load file fields from IndexedDB
      const profilePhoto = await get('profilePhoto');
      const profilePhotos = await get('profilePhotos');

      setFormData({
        ...formData,          // ensure default structure
        ...parsed,            // restore non-file fields
        profilePhoto: profilePhoto || null,
        profilePhotos: profilePhotos || [],
      });
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist non-file fields to sessionStorage whenever formData changes
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
