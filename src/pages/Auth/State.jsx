import React, { createContext, useContext, useState, } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage on mount
  const [authState, setAuthState] = useState(() => ({
    accessToken: localStorage.getItem('accessToken') || null,

    userType: localStorage.getItem('userType') || null,
  }));

  // Optionally, if the user might update localStorage from another tab, you can set up
  // an effect to sync state (or use storage events).

  const login = (token, userType) => {
    // Store values in localStorage for persistence
    localStorage.setItem('accessToken', token);

    localStorage.setItem('userType', userType);

    setAuthState({
      accessToken: token,
      userType: userType,
      
    });
  };

  const logout = () => {
    // Clean up the stored values if logging out
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');

    setAuthState({
      accessToken: null,
      userType: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: authState.accessToken,
        userType: authState.userType,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
