import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Extract the base URL (remove /api)
const socketURL = URL.replace('/api', '');

export const socket = io(socketURL, {
  autoConnect: true,
  reconnection: true
});
