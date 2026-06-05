import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const retryCountRef = React.useRef(0);
  const rateLimitResetRef = React.useRef(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) {
      console.log('[NotificationContext] Skip fetch: Not authenticated or user missing');
      return;
    }

    // Skip if rate limited and reset time hasn't passed
    if (Date.now() < rateLimitResetRef.current) {
      console.log('[NotificationContext] Skipping fetch: rate limited, retry after', new Date(rateLimitResetRef.current));
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
        // Reset retry count on success
        retryCountRef.current = 0;
      } else if (response.status === 429) {
        // Rate limited: exponential backoff
        const backoffMs = Math.min(60000, 5000 * Math.pow(2, retryCountRef.current || 0));
        retryCountRef.current += 1;
        rateLimitResetRef.current = Date.now() + backoffMs;
        console.warn(`[NotificationContext] Rate limited (429). Backing off for ${backoffMs}ms`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[NotificationContext] Failed to fetch notifications:', errorData.error || response.status);
      }
    } catch (error) {
      console.error('[NotificationContext] Network error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds (reduced from 30s to avoid rate limits)
    const interval = setInterval(fetchNotifications, 60000);
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
