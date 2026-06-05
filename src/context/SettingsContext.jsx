import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    storeName: 'SafeBite',
    contactEmail: 'support@safebite.com',
    contactPhone: '+234 800 SAFEBITE',
    currency: '₦',
    deliveryFee: 2.0,
    minimumOrderQuantity: 1,
    minimumOrderPrice: 0,
    isOpen: true,
    openingHours: '08:00 AM - 10:00 PM',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = React.useRef(0);
  const [rateLimitReset, setRateLimitReset] = React.useRef(Date.now() + 60000);

  const fetchSettings = useCallback(async () => {
    // Skip if rate limited and reset time hasn't passed
    if (Date.now() < retryCount.current) {
      console.log('[SettingsContext] Skipping fetch: rate limited, retry after', new Date(retryCount.current));
      return;
    }

    try {
      const headers = {};
      if (user?.id || user?._id) {
        headers['x-user-id'] = user.id || user._id;
        headers['x-user-role'] = user.role;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings?t=${Date.now()}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        // Reset retry count on success
        retryCount.current = 0;
      } else if (response.status === 429) {
        // Rate limited: exponential backoff
        const backoffMs = Math.min(60000, 5000 * Math.pow(2, retryCount.current || 0));
        retryCount.current = Date.now() + backoffMs;
        console.warn(`[SettingsContext] Rate limited (429). Backing off for ${backoffMs}ms`);
      } else {
        console.warn('[SettingsContext] Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('[SettingsContext] Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
    
    // Refresh settings every 60 seconds (reduced polling to avoid rate limits)
    const interval = setInterval(fetchSettings, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
