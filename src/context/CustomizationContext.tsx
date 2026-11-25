'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CustomizationContextType {
  customization: any | null;
  loading: boolean;
  refreshCustomization: () => Promise<void>;
}

const CustomizationContext = createContext<CustomizationContextType>({
  customization: null,
  loading: true,
  refreshCustomization: async () => {},
});

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const [customization, setCustomization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomization = async () => {
    try {
      const res = await fetch('/api/customization');
      const data = await res.json();
      if (data.data) {
        setCustomization(data.data);

        // Inject dynamic theme CSS variables
        if (data.data.themeSettings) {
          const t = data.data.themeSettings;
          const root = document.documentElement;
          if (t.primaryColor) root.style.setProperty('--primary-brand', t.primaryColor);
          if (t.accentColor) root.style.setProperty('--accent-gold', t.accentColor);
          if (t.secondaryColor) root.style.setProperty('--secondary-offwhite', t.secondaryColor);
          if (t.borderRadius) root.style.setProperty('--border-radius', t.borderRadius);
        }
      }
    } catch (e) {
      // Quiet fail to graceful default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  return (
    <CustomizationContext.Provider
      value={{
        customization,
        loading,
        refreshCustomization: fetchCustomization,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export const useCustomization = () => useContext(CustomizationContext);
