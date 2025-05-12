// AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage on mount
  const [authState, setAuthState] = useState(() => ({
    accessToken: localStorage.getItem('accessToken') || null,
    idToken:localStorage.getItem('idToken') || null,
    userType: localStorage.getItem('userType') || null,
    // Load stored preferences or default to an empty array
    preferences: JSON.parse(localStorage.getItem('preferences') || '[]'),
    username:localStorage.getItem('username'),
  }));

  const login = (id,token, userType,username, preferences = [],) => {
    // Store values in localStorage for persistence
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem('idToken', id);
    // Save preferences as a JSON string
    localStorage.setItem('preferences', JSON.stringify(preferences));
    localStorage.setItem('username', username);

    setAuthState({
      accessToken: token,
      userType,
      idToken:id,
      username,
      preferences,


    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('preferences');
localStorage.removeItem('idToken');
localStorage.removeItem('username')
    setAuthState({
      
      accessToken: null,
      userType: null,
      idToken:null,
      preferences: [],
      username:null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: authState.accessToken,
        userType: authState.userType,
        preferences: authState.preferences,
        idToken:authState.idToken,
        username:authState.username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
