import { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
    });

    socket.on('new_alert', (alert) => {
      setLastAlert(alert);
      listenersRef.current.forEach((callback) => callback(alert));
    });

    socket.on('breach_update', (data) => {
    });

    socket.on('connect_error', (err) => {
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const subscribe = useCallback((id, callback) => {
    listenersRef.current.set(id, callback);
    return () => listenersRef.current.delete(id);
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ connected, lastAlert, subscribe, emit }}>
      {children}
    </SocketContext.Provider>
  );
}
