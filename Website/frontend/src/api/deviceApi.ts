import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiEndpoints";
import type {
  ApiResponse,
  DeviceResponse,
  DeviceControlRequest,
  DeviceControlResponse,
} from "../types";

export const deviceApi = {
  getAllDevices: async (): Promise<ApiResponse<DeviceResponse[]>> => {
    const response = await axiosClient.get<ApiResponse<DeviceResponse[]>>(
      API_ENDPOINTS.DEVICE.ALL_DEVICES,
    );
    return response.data;
  },

  getDeviceById: async (
    deviceId: string,
  ): Promise<ApiResponse<DeviceResponse>> => {
    const response = await axiosClient.get<ApiResponse<DeviceResponse>>(
      API_ENDPOINTS.DEVICE.GET_DEVICE_BY_ID(deviceId),
    );
    return response.data;
  },

  controlDevice: async (
    deviceId: string,
    action: "ON" | "OFF" | string,
  ): Promise<ApiResponse<DeviceControlResponse>> => {
    const requestBody: DeviceControlRequest = { action };
    const response = await axiosClient.post<ApiResponse<DeviceControlResponse>>(
      API_ENDPOINTS.DEVICE.CONTROL_DEVICE(deviceId),
      requestBody,
    );
    return response.data;
  },

  controlAllDevices: async (
    action: "ON" | "OFF" | string,
  ): Promise<ApiResponse<DeviceControlResponse[]>> => {
    const requestBody: DeviceControlRequest = { action };
    const response = await axiosClient.post<
      ApiResponse<DeviceControlResponse[]>
    >(API_ENDPOINTS.DEVICE.CONTROL_ALL, requestBody);
    return response.data;
  },
};
