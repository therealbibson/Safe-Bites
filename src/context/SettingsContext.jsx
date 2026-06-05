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

  const fetchSettings = useCallback(async () => {
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
      } else {
        console.warn('Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
    
    // Refresh settings every 30 seconds
    const interval = setInterval(fetchSettings, 30 * 1000);
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
