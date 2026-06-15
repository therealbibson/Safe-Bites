import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const INACTIVITY_LIMIT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('safebite_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('safebite_user');
    localStorage.removeItem('safebite_last_active');
  }, []);

  const login = (userData) => {
    setUser(userData);
    const now = Date.now();
    localStorage.setItem('safebite_user', JSON.stringify(userData));
    localStorage.setItem('safebite_last_active', now.toString());
  };

  const updateActivity = useCallback(() => {
    if (user) {
      localStorage.setItem('safebite_last_active', Date.now().toString());
    }
  }, [user]);

  // Check for inactivity on mount and whenever user changes
  useEffect(() => {
    const checkInactivity = () => {
      const lastActive = localStorage.getItem('safebite_last_active');
      if (user && lastActive) {
        const inactiveTime = Date.now() - parseInt(lastActive, 10);
        if (inactiveTime > INACTIVITY_LIMIT) {
          logout();
        }
      }
    };

    checkInactivity();

    if (user) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      let lastUpdate = Date.now();
      const throttledUpdate = () => {
        const now = Date.now();
        if (now - lastUpdate > 60000) { 
          updateActivity();
          lastUpdate = now;
        }
      };
      events.forEach(event => window.addEventListener(event, throttledUpdate));
      const intervalId = setInterval(checkInactivity, 3600000);
      return () => {
        events.forEach(event => window.removeEventListener(event, throttledUpdate));
        clearInterval(intervalId);
      };
    }
  }, [user, logout, updateActivity]);

  // Periodically verify user status from backend
  useEffect(() => {
    let intervalId;
    
    const verifyStatus = async () => {
      if (user?._id || user?.id) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id || user.id}`);
          if (response.ok) {
            const latestUser = await response.json();
            // If the role or status has changed, update local state
            if (latestUser.role !== user.role || latestUser.status !== user.status || latestUser.name !== user.name) {
              updateUser(latestUser);
            }
          } else if (response.status === 403) {
            const data = await response.json();
            if (data.error && data.error.includes('suspended')) {
              logout();
              alert('Your account has been suspended. You have been logged out.');
            }
          } else if (response.status === 401) {
            logout();
          }
        } catch (error) {
          console.error('Error verifying user status:', error);
        }
      }
    };

    if (user) {
      // Check every 5 minutes
      intervalId = setInterval(verifyStatus, 5 * 60 * 1000);
      // Also check once on mount if user exists
      verifyStatus();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, logout]);

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('safebite_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
