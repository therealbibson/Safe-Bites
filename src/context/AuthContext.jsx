import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const INACTIVITY_LIMIT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('safebite_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      settings,
      settingsLoading,
      refreshSettings: fetchSettings
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
