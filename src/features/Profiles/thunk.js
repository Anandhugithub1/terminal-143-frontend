/* ================= features/profiles/thunk.js ================= */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMatchProviders } from './profilesapi';

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async ({ limit = 10 }, thunkAPI) => {
    try {
      const profiles = await getMatchProviders({ limit });
      return profiles;
    } catch (err) {
      const status = err.response?.status;

      // if (status === 401 || status === 403) {
      //   window.location.href = '/login';
      //   return thunkAPI.rejectWithValue('Unauthorized');
      // }

      return thunkAPI.rejectWithValue(
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || err.message || 'Something went wrong'
      );
    }
  }
);
