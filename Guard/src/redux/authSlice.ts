import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, updateUserProfile, setToken, logout } = authSlice.actions;
export default authSlice.reducer;