import axios from 'axios';
import { storage } from '../utils/storage';

export const API_BASE_URL = 'http://192.168.0.252:5000/api';
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('file:') ||
    path.startsWith('content:') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  return `${SERVER_ORIGIN}${path}`;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export const registerUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await storage.clear();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
