import { configureStore } from '@reduxjs/toolkit'
import toolReducer from './slices/toolSlice'
import historyReducer from './slices/historySlice'
import uiReducer from './slices/uiSlice' // 1. Yangi slice'ni import qilamiz

export const store = configureStore({
  reducer: {
    tool: toolReducer,
    history: historyReducer,
    ui: uiReducer, // 2. Yangi reducer'ni ro'yxatga qo'shamiz
  },
})