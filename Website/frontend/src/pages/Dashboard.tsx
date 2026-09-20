import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Sun,
  AlertTriangle,
  Wifi,
  WifiOff,
  Loader2,
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
  type ChartConfig,
} from "../components/ui/chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { useSensorRealtime, useDeviceStatus } from "../hooks";
import { sensorApi, deviceApi } from "../api";
import type { SensorChartResponse } from "../types";

// Cấu hình nhãn & màu sắc cho Recharts
const chartConfig: ChartConfig = {
  temp: { label: "Nhiệt độ (°C)", color: "#ef4444" },
  humidity: { label: "Độ ẩm (%)", color: "#3b82f6" },
  light: { label: "Độ sáng (Lux)", color: "#f59e0b" },
};

// Component Skeleton nhỏ gọn dùng khi đang tải
const SkeletonBox: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const Dashboard: React.FC = () => {
  // 1. Realtime Sensor Data & WebSocket Status
  const {
    sensorData,
    isConnected,
    isLoading: isSensorLoading,
  } = useSensorRealtime();

  // 2. Realtime Device Status
  const {
    devices,
    setDevices,
    isLoading: isDevicesLoading,
  } = useDeviceStatus();

  // 3. Biểu đồ lịch sử (20 điểm gần nhất)
  const [chartData, setChartData] = useState<
    Array<{ time: string; temp: number; humidity: number; light: number }>
  >([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

  // 4. Quản lý trạng thái toggle của từng thiết bị (đang gọi API)
  const [togglingDeviceId, setTogglingDeviceId] = useState<string | null>(null);

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

  // Helper ánh xạ icon & màu cho từng thiết bị theo ID hoặc Tên
  const getDeviceIconAndColor = (id: string, name: string) => {
    const lower = (id + name).toLowerCase();
    if (
      lower.includes("nhiệt") ||
      lower.includes("temp") ||
      lower.includes("led1")
    ) {
      return {
        icon: (
          <Thermometer className="h-6 w-6 text-red-500" strokeWidth={2.5} />
        ),
        bgColor: "bg-red-100",
      };
    }
    if (
      lower.includes("ẩm") ||
      lower.includes("humi") ||
      lower.includes("led2")
    ) {
      return {
        icon: <Droplets className="h-6 w-6 text-blue-500" strokeWidth={2.5} />,
        bgColor: "bg-blue-100",
      };
    }
    return {
      icon: <Sun className="h-6 w-6 text-amber-500" strokeWidth={2.5} />,
      bgColor: "bg-amber-100",
    };
  };

  return (
    <div className="px-6 py-4 max-w-5xl mx-auto space-y-6">
      {/* Header & WebSocket Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Đơn vị giám sát</h1>
          <p className="text-sm text-slate-500">
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
                <Thermometer
                  className="h-5 w-5 text-red-500"
                  strokeWidth={2.5}
                />
                Nhiệt độ
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
                  {sensorData?.tempUnit || "°C"}
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
                <Droplets className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
                Độ ẩm
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
                  {sensorData?.humidityUnit || "%"}
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
                <Sun className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
                Độ sáng
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
                  {sensorData?.lightUnit || "Lux"}
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
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Nhiệt độ (°C)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
              Độ ẩm (%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              Độ sáng (Lux)
            </span>
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
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />

                {/* Vùng tham chiếu chuẩn */}
                <ReferenceLine y={25} stroke="#86efac" strokeDasharray="4 4" />
                <ReferenceLine y={20} stroke="#86efac" strokeDasharray="4 4" />

                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorHumidity"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorTemp)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorHumidity)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="light"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorLight)"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Điều khiển thiết bị */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Điều khiển thiết bị
        </h2>

        {isDevicesLoading && devices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {devices.map((device) => {
              const { icon, bgColor } = getDeviceIconAndColor(
                device.id,
                device.name,
              );
              const isToggling = togglingDeviceId === device.id;
              const isChecked = device.status === "ON";

              return (
                <Card
                  key={device.id}
                  className="flex flex-row items-center gap-3 px-4 py-3 rounded-xl shadow-sm transition-all"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bgColor}`}
                  >
                    {icon}
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
