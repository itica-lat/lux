import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { createElement } from "react";
import type { AuthUser, UserRole } from "@/lib/types";
import { gql } from "@/lib/utils";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dni: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOGIN_QUERY = `
  query Login($dni: String!, $password: String!) {
    login(dni: $dni, password: $password) {
      id
      name
      dni
      email
      role
      isActive
      createdAt
      updatedAt
      token
    }
  }
`;

interface LoginData {
  login: AuthUser;
}

const STORAGE_KEY = "lux_auth";

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (dni: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await gql<LoginData>(LOGIN_QUERY, { dni, password });
      const authUser = data.login;
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  return createElement(
    AuthContext.Provider,
    { value: { user, isAuthenticated: user !== null, isLoading, login, logout, hasRole } },
    children,
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
