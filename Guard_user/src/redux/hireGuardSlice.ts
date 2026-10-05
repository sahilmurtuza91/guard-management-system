import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HireDraft {
  categoryId?: string;
  categoryName?: string;
  serviceType?: string;
  purpose?: string;
  shiftType?: 'Single Shift' | 'Multiple Shift';
  durationHours?: number;
  briefRequirement?: string;
  bookingType?: 'Single Day' | 'Long Term / Monthly';
  selectedDate?: string;
  selectedDateISO?: string;
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
  customDuration?: string;
  numberOfGuards?: number;
  genderPreference?: 'Any' | 'Male' | 'Female';
  experienceLevel?: 'Any' | '1-3 Years' | '3+ Years';
  specialRequirements?: string;
  addressId?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactNumber?: string;
  landmark?: string;
  additionalInstructions?: string;
}

interface HireGuardState {
  draft: HireDraft;
}

const initialState: HireGuardState = {
  draft:{},
};

export const hireGuardSlice = createSlice({
  name: 'hireGuard',
  initialState,
  reducers: {
    updateHireDraft: (state, action: PayloadAction<Partial<HireDraft>>) => {
      state.draft = { ...state.draft, ...action.payload };
    },
    clearHireDraft: (state) => {
      state.draft = {};
    },
  },
});

export const { updateHireDraft, clearHireDraft } = hireGuardSlice.actions;
export default hireGuardSlice.reducer;