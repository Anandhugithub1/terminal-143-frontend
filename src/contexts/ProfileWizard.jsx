// components/ProfileWizard/WizardContext.jsx
import { createContext, useContext, useState } from 'react';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    age: '',
    socialMediaLinks: [],
    profilePhoto: null,
    interests: [],
    languages: [],
  });

  return (
    <WizardContext.Provider value={{ formData, setFormData }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => useContext(WizardContext);
