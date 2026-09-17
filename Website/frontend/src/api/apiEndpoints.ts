export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
  },
  USER: {
    MY_INFO: "/api/profile/me",
  },
  SENSOR: {
    LATEST_DATA: "/api/data-sensor/latest",
    CHART_DATA: "/api/data-sensor/chart",
    DATA_SENSORS: "/api/data-sensor",
  },
  DEVICE: {
    ALL_DEVICES: "/api/devices",
    GET_DEVICE_BY_ID: (deviceId: string) => `/api/devices/${deviceId}`,
    CONTROL_DEVICE: (deviceId: string) => `/api/devices/${deviceId}/control`,
    CONTROL_ALL: "/api/devices/control-all",
  },
  ACTION: {
    HISTORY: "/api/actions",
  },
} as const;
