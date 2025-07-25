import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  canUndo: false,
  canRedo: false,
  undoTrigger: 0,
  redoTrigger: 0,
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setHistoryStatus: (state, action) => {
      state.canUndo = action.payload.canUndo;
      state.canRedo = action.payload.canRedo;
    },
    triggerUndo: (state) => {
      state.undoTrigger += 1;
    },
    triggerRedo: (state) => {
      state.redoTrigger += 1;
    },
  },
});

export const { setHistoryStatus, triggerUndo, triggerRedo } = historySlice.actions;
export default historySlice.reducer;