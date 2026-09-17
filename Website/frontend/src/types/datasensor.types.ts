export type WarningLevel = "SAFE" | "WARNING";
export type SensorDataType = "temperature" | "humidity" | "light";

export interface SensorRealtimeResponse {
  temperature: number;
  tempWarning: WarningLevel;
  tempUnit: string;
  humidity: number;
  humidityWarning: WarningLevel;
  humidityUnit: string;
  light: number;
  lightWarning: WarningLevel;
  lightUnit: string;
  time: string;
}

export interface SensorChartResponse {
  temperature: number;
  humidity: number;
  light: number;
  time: string;
}

export interface DataSensorResponse {
  id: number;
  dataType: SensorDataType;
  value: number;
  unit: string;
  warningLevel: WarningLevel;
  time: string;
}
