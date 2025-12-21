/* ========== WizardContext.jsx ========== */
import { createContext, useContext, useState, useEffect } from 'react';
import { get, del } from 'idb-keyval';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
  const STORAGE_KEY = 'profileWizardData';

  /** Default structure for all profile completion steps */
  const defaultFormData = {
    // Step 1: Basic Info
    name: '',
    bio: '',
    age: '',
    socialMediaLinks: [],

    // Step 2: Photos
    profilePhoto: null, // single file (stored in IndexedDB)
    profilePhotos: [], // multiple files (stored in IndexedDB)

    // Step 3: Interests & Languages
    interests: [],
    languages: [],

    // Step 4: Location (matches backend User.location)
  location: {
  coordinates: {
    lat: null,
    lon: null,
  },
  placeName: '',
  countryCode: '',
  h3: {
    r4: '',
  },
},

    // Search radius preference (single value, 1-100)
    searchRadius: {
      distance: 25, // default in km
      unit: 'km',
    },
  };

  /** Load initial state (sessionStorage for non-blocking quick start) */
  const saved = sessionStorage.getItem(STORAGE_KEY);
  const initialData = saved ? { ...defaultFormData, ...JSON.parse(saved) } : defaultFormData;

  const [formData, setFormData] = useState(initialData);

  /** Load image files from IndexedDB asynchronously */
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const [profilePhoto, profilePhotos] = await Promise.all([
          get('profilePhoto'),
          get('profilePhotos'),
        ]);

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

  /** Persist text & non-file fields to sessionStorage */
  useEffect(() => {
    try {
      // exclude file blobs before persisting
      const { profilePhoto, profilePhotos, ...persistedFields } = formData;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistedFields));
    } catch (err) {
      console.error('Failed to persist wizard data:', err);
    }
  }, [formData]);

  /** Clear all saved wizard data (sessionStorage + IndexedDB) */
  const clearFormData = async () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setFormData(defaultFormData);

      await Promise.all([del('profilePhoto'), del('profilePhotos')]);
    } catch (err) {
      console.error('Failed to clear stored wizard data:', err);
    }
  };

  return (
    <WizardContext.Provider value={{ formData, setFormData, clearFormData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => useContext(WizardContext);
