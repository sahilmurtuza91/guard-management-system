import apiClient from './client';

// this is for the authentication related Api calls
export const authApi = {
    login: (identifier: string, password: string) => {
        return apiClient.post('/auth/login', { identifier, password, role: 'guard' });
    },

    forgotPassword: (identifier: string) => {
        return apiClient.post('/auth/forgot-password', { identifier });
    },

    verifyOtp: (userId: string, otp: string) => {
        return apiClient.post('/auth/verify-otp', { userId, otp });
    },

    resetPassword: (userId: string, otp: string, newPassword: string) => {
        return apiClient.post('/auth/reset-password', { userId, otp, newPassword });
    },

    getMe: () => {
        return apiClient.get('/auth/me');
    },

    changePassword: (currentPassword: string, newPassword: string) => {
        return apiClient.post('/auth/change-password', { currentPassword, newPassword });
    },
};

// Guard App API Services
export const guardApi = {
    getDashboard: () => {
        return apiClient.get('/guard/dashboard');
    },

    getShifts: (status?: string) => {
        return apiClient.get('/guard/shifts', {
            params: { status },
        });
    },

    getShiftDetails: (shiftId: string) => {
        return apiClient.get(`/guard/shifts/${shiftId}`);
    },

    checkIn: (data: { shiftId: string; latitude: number; longitude: number; address?: string }) => {
        return apiClient.post('/guard/attendance/check-in', data);
    },

    checkOut: (data: { shiftId: string; latitude: number; longitude: number; address?: string }) => {
        return apiClient.post('/guard/attendance/check-out', data);
    },

    locationPing: (data: { shiftId: string; latitude: number; longitude: number; address?: string }) => {
        return apiClient.post('/guard/attendance/location-ping', data);
    },

    getAttendanceHistory: (month?: string) => {
        return apiClient.get('/guard/attendance', { params: { month } });
    },

    getIncidents: () => {
        return apiClient.get('/guard/incidents');
    },

    getIncidentDetails: (incidentId: string) => {
        return apiClient.get(`/guard/incidents/${incidentId}`);
    },

    createIncident: (data: FormData) => {
        return apiClient.post('/guard/incidents', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getProfile: () => {
        return apiClient.get('/guard/profile');
    },

    updateProfile: (data: any) => {
        if (data instanceof FormData) {
            return apiClient.put('/guard/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return apiClient.put('/guard/profile', data);
    },

    getNotifications: (unreadOnly = false) => {
        return apiClient.get('/guard/notifications', { params: unreadOnly ? { unread: true } : undefined });
    },

    markNotificationRead: (id: string) => {
        return apiClient.patch(`/guard/notifications/${id}/read`);
    },

    markAllNotificationsRead: () => {
        return apiClient.patch('/guard/notifications/read-all');
    },
};