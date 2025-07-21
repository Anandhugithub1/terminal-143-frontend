// src/routes/ProtectedRouteFM.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRouteFM({ children }) {
  const userType = localStorage.getItem('userType');

  if (userType !== 'fm') {
    return <Navigate to="/requests" replace />;
  }

  return children;
}
