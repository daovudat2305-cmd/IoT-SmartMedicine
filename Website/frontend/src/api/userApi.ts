import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiEndpoints";
import type { ApiResponse, UserInfoResponse } from "../types";

export const userApi = {
  getMyInfo: async (): Promise<ApiResponse<UserInfoResponse>> => {
    const response = await axiosClient.get<ApiResponse<UserInfoResponse>>(
      API_ENDPOINTS.USER.MY_INFO,
    );
    return response.data;
  },
};
