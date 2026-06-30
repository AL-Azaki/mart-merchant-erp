import { useState, useCallback } from "react";
import { User, AuthToken } from "@/core/types";
import { api } from "@/services/api";
import { STORAGE_KEYS } from "@/core/constants";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: Record<string, string>) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ user: User; token: AuthToken }>("/auth/login", credentials);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
