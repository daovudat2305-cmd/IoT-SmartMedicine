export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  username: string;
}

export interface UserInfoResponse {
  email: string;
  fullName: string;
  docs: string;
  figma: string;
  github: string;
  apiDocs: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  email: string | null;
  password: string | null;
}
export interface AuthContextType extends AuthState {
  login: (email: string, password: string, username: string) => void;
  logout: () => void;
}
