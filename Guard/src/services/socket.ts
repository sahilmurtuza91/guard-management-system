import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';
import { NotificationItem } from '../redux/notificationSlice';

const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
    });

    socket.on('connect', () => console.log('Socket connected (guard app)'));
    socket.on('connect_error', (error) => console.log('Socket connect error: ', error.message));

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
export const emitGuardLocation = (payload: {
    guardProfileId: string;
    agencyId?: string;
    clientId?: string | null;
    latitude: number;
    longitude: number;
}) => {
    socket?.emit('guard:locationUpdate', payload);
};

export const getSocket = () => socket;
