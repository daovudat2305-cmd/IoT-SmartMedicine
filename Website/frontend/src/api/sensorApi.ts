import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiEndpoints";
import type {
  ApiResponse,
  PageResponse,
  SensorRealtimeResponse,
  SensorChartResponse,
  DataSensorResponse,
  GetDataSensorsParams,
} from "../types";

export const sensorApi = {
  getLatestData: async (): Promise<ApiResponse<SensorRealtimeResponse>> => {
    const response = await axiosClient.get<ApiResponse<SensorRealtimeResponse>>(
      API_ENDPOINTS.SENSOR.LATEST_DATA,
    );
    return response.data;
  },

  getChartData: async (): Promise<ApiResponse<SensorChartResponse[]>> => {
    const response = await axiosClient.get<ApiResponse<SensorChartResponse[]>>(
      API_ENDPOINTS.SENSOR.CHART_DATA,
    );
    return response.data;
  },

  getDataSensors: async (
    params?: GetDataSensorsParams,
  ): Promise<ApiResponse<PageResponse<DataSensorResponse>>> => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<DataSensorResponse>>
    >(API_ENDPOINTS.SENSOR.DATA_SENSORS, { params });
    return response.data;
  },
};
