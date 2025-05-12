// ==== src/redux/store.js ====
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Auth/slice';
import profileReducer from './Profile/slice';
import userProfileReducer from './User/slice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: profileReducer,
    userprofile: userProfileReducer,
  }
});
