import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Clarification Required'
  | 'Accepted'
  | 'Guard Assigned'
  | 'Active'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface GuardRequestItem {
  id: string;
  serviceType: string;
  purpose: string;
  shiftType: string;
  duration: string;
  date: string;
  timeSlot: string;
  guardsCount: number;
  status: RequestStatus;
  location: string;
  assignedGuard?: {
    id: string;
    name: string;
    rating?: number;
    phone: string;
    photo: string;
    experienceYears: number;
    idProofVerified: boolean;
  };
}

interface RequestState {
  requests: GuardRequestItem[];
}

const initialState: RequestState = {
  requests: [],
};

export const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    addNewRequest: (state, action: PayloadAction<GuardRequestItem>) => {
      state.requests.unshift(action.payload);
    },
    cancelRequest: (state, action: PayloadAction<string>) => {
      const item = state.requests.find(r => r.id === action.payload);
      if (item) {
        item.status = 'Cancelled';
      }
    },
    setRequests: (state, action: PayloadAction<GuardRequestItem[]>) => {
      state.requests = action.payload;
    },
  },
});

export const { addNewRequest, cancelRequest, setRequests } = requestSlice.actions;
export default requestSlice.reducer;