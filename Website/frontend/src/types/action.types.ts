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
