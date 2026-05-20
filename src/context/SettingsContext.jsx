import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'SafeBite',
    contactEmail: 'support@safebite.com',
    contactPhone: '+234 800 SAFEBITE',
    currency: '₦',
    deliveryFee: 2.0,
    minimumOrder: 0,
    isOpen: true,
    openingHours: '08:00 AM - 10:00 PM',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    
    // Refresh settings every 5 minutes
    const interval = setInterval(fetchSettings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
