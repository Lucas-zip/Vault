import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, TOKEN_KEY, userApi } from '../services/api';
import type { LoginResponse } from '../types';

interface AuthState {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    cpfCnpj?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
}

interface PersistedAuth {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function readStoredAuth(): PersistedAuth | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const raw = localStorage.getItem('vault_user');
    if (raw) return JSON.parse(raw) as PersistedAuth;
    return { token, userId: 0, name: '', email: '', role: '' };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<PersistedAuth | null>(() =>
    readStoredAuth()
  );
  const [isLoading, setIsLoading] = useState(false);

  const user: LoginResponse | null = useMemo(() => {
    if (!stored) return null;
    return {
      token: stored.token,
      tokenType: 'Bearer',
      userId: stored.userId,
      name: stored.name,
      email: stored.email,
      role: stored.role,
    };
  }, [stored]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      const persisted: PersistedAuth = {
        token: data.token,
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem('vault_user', JSON.stringify(persisted));
      setStored(persisted);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      cpfCnpj?: string;
      phone?: string;
    }) => {
      setIsLoading(true);
      try {
        await authApi.register(payload);
        await login(payload.email, payload.password);
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('vault_user');
    setStored(null);
  }, []);

  useEffect(() => {
    if (!stored) return;

    let cancelled = false;
    userApi
      .me()
      .catch(() => {
        if (!cancelled) logout();
      });

    return () => {
      cancelled = true;
    };
  }, [stored, logout]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
