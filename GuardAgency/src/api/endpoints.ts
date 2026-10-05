import apiClient from './client';

export const authApi = {
    login: (identifier: string, password: string) =>
        apiClient.post('/auth/login', { identifier, password }),

    forgotPassword: (identifier: string) => apiClient.post('/auth/forgot-password', { identifier }),

    verifyOtp: (userId: string, otp: string) => apiClient.post('/auth/verify-otp', { userId, otp }),

    resetPassword: (userId: string, otp: string, newPassword: string) =>
        apiClient.post('/auth/reset-password', { userId, otp, newPassword }),

    getMe: () => apiClient.get('/auth/me'),
};

export const agencyApi = {
    getDashboard: () => apiClient.get('/agency/dashboard'),

    getProfile: () => apiClient.get('/agency/profile'),

    updateProfile: (data: Record<string, any> | FormData) => {
        if (data instanceof FormData) {
            return apiClient.put('/agency/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return apiClient.put('/agency/profile', data);
    },

    getTeamMember: () => apiClient.get('/agency/team'),

    addTeamMember: (data: Record<string, any>) => apiClient.post('/agency/team', data),

    getReports: (from?: string, to?: string) => apiClient.get('/agency/reports', { params: { from, to } }),

    getNotifications: () => apiClient.get('/agency/notifications'),

    markNotificationRead: (id: string) => apiClient.patch(`/agency/notifications/${id}/read`),

    markAllNotificationsRead: () => apiClient.patch('/agency/notifications/read-all'),
};


export const requestApi = {
    getRequests: (status?: string) => apiClient.get('/agency/requests', { params: { status } }),

    getRequestDetails: (id: string) => apiClient.get(`/agency/requests/${id}`),

    requestClarification: (id: string, note: string) =>
        apiClient.patch(`/agency/requests/${id}/clarify`, { note }),

    rejectRequest: (id: string, reason: string) =>
        apiClient.patch(`/agency/requests/${id}/reject`, { reason }),

    getEligibleGuards: (id: string) => apiClient.get(`/agency/requests/${id}/eligible-guards`),

    assignGuards: (id: string, guardIds: string[], supervisorName?: string, supervisorPhone?: string) =>
        apiClient.post(`/agency/requests/${id}/assign`, { guardIds, supervisorName, supervisorPhone }),
};


export const guardManagementApi = {
    getGuards: (params?: { search?: string; status?: string; date?: string; startTime?: string; endTime?: string; dutyStatus?: string }) =>
        apiClient.get('/agency/guards', { params }),

    getGuardProfile: (id: string) => apiClient.get(`/agency/guards/${id}`),

    addGuard: (data: Record<string, any> | FormData) =>
        data instanceof FormData
            ? apiClient.post('/agency/guards', data, { headers: { 'Content-Type': 'multipart/form-data' } })
            : apiClient.post('/agency/guards', data),

    updateGuard: (id: string, data: Record<string, any>) => apiClient.put(`/agency/guards/${id}`, data),

    getAvailability: (id: string) => apiClient.get(`/agency/guards/${id}/availability`),

    updateAvailability: (id: string, data: Record<string, any>) =>
        apiClient.put(`/agency/guards/${id}/availability`, data),

    getDocuments: (id: string) => apiClient.get(`/agency/guards/${id}/documents`),

    uploadDocument: (id: string, formData: FormData) =>
        apiClient.post(`/agency/guards/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    verifyDocument: (id: string, docId: string, verified: boolean) =>
        apiClient.patch(`/agency/guards/${id}/documents/${docId}/verify`, { verified }),

    deleteDocument: (id: string, docId: string) =>
        apiClient.delete(`/agency/guards/${id}/documents/${docId}`),

    getAttendance: (id: string) => apiClient.get(`/agency/guards/${id}/attendance`),

    getShiftHistory: (id: string) => apiClient.get(`/agency/guards/${id}/shifts`),
};


export const clientSiteApi = {
    getClients: () => apiClient.get('/agency/clients'),

    getClientDetails: (id: string) => apiClient.get(`/agency/clients/${id}`),

    addClient: (data: Record<string, any>) => apiClient.post('/agency/clients', data),

    updateClient: (id: string, data: Record<string, any>) => apiClient.put(`/agency/clients/${id}`, data),

    getSites: () => apiClient.get('/agency/sites'),

    getSiteDetails: (id: string) => apiClient.get(`/agency/sites/${id}`),

    addSite: (data: Record<string, any>) => apiClient.post('/agency/sites', data),

    updateSite: (id: string, data: Record<string, any>) => apiClient.put(`/agency/sites/${id}`, data),

    updateGeofence: (id: string, data: Record<string, any>) => apiClient.put(`/agency/sites/${id}/geofence`, data),
};


export const operationsApi = {
    getShifts: (params?: { from?: string; to?: string; status?: string }) =>
        apiClient.get('/agency/shifts', { params }),

    getShiftDetails: (id: string) => apiClient.get(`/agency/shifts/${id}`),

    createShift: (data: Record<string, any>) => apiClient.post('/agency/shifts', data),

    updateShift: (id: string, data: Record<string, any>) => apiClient.put(`/agency/shifts/${id}`, data),

    cancelShift: (id: string, reason?: string) => apiClient.patch(`/agency/shifts/${id}/cancel`, { reason }),

    getAttendanceMonitor: (date?: string) => apiClient.get('/agency/attendance', { params: { date } }),

    getLiveGuardsMap: () => apiClient.get('/agency/live-map'),

    getIncidents: (params?: { status?: string; priority?: string }) =>
        apiClient.get('/agency/incidents', { params }),

    getIncidentDetails: (id: string) => apiClient.get(`/agency/incidents/${id}`),

    updateIncident: (id: string, data: { status?: string; comment?: string }) =>
        apiClient.patch(`/agency/incidents/${id}`, data),
};
