/* ================= features/profiles/slice.js ================= */
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
      state.error  = null;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fetchProfiles.pending, state => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        // payload is [ { …raw profile–with suggestionIndex }, … ]
        state.list = payload.map(raw => {
          const birth = new Date(raw.dob);
          const age   = Math.floor(
            (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );

          const std      = raw.healthStatus?.stdStatus ?? 'Unknown';
          const lastDate = raw.healthStatus?.lastTestedDate
            ? new Date(raw.healthStatus.lastTestedDate).toLocaleDateString()
            : 'Unknown';

          return {
            ...raw,
            age,
            lastSeen: formatLastSeen(raw.lastSeen),
            lastTestedDate: lastDate,
            stdStatus: std,
            healthStatus: { status: std, lastTestedDate: lastDate },
            // suggestionIndex comes straight through
          };
        });
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      }),
});

export const { resetStatus } = profilesSlice.actions;
export default profilesSlice.reducer;
