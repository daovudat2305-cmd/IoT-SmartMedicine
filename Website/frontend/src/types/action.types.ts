export type DeviceStatus = "ON" | "OFF";
export type ActionStatus = "success" | "pending" | "failed";

export interface DeviceControlRequest {
  action: string;
}

export interface DeviceControlResponse {
  actionId: number;
  deviceId: string;
  deviceName: string;
  currentDeviceStatus: DeviceStatus;
  commandAction: string;
  status: ActionStatus;
  executedAt: string;
}

export interface DeviceResponse {
  id: string;
  name: string;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActionHistoryResponse {
  id: number;
  deviceId: string;
  deviceName: string;
  action: string;
  status: ActionStatus;
  time: string;
}

export interface GetActionHistoryParams {
  deviceId?: string;
  action?: "ALL" | "ON" | "OFF" | string;
  status?: "ALL" | "success" | "pending" | "failed" | string;
  date?: string; // Định dạng YYYY-MM-DD
  page?: number;
  size?: number;
  sort?: "desc" | "asc" | string;
}
