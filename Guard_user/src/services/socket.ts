import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';

const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
    });

    socket.on('connect', () => console.log('🔌 Socket connected (user app)'));
    socket.on('connect_error', (err) => console.log('Socket connect error:', err.message));

    return socket;
};

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};

export const onNewNotification = (callback: (notification: any) => void) => {
    socket?.on('notification:new', callback);
};

export const removeNewNotificationListener = () => {
    socket?.off('notification:new');
};

export const onGuardLocationUpdate = (callback: (payload: any) => void) => {
    socket?.on('guard:locationUpdate', callback);
};

export const removeGuardLocationListener = () => {
    socket?.off('guard:locationUpdate');
};

export const getSocket = () => socket;
