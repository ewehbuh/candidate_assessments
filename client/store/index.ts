import { configureStore } from '@reduxjs/toolkit';
import candidateReducer from './features/candidateSlice';

export const store = configureStore({
  reducer: {
    candidates: candidateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;