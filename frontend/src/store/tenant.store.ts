import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TenantConfig {
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  support_links: Record<string, string>;
  social_media: Record<string, string>;
}

export interface TenantData {
  id: string;
  slug: string;
  name: string;
  logo: string;
  config: TenantConfig;
}

interface TenantState {
  activeTenant: TenantData;
  availableTenants: TenantData[];
  loading: boolean;
  theme: "light" | "dark";
  setActiveTenant: (tenant: TenantData) => void;
  setAvailableTenants: (tenants: TenantData[]) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  getTenantSlug: () => string;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      activeTenant: {
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
      availableTenants: [],
      loading: false,
      theme: "dark",
      setActiveTenant: (tenant) => {
        set({ activeTenant: tenant });
        // Update CSS variables globally
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty("--color-primary", tenant.config.primary_color);
          document.documentElement.style.setProperty("--color-secondary", tenant.config.secondary_color);
        }
      },
      setAvailableTenants: (tenants) => set({ availableTenants: tenants }),
      setLoading: (loading) => set({ loading }),
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          if (typeof document !== 'undefined') {
            if (newTheme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          return { theme: newTheme };
        });
      },
      getTenantSlug: () => get().activeTenant?.slug || "tr",
    }),
    {
      name: "greenleaf-tenant",
      partialize: (state) => ({
        activeTenant: state.activeTenant,
        theme: state.theme,
      }),
    }
  )
);
