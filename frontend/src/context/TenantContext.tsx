"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface TenantConfig {
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  support_links: Record<string, string>;
  social_media: Record<string, string>;
}

interface TenantData {
  id: string;
  slug: string;
  name: string;
  logo: string;
  config: TenantConfig;
}

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
  const [availableTenants] = useState<TenantData[]>([
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
  ]);

  const [activeTenant, setActiveTenant] = useState<TenantData>(availableTenants[0]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const setTenantBySlug = (slug: string) => {
    const tenant = availableTenants.find(t => t.slug === slug);
    if (tenant) {
      setActiveTenant(tenant);
      updateThemeColors(tenant);
    }
  };

  const updateThemeColors = (tenant: TenantData) => {
    document.documentElement.style.setProperty("--color-primary", tenant.config.primary_color);
    document.documentElement.style.setProperty("--color-secondary", tenant.config.secondary_color);
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === "light" ? "dark" : "light";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newTheme;
    });
  };

  useEffect(() => {
    updateThemeColors(activeTenant);
    // Ensure dark mode by default if theme is dark
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <TenantContext.Provider value={{ 
      activeTenant, 
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
