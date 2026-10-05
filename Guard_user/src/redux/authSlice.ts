import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: ClientUser | null;
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
    setClientLogin: (state, action: PayloadAction<{ user: ClientUser; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateClientProfile: (state, action: PayloadAction<Partial<ClientUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clientLogout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
});

export const { setClientLogin, updateClientProfile, clientLogout } = authSlice.actions;
export default authSlice.reducer;