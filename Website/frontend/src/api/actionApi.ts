import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiEndpoints";
import type {
  ApiResponse,
  PageResponse,
  ActionHistoryResponse,
  GetActionHistoryParams,
} from "../types";

export const actionApi = {
  getActionHistory: async (
    params?: GetActionHistoryParams,
  ): Promise<ApiResponse<PageResponse<ActionHistoryResponse>>> => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<ActionHistoryResponse>>
    >(API_ENDPOINTS.ACTION.HISTORY, { params });
    return response.data;
  },
};
