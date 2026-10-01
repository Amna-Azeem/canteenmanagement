import React, { createContext, useContext, useEffect, useState } from 'react';
import { InAppNotification } from '../types';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, subscribeDb } from '../services/db';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshNotifs = () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const all = getNotifications(currentUser.user_id);
    setNotifications(all);
  };

  useEffect(() => {
    refreshNotifs();
    const unsub = subscribeDb(refreshNotifs);
    return unsub;
  }, [currentUser?.user_id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    if (currentUser) {
      markAllNotificationsAsRead(currentUser.user_id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isDrawerOpen,
        setIsDrawerOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return ctx;
}
