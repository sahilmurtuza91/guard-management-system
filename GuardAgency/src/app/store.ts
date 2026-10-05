import { configureStore } from '@reduxjs/toolkit';
import agencyReducer from '../redux/agencySlice';

export const store = configureStore({
  reducer: {
    agency: agencyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;