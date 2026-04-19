import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: "SUPERADMIN" | "ADMIN" | "EDITOR" | "PARTNER" | "GUEST";
  partner_id: string | null;
  profile_image_path: string | null;
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  setAuth: (user: User, access_token: string, refresh_token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      setAuth: (user, access_token, refresh_token) =>
        set({ user, access_token, refresh_token }),
      clearAuth: () =>
        set({ user: null, access_token: null, refresh_token: null }),
      isAuthenticated: () => !!get().access_token,
    }),
    {
      name: "greenleaf-auth",
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
      }),
    }
  )
);
