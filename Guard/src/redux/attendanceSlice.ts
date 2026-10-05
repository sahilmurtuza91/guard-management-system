import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceRecord {
  id: string;
  dateKey: string;
  date: string;
  shiftName: string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: string;
  status: 'Present' | 'Late' | 'Absent';
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface AttendanceLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
}

export interface AttendanceState {
  isCheckedIn: boolean;
  lastCheckInTimestamp: number | null;
  activeCheckInTime: string | null;
  activeLocation: AttendanceLocation | null;
  todayStatus: 'Present' | 'Late' | 'Absent' | 'Not Marked';
  accumulatedSeconds: number;
  lastActiveDateKey: string | null;
  history: AttendanceRecord[];
  activeShiftId: string | null;
}

export const getTodayDateKey = (): string => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatWorkingHours = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const initialState: AttendanceState = {
  isCheckedIn: false,
  lastCheckInTimestamp: null,
  activeCheckInTime: null,
  activeLocation: null,
  todayStatus: 'Not Marked',
  accumulatedSeconds: 0,
  lastActiveDateKey: null,
  history: [],
  activeShiftId: null,
};

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    checkInDuty: (
      state,
      action: PayloadAction<{
        location?: AttendanceLocation;
        shiftId?: string;
        shiftName?: string;
        status?: 'Present' | 'Late' | 'Absent';
        checkInTimestamp?: number;
        workingSeconds?: number;
      } | undefined>
    ) => {
      const now = new Date();
      const todayKey = getTodayDateKey();

      if (action.payload?.workingSeconds !== undefined) {
        state.accumulatedSeconds = action.payload.workingSeconds;
      }
      state.lastActiveDateKey = todayKey;

      state.isCheckedIn = true;
      state.lastCheckInTimestamp = action.payload?.checkInTimestamp ?? Date.now();

      const location = action.payload?.location ?? null;
      if (location) {
        state.activeLocation = location;
      }

      if (action.payload?.shiftId) {
        state.activeShiftId = action.payload.shiftId;
      }

      const checkInTime = new Date(state.lastCheckInTimestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      state.activeCheckInTime = checkInTime;

      const attendanceStatus = action.payload?.status || (state.todayStatus === 'Not Marked' ? 'Present' : state.todayStatus);
      state.todayStatus = attendanceStatus;

      const formattedDate = `Today, ${now.toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`;

      const todayRecord = state.history.find(
        record => record.dateKey === todayKey
      );

      const workingHours = formatWorkingHours(state.accumulatedSeconds);

      if (todayRecord) {
        todayRecord.checkInTime = checkInTime;
        todayRecord.checkOutTime = '-';
        todayRecord.status = attendanceStatus;
        todayRecord.workingHours = workingHours;
        if (location?.address) todayRecord.locationAddress = location.address;
        if (location?.latitude !== undefined) todayRecord.latitude = location.latitude;
        if (location?.longitude !== undefined) todayRecord.longitude = location.longitude;
      } else {
        state.history.unshift({
          id: `ATT-${Date.now()}`,
          dateKey: todayKey,
          date: formattedDate,
          shiftName: action.payload?.shiftName || 'General Shift',
          checkInTime,
          checkOutTime: '-',
          workingHours,
          status: attendanceStatus,
          locationAddress: location?.address || state.activeLocation?.address,
          latitude: location?.latitude || state.activeLocation?.latitude,
          longitude: location?.longitude || state.activeLocation?.longitude,
        });
      }
    },

    checkOutDuty: (
      state,
      action: PayloadAction<{
        location?: AttendanceLocation;
        workingSeconds?: number;
      } | undefined>
    ) => {
      const checkOutTime = getCurrentTime();
      const location = action.payload?.location;

      if (action.payload?.workingSeconds !== undefined) {
        state.accumulatedSeconds = action.payload.workingSeconds;
      } else if (state.lastCheckInTimestamp) {
        const sessionSeconds = Math.max(
          0,
          Math.floor((Date.now() - state.lastCheckInTimestamp) / 1000)
        );
        state.accumulatedSeconds += sessionSeconds;
      }

      state.isCheckedIn = false;
      state.lastCheckInTimestamp = null;

      const workingHours = formatWorkingHours(state.accumulatedSeconds);
      const todayKey = getTodayDateKey();
      const todayRecord = state.history.find(
        record => record.dateKey === todayKey
      );

      if (todayRecord) {
        todayRecord.checkOutTime = checkOutTime;
        todayRecord.workingHours = workingHours;

        if (location?.address) todayRecord.locationAddress = location.address;

        if (location?.latitude !== undefined) {
          todayRecord.latitude = location.latitude;
        }

        if (location?.longitude !== undefined) {
          todayRecord.longitude = location.longitude;
        }
      }
    },

    setHistory: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.history = action.payload;
    },

    loadAttendance: (
      state,
      action: PayloadAction<{
        isCheckedIn: boolean;
        checkInTimestamp?: number | null;
        workingSeconds: number;
        todayStatus?: 'Present' | 'Late' | 'Absent';
        location?: AttendanceLocation | null;
        shiftId?: string | null;
      }>
    ) => {
      const { isCheckedIn, checkInTimestamp, workingSeconds, todayStatus, location, shiftId } = action.payload;

      state.isCheckedIn = isCheckedIn;
      state.lastCheckInTimestamp = isCheckedIn ? checkInTimestamp ?? Date.now() : null;
      state.accumulatedSeconds = workingSeconds;
      if (todayStatus) state.todayStatus = todayStatus;
      if (location) state.activeLocation = location;
      if (shiftId !== undefined) state.activeShiftId = shiftId;
      state.lastActiveDateKey = getTodayDateKey();

      state.activeCheckInTime = isCheckedIn && checkInTimestamp
        ? new Date(checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : null;
    },

    updateLiveTimerTick: state => {
      if (!state.isCheckedIn || !state.lastCheckInTimestamp) {
        return;
      }

      const currentSessionSeconds = Math.max(
        0,
        Math.floor((Date.now() - state.lastCheckInTimestamp) / 1000)
      );

      const totalWorkedSeconds = state.accumulatedSeconds + currentSessionSeconds;
      const workingHours = formatWorkingHours(totalWorkedSeconds);

      const todayKey = getTodayDateKey();
      const todayRecord = state.history.find(
        record => record.dateKey === todayKey
      );

      if (todayRecord) {
        todayRecord.workingHours = workingHours;
      }
    },
  },
});

export const { checkInDuty, checkOutDuty, updateLiveTimerTick, loadAttendance, setHistory } = attendanceSlice.actions;

export default attendanceSlice.reducer;