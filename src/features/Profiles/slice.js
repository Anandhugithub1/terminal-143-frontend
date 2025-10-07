// features/profiles/slice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchProfiles } from './thunk';
import { formatLastSeen } from './utlis';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    resetStatus(state) {
      state.status = 'idle';
      state.error = null;
    },
    clearProfiles(state) {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, { payload, meta }) => {
        state.status = 'succeeded';

        // Handle both API and preloaded batches
        let profiles = [];
        let append = false;

        if (payload) {
          // payload can be either { profiles, append } or an array
          if (Array.isArray(payload)) {
            profiles = payload;
          } else {
            profiles = Array.isArray(payload.profiles) ? payload.profiles : [];
            append = !!payload.append;
          }
        }

        // Safety check to avoid undefined.map error
        if (!Array.isArray(profiles)) profiles = [];

        const formatted = profiles.map((raw) => {
          const birth = raw.dob ? new Date(raw.dob) : null;
          const age = birth ? Math.floor((Date.now() - birth.getTime()) / 31557600000) : '';

          const stdStatus = raw.healthStatus?.stdStatus ?? 'Unknown';
          const lastTestedDate = raw.healthStatus?.lastTestedDate
            ? new Date(raw.healthStatus.lastTestedDate).toLocaleDateString()
            : '—';

          return {
            ...raw,
            age,
            lastSeen: formatLastSeen(raw.lastSeen),
            healthStatus: { stdStatus, lastTestedDate },
          };
        });

        // Append new profiles or replace list
        state.list = append ? [...state.list, ...formatted] : formatted;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch profiles';
      });
  },
});

export const { resetStatus, clearProfiles } = profilesSlice.actions;
export default profilesSlice.reducer;
