"use client";

import { createContext, useContext, useEffect } from "react";
import { useTenantStore, TenantData } from "@/store/tenant.store";

interface TenantContextType {
  activeTenant: TenantData;
  availableTenants: TenantData[];
  setTenantBySlug: (slug: string) => void;
  loading: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { 
    activeTenant, 
    availableTenants, 
    setAvailableTenants,
    setActiveTenant,
    setLoading,
    loading, 
    theme, 
    toggleTheme 
  } = useTenantStore();

  useEffect(() => {
    // Initial data setup if empty
    if (availableTenants.length === 0) {
      const initialTenants: TenantData[] = [
        {
          id: "1",
          slug: "tr",
          name: "Greenleaf Türkiye",
          logo: "🇹🇷",
          config: {
            primary_color: "#2D6A4F",
            secondary_color: "#74C69D",
            logo_url: null,
            support_links: {},
            social_media: {},
          },
        },
        {
          id: "2",
          slug: "en",
          name: "Greenleaf Global",
          logo: "🇬🇧",
          config: {
            primary_color: "#1B4332",
            secondary_color: "#40916C",
            logo_url: null,
            support_links: {},
            social_media: {},
          },
        }
      ];
      setAvailableTenants(initialTenants);
      if (!activeTenant) {
        setActiveTenant(initialTenants[0]);
      }
    }
    
    // Ensure dark mode class is present if theme is dark
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply colors
    if (activeTenant) {
      document.documentElement.style.setProperty("--color-primary", activeTenant.config.primary_color);
      document.documentElement.style.setProperty("--color-secondary", activeTenant.config.secondary_color);
    }
  }, [activeTenant, theme]);

  const setTenantBySlug = (slug: string) => {
    const tenant = availableTenants.find(t => t.slug === slug);
    if (tenant) {
      setActiveTenant(tenant);
    }
  };

  return (
    <TenantContext.Provider value={{ 
      activeTenant: activeTenant, 
      availableTenants, 
      setTenantBySlug, 
      loading, 
      theme, 
      toggleTheme 
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within TenantProvider");
  return context;
}
