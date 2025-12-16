// src/components/RequireProfileIncomplete.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchProfile } from '../features/UserProfile';
import { LoadingSpinner } from './Ui/Spinner';

export default function RequireProfileIncomplete({ children }) {
  const dispatch     = useDispatch();
  const location     = useLocation();
  const { currentUser, status, error } = useSelector((s) => s.userProfile);

  // 1️ Kick off fetching if we haven't yet
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [status, dispatch]);

  // 2️ While loading, show spinner
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'notFound') {
    return children;
  }

  // 3️ If fetch failed,
  if (status === 'failed') {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading your profile: {error}
      </div>
    );
  }

  // 4️ Once succeeded, check the flag
  if (currentUser?.profileCompleted) {
    // Already completed → send them home (or wherever)
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  // 5️ Otherwise render the wizard steps
  return children;
}
