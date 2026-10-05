import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice";
import attendanceReducer from '../redux/attendanceSlice';
import shiftReducer from "../redux/shiftSlice";
import incidentReducer from "../redux/incidentSlice";
import notificationReducer from "../redux/notificationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        attendance: attendanceReducer,
        shifts: shiftReducer,
        incidents: incidentReducer,
        notifications:notificationReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;