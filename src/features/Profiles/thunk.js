/* ================= features/profiles/thunk.js ================= */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMatchProviders } from './api';

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  /**
   * payloadCreator now just takes { limit }
   * and returns the array with suggestionIndex included.
   */
  async ({ limit = 10 }, thunkAPI) => {
    try {
      const profiles = await getMatchProviders({ limit });
      return profiles;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
