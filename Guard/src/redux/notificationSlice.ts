import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  _id?: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'Duty' | 'Incidents' | 'General';
  targetScreen?: string;
  targetParams?: any;
}

interface NotificationState {
  notifications: NotificationItem[];
}

const initialState: NotificationState = {
  notifications: [],
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (SingleNotification) => SingleNotification.id === action.payload || SingleNotification._id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload && notification._id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.notifications.unshift(action.payload);
    },
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.notifications = action.payload;
    },
  },
});

export const {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  addNotification,
  setNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;