import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { createElement } from "react";
import type { AuthUser, UserRole } from "@/lib/types";
import { gql } from "@/lib/utils";
import { AUTH_STORAGE_KEY } from "@/lib/constants";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dni: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
} // Interfaz de contexto de autenticacion

const AuthContext = createContext<AuthContextType | null>(null); // Creacion de contexto de auth

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
`; // Login query para comprobacion de datos

interface LoginData {
  login: AuthUser;
}

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
} // Carga de usuarios almacenados - LocalStorage (provisional)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (dni: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await gql<LoginData>(LOGIN_QUERY, { dni, password });
      const authUser = data.login;
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  }, []); // Comprobacion de login y logica

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []); // Logica de logout

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  ); // Comprobacion de rol

  return createElement(
    AuthContext.Provider,
    { value: { user, isAuthenticated: user !== null, isLoading, login, logout, hasRole } },
    children,
  ); // Creacion de elemento de Auth
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx; // Si no hay context Provider no funciona y devuelve el context provider
}
