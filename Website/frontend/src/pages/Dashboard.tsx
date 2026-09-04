import React, { useState } from "react";
import { Thermometer, Droplets, Sun } from "lucide-react";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

// Dữ liệu sensor theo giờ trong ngày
const chartData = [
  { time: "00:00", temp: 22, humidity: 30, light: 0 },
  { time: "03:00", temp: 21, humidity: 32, light: 0 },
  { time: "06:00", temp: 20, humidity: 35, light: 5 },
  { time: "09:00", temp: 22, humidity: 38, light: 40 },
  { time: "12:00", temp: 24, humidity: 40, light: 80 },
  { time: "15:00", temp: 26, humidity: 38, light: 100 },
  { time: "18:00", temp: 30, humidity: 42, light: 60 },
  { time: "21:00", temp: 28, humidity: 44, light: 10 },
  { time: "Now", temp: 5.2, humidity: 42, light: 0.0 },
];

// ChartConfig là kiểu bắt buộc của shadcn chart
const chartConfig: ChartConfig = {
  temp: { label: "Temp (°C)", color: "#ef4444" }, // đỏ
  humidity: { label: "Humidity (%)", color: "#0d99ff" }, // xanh dương
  light: { label: "Light Exposure (Lux)", color: "#f59e0b" }, // cam/vàng
};

const Dashboard: React.FC = () => {
  const [led1, setLed1] = useState(true);
  const [led2, setLed2] = useState(true);
  const [led3, setLed3] = useState(false);

  return (
    <div className="px-6 py-4 max-w-5xl mx-auto space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-base font-bold text-slate-900">Đơn vị giám sát</h1>
        <p className="text-sm text-slate-500">
          Dữ liệu môi trường theo thời gian thực
        </p>
      </div>

      {/* Metric Cards */}
      {/* Bọc 3 card trong grid 3 cột */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card Nhiệt độ */}
        <Card
          size="sm"
          className="border-t-4 border-t-red-500 rounded-xl shadow-sm"
        >
          <CardContent className="pt-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <Thermometer className="h-5 w-5 text-red-400" strokeWidth={2.5} />
              Nhiệt độ
            </div>
            <div className="text-5xl font-bold text-slate-900">
              5.2 <span className="text-xl font-medium text-slate-500">°C</span>
            </div>
          </CardContent>
        </Card>

        {/* Card Độ ẩm — tương tự, đổi màu sang blue, icon Droplets */}
        <Card
          size="sm"
          className="border-t-4 border-t-blue-500 rounded-xl shadow-sm"
        >
          <CardContent className="pt-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <Droplets className="h-5 w-5 text-blue-400" strokeWidth={2.5} />
              Độ ẩm
            </div>
            <div className="text-5xl font-bold text-slate-900">
              42 <span className="text-xl font-medium text-slate-500">%</span>
            </div>
          </CardContent>
        </Card>

        {/* Card Độ sáng — tương tự, đổi màu sang amber, icon Sun */}
        <Card
          size="sm"
          className="border-t-4 border-t-amber-500 rounded-xl shadow-sm"
        >
          <CardContent className="pt-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <Sun className="h-5 w-5 text-amber-400" strokeWidth={2.5} />
              Độ sáng
            </div>
            <div className="text-5xl font-bold text-slate-900">
              100{" "}
              <span className="text-xl font-medium text-slate-500">Lux</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Biểu đồ dữ liệu
          </CardTitle>
          {/* Legend thủ công — 3 chấm màu + label */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Nhiệt độ (°C)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Độ ẩm (%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Độ sáng (Lux)
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />

              {/* Vùng tham chiếu (dải xanh lá nhạt ở giữa biểu đồ) */}
              <ReferenceLine y={25} stroke="#86efac" strokeDasharray="4 4" />
              <ReferenceLine y={20} stroke="#86efac" strokeDasharray="4 4" />

              {/* 3 đường line với fill */}
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
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
        </CardContent>
      </Card>

      {/* Điều khiển LED */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Điều khiển thiết bị
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {/* LED 1 — Cảnh báo nhiệt độ */}
          <Card className="flex flex-row items-center gap-3 px-4 py-3 rounded-xl shadow-sm">
            {/* Icon tròn màu đỏ */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <Thermometer className="h-6 w-6 text-red-400" strokeWidth={2.5} />
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Cảnh báo nhiệt độ
              </p>
              <p className="text-xs text-slate-400">LED 1</p>
            </div>

            {/* Switch từ shadcn */}
            <Switch
              checked={led1}
              onCheckedChange={setLed1}
              className="data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </Card>

          {/* LED 2 — Tương tự với icon Droplets, màu blue */}
          <Card className="flex flex-row items-center gap-3 px-4 py-3 rounded-xl shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Droplets className="h-6 w-6 text-blue-400" strokeWidth={2.5} />
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Cảnh báo độ ẩm
              </p>
              <p className="text-xs text-slate-400">LED 2</p>
            </div>

            {/* Switch từ shadcn */}
            <Switch
              checked={led2}
              onCheckedChange={setLed2}
              className="data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </Card>

          {/* LED 3 — Tương tự với icon Sun, màu amber, checked={led3} */}
          <Card className="flex flex-row items-center gap-3 px-4 py-3 rounded-xl shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Sun className="h-6 w-6 text-amber-400" strokeWidth={2.5} />
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Cảnh báo ánh sáng
              </p>
              <p className="text-xs text-slate-400">LED 3</p>
            </div>

            {/* Switch từ shadcn */}
            <Switch
              checked={led3}
              onCheckedChange={setLed3}
              className="data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
