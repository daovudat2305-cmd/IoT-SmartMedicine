import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiEndpoints";
import type { ApiResponse, LoginRequest, LoginResponse } from "../types";

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
    );
    return response.data;
  },
};
