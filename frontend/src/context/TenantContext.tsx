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
  slug: string;
  name: string;
  config: TenantConfig;
}

interface TenantContextType {
  tenant: TenantData | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, we'd fetch based on subdomain or slug
    // For now, using a mock fetch or current tenant endpoint
    const fetchTenant = async () => {
      try {
        // Mocking the backend response until Task 3 is implemented
        const mockData: TenantData = {
          slug: "tr",
          name: "Greenleaf Türkiye",
          config: {
            primary_color: "#2D6A4F",
            secondary_color: "#74C69D",
            logo_url: null,
            support_links: {},
            social_media: {},
          },
        };

        setTenant(mockData);

        // Set CSS variables
        document.documentElement.style.setProperty(
          "--color-primary",
          mockData.config.primary_color
        );
        document.documentElement.style.setProperty(
          "--color-secondary",
          mockData.config.secondary_color
        );
      } catch (error) {
        console.error("Failed to fetch tenant config", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within TenantProvider");
  return context;
}
