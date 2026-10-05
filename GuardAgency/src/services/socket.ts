import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';

const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

let socket: Socket | null = null;

export const connectSocket = (token: string, agencyId?: string) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    query: agencyId ? { agencyId } : undefined,
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('Socket connected (agency app)'));
  socket.on('connect_error', (err) => console.log('Socket connect error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const onAgencyEvent = (event: string, callback: (data: any) => void) => {
  socket?.on(event, callback);
};

export const offAgencyEvent = (event: string) => {
  socket?.off(event);
};

export const getSocket = () => socket;
