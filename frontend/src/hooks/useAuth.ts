import { useAuthStore } from "@/store/auth.store";
import apiClient from "@/lib/api-client";
import { useRouter } from "@/i18n/navigation";

export function useAuth() {
  const { user, access_token, refresh_token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const logout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get("/auth/verify-global");
      if (res.data) {
        setAuth(res.data, access_token!, refresh_token!);
      }
    } catch (error) {
      console.error("User refresh failed", error);
    }
  };

  return {
    user,
    isAuthenticated: !!access_token,
    refreshUser,
    logout,
  };
}
