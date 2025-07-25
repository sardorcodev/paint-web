import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeToolId: 'brush',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  lineWidth: 5,
  shapeFillMode: 'outline', // Mumkin bo'lgan qiymatlar: 'outline', 'fill', 'outline_and_fill'
}

export const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    setActiveTool: (state, action) => {
      state.activeToolId = action.payload;
    },
    setForegroundColor: (state, action) => {
      state.foregroundColor = action.payload;
    },
    setBackgroundColor: (state, action) => {
      state.backgroundColor = action.payload;
    },
    setLineWidth: (state, action) => {
      state.lineWidth = action.payload;
    },
    setShapeFillMode: (state, action) => {
      state.shapeFillMode = action.payload;
    },
  },
})

export const { 
    setActiveTool, 
    setForegroundColor, 
    setBackgroundColor, 
    setLineWidth, 
    setShapeFillMode 
} = toolSlice.actions

export default toolSlice.reducer