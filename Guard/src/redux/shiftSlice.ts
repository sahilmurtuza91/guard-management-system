import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Shift {
  id: string;
  _id?: string;
  date: string;
  timeRange: string;
  duration: string;
  locationName: string;
  locationAddress: string;
  shiftType: string;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  reportingTime: string;
  breakTime: string;
  supervisorName: string;
  supervisorPhone: string;
}

interface ShiftState {
  shifts: Shift[];
  activeShiftId: string;
}

const initialState: ShiftState = {
  activeShiftId: '',
  shifts: [],
};

export const shiftSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {
    updateShiftStatus: (
      state,
      action: PayloadAction<{ id: string; status: Shift['status'] }>
    ) => {
      const shift = state.shifts.find(
        (updateShift) => updateShift.id === action.payload.id || updateShift._id === action.payload.id
      );
      if (shift) {
        shift.status = action.payload.status;
      }
    },
    setActiveShift: (state, action: PayloadAction<string>) => {
      state.activeShiftId = action.payload;
    },
    setShifts: (state, action: PayloadAction<Shift[]>) => {
      state.shifts = action.payload;
    },
  },
});

export const { updateShiftStatus, setActiveShift, setShifts } = shiftSlice.actions;
export default shiftSlice.reducer;