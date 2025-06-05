/* ================= features/profiles/thunks.js ================= */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMatchProviders } from './profilesapi';

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async ({ preferences, userType }, thunkAPI) => {
    try {
      const items = await getMatchProviders({ preferences, userType });
      return items;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || 'Unable to fetch profiles.'
      );
    }
  }
);
