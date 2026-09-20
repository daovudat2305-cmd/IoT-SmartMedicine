import { Thermometer, Droplets, Sun, type LucideIcon } from "lucide-react";
import type { ChartConfig } from "../components/ui/chart";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SensorType = "temperature" | "humidity" | "light";

// ─── Sensor Metadata ─────────────────────────────────────────────────────────
/**
 * Nguồn sự thật duy nhất cho toàn bộ metadata của sensor:
 * - Nhãn hiển thị, đơn vị
 * - Màu sắc (khớp với CSS var --sensor-* trong index.css)
 * - Tailwind class cho icon và background
 * - Icon component
 * - Chart key dùng trong Recharts
 *
 * Dùng trong: Dashboard (chartConfig, getDeviceSensorConfig), DataSensor (SensorTypeCell)
 */
export const SENSOR_META: Record<
  SensorType,
  {
    label: string;
    unit: string;
    chartKey: string;
    color: string;
    iconClass: string;
    bgClass: string;
    Icon: LucideIcon;
  }
> = {
  temperature: {
    label: "Nhiệt độ",
    unit: "°C",
    chartKey: "temp",
    color: "var(--sensor-temp)",
    iconClass: "text-red-500",
    bgClass: "bg-red-100",
    Icon: Thermometer,
  },
  humidity: {
    label: "Độ ẩm",
    unit: "%",
    chartKey: "humidity",
    color: "var(--sensor-humidity)",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-100",
    Icon: Droplets,
  },
  light: {
    label: "Độ sáng",
    unit: "Lux",
    chartKey: "light",
    color: "var(--sensor-light)",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-100",
    Icon: Sun,
  },
};

/**
 * ChartConfig cho Recharts — tự động lấy từ SENSOR_META
 * Không cần sửa khi muốn đổi màu sensor
 */
export const CHART_CONFIG: ChartConfig = {
  temp: {
    label: `${SENSOR_META.temperature.label} (${SENSOR_META.temperature.unit})`,
    color: "#ef4444",
  },
  humidity: {
    label: `${SENSOR_META.humidity.label} (${SENSOR_META.humidity.unit})`,
    color: "#3b82f6",
  },
  light: {
    label: `${SENSOR_META.light.label} (${SENSOR_META.light.unit})`,
    color: "#f59e0b",
  },
};

/**
 * Map tên/ID thiết bị → SensorMeta tương ứng
 * Dùng trong Dashboard để hiển thị icon + màu cho device card
 */
export function getDeviceSensorMeta(deviceId: string, deviceName: string) {
  const lower = (deviceId + deviceName).toLowerCase();

  if (
    lower.includes("nhiệt") ||
    lower.includes("temp") ||
    lower.includes("led1")
  ) {
    return SENSOR_META.temperature;
  }
  if (
    lower.includes("ẩm") ||
    lower.includes("humi") ||
    lower.includes("led2")
  ) {
    return SENSOR_META.humidity;
  }
  return SENSOR_META.light;
}
