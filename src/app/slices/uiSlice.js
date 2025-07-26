import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cursorPos: { x: null, y: null },
  canvasSize: { width: 0, height: 0 },
  saveTrigger: 0, // 1. Saqlash uchun yangi trigger
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCursorPos: (state, action) => {
      state.cursorPos = action.payload;
    },
    setCanvasSize: (state, action) => {
      state.canvasSize = action.payload;
    },
    // 2. Saqlash triggerini ishga tushiruvchi yangi reducer
    triggerSave: (state) => {
      state.saveTrigger += 1;
    },
  },
})

// 3. Yangi action'ni export qilamiz
export const { setCursorPos, setCanvasSize, triggerSave } = uiSlice.actions;

export default uiSlice.reducer;