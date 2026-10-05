import apiClient from "./client";

export const authApi = {
    login: (identifier: string, password: string) => {
        return apiClient.post("/auth/login", { identifier, password });
    },

    signup: (data: { name: string; email?: string; phone?: string; password: string; role?: string }) => {
        return apiClient.post('/auth/signup', { ...data, role: 'client' })
    },

    forgotPassword: (identifier: string) => {
        return apiClient.post('/auth/forgot-password', { identifier });
    },

    verifyOtp: (userId: string, otp: string) => {
        return apiClient.post("/auth/verify-otp", { userId, otp });
    },

    resetPassword: (userId: string, otp: string, newPassword: string) => {
        return apiClient.post("/auth/reset-password", { userId, otp, newPassword });
    },

    getMe: () => {
        return apiClient.get("/auth/me");
    },

    changePassword: (currentPassword: string, newPassword: string) => {
        return apiClient.post("/auth/change-password", { currentPassword, newPassword });
    },
};


export const userApi = {
    getDashboard: () => {
        return apiClient.get('/user/dashboard');
    },
    getCategories: () => {
        return apiClient.get('/user/categories');
    },
    getHireOptions: () => {
        return apiClient.get('/user/hire-options');
    },
    getAddresses: () => {
        return apiClient.get('/user/addresses');
    },
    addAddress: (data: Record<string, any>) => {
        return apiClient.post('/user/addresses', data)
    },
    deleteAddress: (addressId: string) => {
        return apiClient.delete(`/user/addresses/${addressId}`)
    },

    getProfile: () => {
        return apiClient.get('/user/profile')
    },
    updateProfile: (data: Record<string, any> | FormData) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        return apiClient.put('/user/profile', data, isFormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : undefined);
    },

    raiseIssue: (data: FormData | { requestId: string; issueType: string; description: string }) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        return apiClient.post('/user/support/issues', data, isFormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : undefined);
    },
    triggerSOS: (data: { requestId?: string; latitude: number; longitude: number }) =>
        apiClient.post('/user/sos', data),

    getNotifications: (unreadOnly = false) => {
        return apiClient.get('/user/notifications', { params: unreadOnly ? { unread: true } : undefined });
    },
    markNotificationRead: (id: string) => {
        return apiClient.patch(`/user/notifications/${id}/read`);
    },
    markAllNotificationsRead: () => {
        return apiClient.patch('/user/notifications/read-all');
    },
}

// for hire a guard
export const requestApi = {
    createRequest: (data: Record<string, any>) => {
        return apiClient.post('/user/requests', data);
    },
    getMyRequests: (status?: string) => {
        return apiClient.get('/user/requests', { params: { status } });
    },
    getRequestDetails: (id: string) => {
        return apiClient.get(`/user/requests/${id}`);
    },
    getRequestTracking: (id: string) => {
        return apiClient.get(`/user/requests/${id}/tracking`);
    },
    modifyRequest: (id: string, data: Record<string, any>) => {
        return apiClient.patch(`/user/requests/${id}/modify`, data);
    },
    cancelRequest: (id: string, reason?: string) => {
        return apiClient.patch(`/user/requests/${id}/cancel`, { reason });
    },
    requestReplacement: (id: string, reason: string) => {
        return apiClient.post(`/user/requests/${id}/replacement`, { reason });
    },
    rateRequest: (id: string, rating: number, review?: string) => {
        return apiClient.post(`/user/requests/${id}/rate`, { rating, review })
    },
};