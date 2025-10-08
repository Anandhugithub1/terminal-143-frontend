// components/ProfileWizard/WizardContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
  const STORAGE_KEY = 'profileWizardData';

  // Load from sessionStorage on init
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          name: '',
          bio: '',
          age: '',
          socialMediaLinks: [],
          profilePhoto: null,
          interests: [],
          languages: [],
        };
  });

  // Persist changes automatically
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Helper to reset after submission
  const clearFormData = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormData({
      name: '',
      bio: '',
      age: '',
      socialMediaLinks: [],
      profilePhoto: null,
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
