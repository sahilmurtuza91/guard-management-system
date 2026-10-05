import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AgencyUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'agency_admin' | 'operations_manager' | 'supervisor';
  agency?: string;
  avatarUrl?: string;
}

interface AgencyState {
  isAuthenticated: boolean;
  token: string | null;
  user: AgencyUser | null;
  agencyName: string;
  agencyLogoUrl: string; 
}

const initialState: AgencyState = {
  isAuthenticated: false,
  token: null,
  user: null,
  agencyName: '',
  agencyLogoUrl: '',
};

export const agencySlice = createSlice({
  name: 'agency',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: AgencyUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },

    setAgencyDetails: (state, action: PayloadAction<{ agencyName: string; agencyLogoUrl?: string }>) => {
      state.agencyName = action.payload.agencyName;
      if (action.payload.agencyLogoUrl !== undefined) {
        state.agencyLogoUrl = action.payload.agencyLogoUrl;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.agencyName = '';
      state.agencyLogoUrl = '';
    },
  },
});

export const { setCredentials, setAgencyDetails, logout } = agencySlice.actions;
export default agencySlice.reducer;
