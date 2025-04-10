// File: src/contexts/ProfileContext.jsx
// eslint-disable-next-line no-unused-vars
import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    profilePhoto: null,
    interests: [],
    languages: []
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ProfileContext.Provider value={{ formData, handleChange }}>
      {children}
    </ProfileContext.Provider>
  );
};