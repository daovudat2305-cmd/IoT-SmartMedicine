import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Wifi,
  WifiOff,
  Loader2,
  AlertOctagon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import {
  useSensorRealtime,
  useDeviceStatus,
  useHardwareStatus,
} from "../hooks";
import { sensorApi, deviceApi } from "../api";
import type { SensorChartResponse } from "../types";
import {
  CHART_CONFIG,
  SENSOR_META,
  getDeviceSensorMeta,
  CHART_STROKE_WIDTH,
  CHART_REF_TEMP_MAX,
  CHART_REF_TEMP_MIN,
  CHART_Y_LEFT_DOMAIN,
  CHART_Y_RIGHT_DOMAIN,
} from "@/config";

// Component Skeleton nhỏ gọn dùng khi đang tải
const SkeletonBox: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`skeleton-box ${className}`} />
);

type ChartPoint = {
  time: string;
  temp: number;
  humidity: number;
  light: number;
};

const formatChartTime = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString; // fallback nếu parse lỗi
  }
};

const Dashboard: React.FC = () => {
  // 1. Realtime Sensor Data & WebSocket Status
  const {
    sensorData,
    isConnected,
    isLoading: isSensorLoading,
  } = useSensorRealtime();

  // 2. Realtime Hardware Status (Lỗi cảm biến)
  const { hardwareStatus, clearStatus } = useHardwareStatus();

  // 3. Realtime Device Status
  const {
    devices,
    setDevices,
    isLoading: isDevicesLoading,
  } = useDeviceStatus();

  // 4. Biểu đồ lịch sử (20 điểm gần nhất)
  const [chartData, setChartData] = useState<
    Array<{ time: string; temp: number; humidity: number; light: number }>
  >([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

  // 5. Quản lý trạng thái toggle của từng thiết bị (đang gọi API)
  const [togglingDeviceId, setTogglingDeviceId] = useState<string | null>(null);

  // 6. Trạng thái khi đang bật/tắt toàn bộ thiết bị
  const [isTogglingAll, setIsTogglingAll] = useState<boolean>(false);

  useEffect(() => {
    if (sensorData && hardwareStatus?.status === "error") {
      clearStatus(); // Cảm biến đã hoạt động lại bình thường
    }
  }, [sensorData]);

  // Fetch dữ liệu biểu đồ
  useEffect(() => {
    let isMounted = true;
    async function loadChartData() {
      try {
        setIsChartLoading(true);
        const res = await sensorApi.getChartData();
        if (isMounted && res.success && res.data) {
          const formatted = res.data.map((item: SensorChartResponse) => ({
            time: item.time,
            temp: item.temperature,
            humidity: item.humidity,
            light: item.light,
          }));
          setChartData(formatted);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu biểu đồ:", err);
      } finally {
        if (isMounted) setIsChartLoading(false);
      }
    }
    loadChartData();
    return () => {
      isMounted = false;
    };
  }, []);

  //cập nhật biểu đồ
  useEffect(() => {
    if (!sensorData) return;
    const newPoint = {
      time: formatChartTime(sensorData.time), // dùng trường time từ WebSocket response
      temp: sensorData.temperature,
      humidity: sensorData.humidity,
      light: sensorData.light,
    };
    setChartData((prev) => {
      const updated = [...prev, newPoint];
      return updated.slice(-20); // giữ tối đa 20 điểm gần nhất
    });
  }, [sensorData]); // chạy mỗi khi sensorData thay đổi

  // Xử lý bật/tắt thiết bị với Pessimistic UI + Toast Feedback
  const handleToggleDevice = async (
    deviceId: string,
    currentStatus: "ON" | "OFF",
  ) => {
    const nextStatus = currentStatus === "ON" ? "OFF" : "ON";
    const targetDevice = devices.find((d) => d.id === deviceId);
    const deviceName = targetDevice?.name || deviceId;

    setTogglingDeviceId(deviceId);

    try {
      const res = await deviceApi.controlDevice(deviceId, nextStatus);
      if (res.success) {
        toast.success(`Đã gửi lệnh ${nextStatus} tới ${deviceName}`);
        // Cập nhật state local ngay để giao diện mượt mà
        setDevices((prev) =>
          prev.map((d) =>
            d.id === deviceId ? { ...d, status: nextStatus } : d,
          ),
        );
      } else {
        toast.error(res.message || `Điều khiển ${deviceName} thất bại`);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          `Lỗi kết nối khi điều khiển ${deviceName}`,
      );
    } finally {
      setTogglingDeviceId(null);
    }
  };

  // Xử lý bật/tắt toàn bộ thiết bị
  const handleToggleAll = async (action: "ON" | "OFF") => {
    setIsTogglingAll(true);
    try {
      const res = await deviceApi.controlAllDevices(action);
      if (res.success) {
        toast.success(
          action === "ON"
            ? "Đã bật toàn bộ thiết bị"
            : "Đã tắt toàn bộ thiết bị",
        );
        // Cập nhật state local ngay
        setDevices((prev) => prev.map((d) => ({ ...d, status: action })));
      } else {
        toast.error(res.message || "Điều khiển toàn bộ thiết bị thất bại");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Lỗi kết nối khi điều khiển toàn bộ thiết bị",
      );
    } finally {
      setIsTogglingAll(false);
    }
  };

  // Sensor metadata cho từng loại — lấy từ SENSOR_META
  const tempMeta = SENSOR_META.temperature;
  const humidityMeta = SENSOR_META.humidity;
  const lightMeta = SENSOR_META.light;

  return (
    <div className="page-container">
      {/* Header & WebSocket Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Đơn vị giám sát</h1>
          <p className="page-subtitle">
            Dữ liệu môi trường và điều khiển thiết bị theo thời gian thực
          </p>
        </div>

        {/* Realtime Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200">
          {isConnected ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">Realtime Connected</span>
            </>
          ) : (
            <>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
              <WifiOff className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-600">Đang kết nối lại...</span>
            </>
          )}
        </div>
      </div>

      {/* Banner cảnh báo lỗi phần cứng nếu có lỗi */}
      {hardwareStatus && hardwareStatus.status === "error" && (
        <div className="flex items-center justify-between p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Cảnh báo sự cố cảm biến phần cứng!
              </p>
              <p className="text-xs text-red-600">
                Mã lỗi:{" "}
                <span className="font-mono font-medium">
                  {hardwareStatus.message}
                </span>{" "}
                — Kiểm tra lại kết nối dây hoặc nguồn cấp cảm biến.
              </p>
            </div>
          </div>
          <button
            onClick={clearStatus}
            className="p-1 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700 transition"
            title="Đóng cảnh báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Nhiệt độ */}
        <Card
          size="sm"
          className={`border-t-4 rounded-xl shadow-sm transition-all duration-300 ${
            sensorData?.tempWarning === "WARNING"
              ? "border-t-red-600 bg-red-50/30 ring-2 ring-red-400"
              : "border-t-red-500"
          }`}
        >
          <CardContent className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
                <tempMeta.Icon
                  className={`h-5 w-5 ${tempMeta.iconClass}`}
                  strokeWidth={2.5}
                />
                {tempMeta.label}
              </div>
              {sensorData?.tempWarning === "WARNING" && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-bounce">
                  <AlertTriangle className="h-3 w-3" /> Cảnh báo
                </span>
              )}
            </div>

            {isSensorLoading && !sensorData ? (
              <SkeletonBox className="h-12 w-32 my-1" />
            ) : (
              <div className="text-5xl font-bold text-slate-900">
                {sensorData?.temperature ?? "--"}
                <span className="text-xl font-medium text-slate-500 ml-1">
                  {sensorData?.tempUnit || tempMeta.unit}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Độ ẩm */}
        <Card
          size="sm"
          className={`border-t-4 rounded-xl shadow-sm transition-all duration-300 ${
            sensorData?.humidityWarning === "WARNING"
              ? "border-t-blue-600 bg-blue-50/30 ring-2 ring-blue-400"
              : "border-t-blue-500"
          }`}
        >
          <CardContent className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
                <humidityMeta.Icon
                  className={`h-5 w-5 ${humidityMeta.iconClass}`}
                  strokeWidth={2.5}
                />
                {humidityMeta.label}
              </div>
              {sensorData?.humidityWarning === "WARNING" && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-bounce">
                  <AlertTriangle className="h-3 w-3" /> Cảnh báo
                </span>
              )}
            </div>

            {isSensorLoading && !sensorData ? (
              <SkeletonBox className="h-12 w-32 my-1" />
            ) : (
              <div className="text-5xl font-bold text-slate-900">
                {sensorData?.humidity ?? "--"}
                <span className="text-xl font-medium text-slate-500 ml-1">
                  {sensorData?.humidityUnit || humidityMeta.unit}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Độ sáng */}
        <Card
          size="sm"
          className={`border-t-4 rounded-xl shadow-sm transition-all duration-300 ${
            sensorData?.lightWarning === "WARNING"
              ? "border-t-amber-600 bg-amber-50/30 ring-2 ring-amber-400"
              : "border-t-amber-500"
          }`}
        >
          <CardContent className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
                <lightMeta.Icon
                  className={`h-5 w-5 ${lightMeta.iconClass}`}
                  strokeWidth={2.5}
                />
                {lightMeta.label}
              </div>
              {sensorData?.lightWarning === "WARNING" && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full animate-bounce">
                  <AlertTriangle className="h-3 w-3" /> Cảnh báo
                </span>
              )}
            </div>

            {isSensorLoading && !sensorData ? (
              <SkeletonBox className="h-12 w-32 my-1" />
            ) : (
              <div className="text-5xl font-bold text-slate-900">
                {sensorData?.light ?? "--"}
                <span className="text-xl font-medium text-slate-500 ml-1">
                  {sensorData?.lightUnit || lightMeta.unit}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ dữ liệu */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Biểu đồ dữ liệu môi trường gần đây
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {(["temperature", "humidity", "light"] as const).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: CHART_CONFIG[SENSOR_META[key].chartKey]?.color,
                  }}
                />
                {CHART_CONFIG[SENSOR_META[key].chartKey]?.label}
              </span>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {isChartLoading && chartData.length === 0 ? (
            <div className="h-[300px] w-full flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang tải dữ liệu biểu đồ...</span>
              </div>
            </div>
          ) : (
            <ChartContainer config={CHART_CONFIG} className="h-[300px] w-full">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                {/* Trục Y trái: Nhiệt độ (°C) & Độ ẩm (%) */}
                <YAxis
                  yAxisId="left"
                  domain={CHART_Y_LEFT_DOMAIN}
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                  width={52}
                  tickFormatter={(v) => `${v}`}
                  label={{
                    value: "°C / %",
                    angle: -90,
                    position: "insideLeft",
                    offset: 12,
                    style: { fontSize: 10, fill: "#94a3b8", fontWeight: 500 },
                  }}
                />
                {/* Trục Y phải: Độ sáng (Lux) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={CHART_Y_RIGHT_DOMAIN}
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                  width={54}
                  tickFormatter={(v) => `${v}`}
                  label={{
                    value: "Lux",
                    angle: 90,
                    position: "insideRight",
                    offset: 12,
                    style: { fontSize: 10, fill: "#94a3b8", fontWeight: 500 },
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />

                {/* Vùng tham chiếu nhiệt độ chuẩn — gán trục trái */}
                <ReferenceLine
                  yAxisId="left"
                  y={CHART_REF_TEMP_MAX}
                  stroke="#86efac"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  yAxisId="left"
                  y={CHART_REF_TEMP_MIN}
                  stroke="#86efac"
                  strokeDasharray="4 4"
                />

                <defs>
                  {(["temperature", "humidity", "light"] as const).map(
                    (key) => {
                      const meta = SENSOR_META[key];
                      const color = CHART_CONFIG[meta.chartKey]
                        ?.color as string;
                      return (
                        <linearGradient
                          key={key}
                          id={`color_${meta.chartKey}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={color}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      );
                    },
                  )}
                </defs>

                {(["temperature", "humidity", "light"] as const).map((key) => {
                  const meta = SENSOR_META[key];
                  const color = CHART_CONFIG[meta.chartKey]?.color as string;
                  // light → trục phải (Lux); temp & humidity → trục trái (°C / %)
                  const axisId = key === "light" ? "right" : "left";
                  return (
                    <Area
                      key={key}
                      yAxisId={axisId}
                      type="monotone"
                      dataKey={meta.chartKey}
                      stroke={color}
                      strokeWidth={CHART_STROKE_WIDTH}
                      fill={`url(#color_${meta.chartKey})`}
                      dot={false}
                    />
                  );
                })}
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Điều khiển thiết bị */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Điều khiển thiết bị</h2>

          {/* Nút gạt bật/tắt toàn bộ */}
          <div className="flex items-center gap-2">
            {isTogglingAll && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
            <span className="text-sm text-slate-600 font-medium">
              {devices.every((d) => d.status === "ON")
                ? "Tắt toàn bộ"
                : "Bật toàn bộ"}
            </span>
            <Switch
              checked={devices.every((d) => d.status === "ON")}
              disabled={isTogglingAll || devices.length === 0}
              onCheckedChange={(checked) =>
                handleToggleAll(checked ? "ON" : "OFF")
              }
              className="scale-125 data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </div>
        </div>

        {isDevicesLoading && devices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {devices.map((device) => {
              const meta = getDeviceSensorMeta(device.id, device.name);
              const isToggling = togglingDeviceId === device.id;
              const isChecked = device.status === "ON";

              return (
                <Card
                  key={device.id}
                  className="flex flex-row items-center gap-3 px-4 py-3 rounded-xl shadow-sm transition-all"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bgClass}`}
                  >
                    <meta.Icon
                      className={`h-6 w-6 ${meta.iconClass}`}
                      strokeWidth={2.5}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {device.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      ID: {device.id} · Trạng thái:{" "}
                      <span
                        className={`font-medium ${
                          isChecked ? "text-emerald-600" : "text-slate-500"
                        }`}
                      >
                        {device.status}
                      </span>
                    </p>
                  </div>

                  {/* Switch điều khiển kèm trạng thái loading */}
                  <div className="flex items-center gap-1.5">
                    {isToggling && (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    )}
                    <Switch
                      checked={isChecked}
                      disabled={isToggling}
                      onCheckedChange={() =>
                        handleToggleDevice(device.id, device.status)
                      }
                      className="data-checked:bg-blue-500 data-checked:border-blue-500"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
