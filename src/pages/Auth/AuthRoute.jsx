import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfiles, resetStatus } from '../../features/Profiles'; // adjust import path
import { Navigate, Outlet } from 'react-router-dom';

export function AuthenticatedRoute() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.profiles);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading profiles...</div>; // or a spinner
  }

  if (status === 'succeeded') {
    // Profiles fetched, allow access to protected route(s)
    return <Outlet />; // renders child routes like /home
  }

  if (status === 'failed') {
    // Fetch failed, redirect to home or login page
    return <Navigate to="/" replace />;
  }

  // Default fallback (e.g. idle or unknown state)
  return <div>Loading...</div>;
}
