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
