import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) {
      console.log('[NotificationContext] Skip fetch: Not authenticated or user missing');
      return;
    }
    
    setLoading(true);
    try {
      const uId = user.id || user._id;
      console.log(`[NotificationContext] Fetching notifications for user: ${uId}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
        headers: {
          'x-user-id': uId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[NotificationContext] Received ${data.length} notifications`);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } else {
        const errorData = await response.json();
        console.error('[NotificationContext] Failed to fetch notifications:', errorData.error);
      }
    } catch (error) {
      console.error('[NotificationContext] Network error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user?.id || user?._id
        }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user?.id || user?._id
        }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
