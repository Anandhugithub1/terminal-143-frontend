// ==== src/redux/store.js ====
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
// import profileReducer from './Profile/slice';
import { profilesReducer } from '../features/Profiles';

import {userProfileReducer} from '../features/UserProfile';
// import updateProfileReducer from './User/updateSlice';
export const store = configureStore({
  reducer: {
    profiles: profilesReducer,
    userProfile: userProfileReducer,
    // profileUpdate: updateProfileReducer,
    auth:authReducer,
  }
});
