import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  useCallback,
} from "react";
import { AUTH_STORAGE_KEYS } from "../api/axiosClient";
import type { AuthContextType, AuthState } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

//component provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const email = sessionStorage.getItem(AUTH_STORAGE_KEYS.EMAIL);
    const password = sessionStorage.getItem(AUTH_STORAGE_KEYS.PASSWORD);
    const username = sessionStorage.getItem(AUTH_STORAGE_KEYS.USERNAME);

    const isAuthenticated = Boolean(email && password);

    return {
      isAuthenticated,
      email,
      password,
      username,
    };
  });

  // Action: Đăng nhập thành công -> lưu sessionStorage & cập nhật React state
  const login = useCallback(
    (email: string, password: string, username: string) => {
      sessionStorage.setItem(AUTH_STORAGE_KEYS.EMAIL, email);
      sessionStorage.setItem(AUTH_STORAGE_KEYS.PASSWORD, password);
      sessionStorage.setItem(AUTH_STORAGE_KEYS.USERNAME, username);

      setAuthState({
        isAuthenticated: true,
        email,
        password,
        username,
      });
    },
    [],
  );

  // Action: Đăng xuất -> xóa sessionStorage & reset React state
  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.PASSWORD);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.USERNAME);
    setAuthState({
      isAuthenticated: false,
      email: null,
      password: null,
      username: null,
    });
  }, []);

  //tối ưu render với useMemo
  const value = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      logout,
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

//Custom Hook useAuth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
