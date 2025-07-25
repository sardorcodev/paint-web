import { configureStore } from '@reduxjs/toolkit'
import toolReducer from './slices/toolSlice'
import historyReducer from './slices/historySlice'

export const store = configureStore({
  reducer: {
    tool: toolReducer,
    history: historyReducer,
  },
})