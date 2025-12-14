import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'meeting' | 'reminder' | 'system';
  time: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('rsdd-notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({ ...n, time: new Date(n.time) }));
    }
    
    // Default notifications
    return [
      {
        id: '1',
        title: 'Welcome to RSDD',
        message: 'Your account has been successfully created',
        type: 'system',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        title: 'System Update',
        message: 'New features are now available',
        type: 'system',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('rsdd-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
