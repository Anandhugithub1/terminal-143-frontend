// ==== src/redux/store.js ====
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/authSlice';
import profileReducer from './Slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer
  }
});
