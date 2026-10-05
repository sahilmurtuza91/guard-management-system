import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice';
import hireGuardReducer from '../redux/hireGuardSlice';
import requestReducer from '../redux/requestSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hireGuard: hireGuardReducer,
    requests: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;