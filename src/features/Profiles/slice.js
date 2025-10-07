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
  extraReducers: builder => {
    builder
      .addCase(fetchProfiles.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        const { profiles, append } = payload;

        const formatted = profiles.map(raw => {
          const birth = raw.dob ? new Date(raw.dob) : null;
          const age = birth
            ? Math.floor((Date.now() - birth.getTime()) / 31557600000)
            : '';

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

        // ✅ Append or replace cleanly
        state.list = append ? [...state.list, ...formatted] : formatted;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetStatus, clearProfiles } = profilesSlice.actions;
export default profilesSlice.reducer;
