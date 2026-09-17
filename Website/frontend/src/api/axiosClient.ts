import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export const AUTH_STORAGE_KEYS = {
  EMAIL: "auth_email",
  PASSWORD: "auth_password",
  USERNAME: "auth_username",
} as const;

// Helper mã hóa Base64 an toàn UTF-8
const safeBase64Encode = (str: string): string => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

const axiosClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

//thêm Request Interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    //đọc thông tin từ sessionStorage
    const email = sessionStorage.getItem(AUTH_STORAGE_KEYS.EMAIL);
    const password = sessionStorage.getItem(AUTH_STORAGE_KEYS.PASSWORD);

    if (email && password) {
      //encode base64
      const token = safeBase64Encode(`${email}:${password}`);
      config.headers.Authorization = `Basic ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

//thêm Response Interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa thông tin đăng nhập
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.PASSWORD);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.USERNAME);

      const isLoginRequest = error.config?.url?.includes("/api/auth/login");
      const isCurrentlyOnLoginPage = window.location.pathname === "/login";
      if (!isLoginRequest && !isCurrentlyOnLoginPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
