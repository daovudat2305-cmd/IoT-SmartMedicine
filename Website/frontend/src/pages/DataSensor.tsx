import React, { useState, useMemo } from "react";
import { Thermometer, Droplets, Sun } from "lucide-react";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

// Kiểu dữ liệu 1 bản ghi sensor
type SensorType = "Nhiệt độ" | "Độ ẩm" | "Độ sáng";

interface SensorRecord {
  id: number;
  type: SensorType;
  value: string;
  time: string;
}

function SensorTypeCell({ type }: { type: SensorType }) {
  const config: Record<SensorType, { icon: React.ReactNode; label: string }> = {
    "Nhiệt độ": {
      icon: <Thermometer className="h-4 w-4 text-red-400" />,
      label: "Nhiệt độ",
    },
    "Độ ẩm": {
      icon: <Droplets className="h-4 w-4 text-blue-400" />,
      label: "Độ ẩm",
    },
    "Độ sáng": {
      icon: <Sun className="h-4 w-4 text-amber-400" />,
      label: "Độ sáng",
    },
  };
  const { icon, label } = config[type];
  return (
    <span className="flex items-center gap-1.5 justify-center">
      {icon}
      {label}
    </span>
  );
}

// Map value → label cho Select
const SENSOR_LABELS: Record<string, string> = {
  all: "Tất cả",
  "Nhiệt độ": "Nhiệt độ",
  "Độ ẩm": "Độ ẩm",
  "Độ sáng": "Độ sáng",
};

const SORT_LABELS: Record<string, string> = {
  desc: "Giảm dần",
  asc: "Tăng dần",
};

// Mock 20 bản ghi
const ALL_RECORDS: SensorRecord[] = [
  { id: 101, type: "Nhiệt độ", value: "2.4°C", time: "14:32:01 12-08-2026" },
  { id: 102, type: "Độ ẩm", value: "65%", time: "14:31:45 12-08-2026" },
  { id: 103, type: "Nhiệt độ", value: "9.1°C", time: "14:30:12 12-08-2026" },
  { id: 104, type: "Độ sáng", value: "0 lx", time: "14:28:55 12-08-2026" },
  { id: 105, type: "Nhiệt độ", value: "2.5°C", time: "14:27:01 12-08-2026" },
  { id: 106, type: "Độ ẩm", value: "70%", time: "14:26:10 12-08-2026" },
  { id: 107, type: "Độ sáng", value: "15 lx", time: "14:25:00 12-08-2026" },
  { id: 108, type: "Nhiệt độ", value: "3.1°C", time: "14:24:30 12-08-2026" },
  { id: 109, type: "Độ ẩm", value: "68%", time: "14:23:15 12-08-2026" },
  { id: 110, type: "Độ sáng", value: "20 lx", time: "14:22:05 12-08-2026" },
  { id: 111, type: "Nhiệt độ", value: "4.0°C", time: "14:21:00 12-08-2026" },
  { id: 112, type: "Độ ẩm", value: "72%", time: "14:20:45 12-08-2026" },
  { id: 113, type: "Độ sáng", value: "5 lx", time: "14:19:30 12-08-2026" },
  { id: 114, type: "Nhiệt độ", value: "1.8°C", time: "14:18:20 12-08-2026" },
  { id: 115, type: "Độ ẩm", value: "60%", time: "14:17:10 12-08-2026" },
  { id: 116, type: "Độ sáng", value: "30 lx", time: "14:16:00 12-08-2026" },
  { id: 117, type: "Nhiệt độ", value: "5.5°C", time: "14:15:50 12-08-2026" },
  { id: 118, type: "Độ ẩm", value: "75%", time: "14:14:40 12-08-2026" },
  { id: 119, type: "Độ sáng", value: "10 lx", time: "14:13:30 12-08-2026" },
  { id: 120, type: "Nhiệt độ", value: "6.2°C", time: "14:12:20 12-08-2026" },
];

const PAGE_SIZE = 7;

/**
 * Tạo danh sách số trang dạng "window" (kiểu đầu-giữa-cuối):
 * Ví dụ với total=10:
 *   page 1  → [1, 2, …, 10]
 *   page 5  → [1, …, 4, 5, 6, …, 10]
 *   page 10 → [1, …, 9, 10]
 */
function getPaginationRange(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const range: (number | "…")[] = [];

  range.push(1);

  if (current > 3) range.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) range.push(i);

  if (current < total - 2) range.push("…");

  range.push(total);

  return range;
}

const DataSensor: React.FC = () => {
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let data =
      filterType === "all"
        ? ALL_RECORDS
        : ALL_RECORDS.filter((r) => r.type === filterType);

    data = [...data].sort((a, b) =>
      sortOrder === "desc" ? b.id - a.id : a.id - b.id,
    );

    return data;
  }, [filterType, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const pageData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFilterChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };
  const handleSortChange = (val: string) => {
    setSortOrder(val as "asc" | "desc");
    setCurrentPage(1);
  };

  return (
    <div className="px-6 py-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Data Sensor</h1>

      {/* Card bộ lọc */}
      <Card className="rounded-xl shadow-sm p-4">
        <div className="flex items-end gap-6">
          {/* Filter: Loại cảm biến */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-600">Loại cảm biến</label>
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-44">
                <SelectValue>{SENSOR_LABELS[filterType]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Nhiệt độ">Nhiệt độ</SelectItem>
                <SelectItem value="Độ ẩm">Độ ẩm</SelectItem>
                <SelectItem value="Độ sáng">Độ sáng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Sắp xếp */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-600">Sắp xếp</label>
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-44">
                <SelectValue>{SORT_LABELS[sortOrder]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Card bảng */}
      <Card className="rounded-xl shadow-sm overflow-hidden p-0">
        {/* ---- Table ---- */}
        <Table>
          <TableHeader>
            {/* hover:bg-[#D0DCEC] để tắt hover mặc định trên hàng tiêu đề */}
            <TableRow className="bg-[#D0DCEC] hover:bg-[#D0DCEC]">
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-28 py-3">
                ID
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Loại cảm biến
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Giá trị
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Thời gian
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageData.map((record) => (
              <TableRow
                key={record.id}
                className="border-b last:border-0 cursor-default hover:bg-[#BDD6EE] hover:text-[#002D6A] transition-colors duration-150"
              >
                {/* ID */}
                <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                  {record.id}
                </TableCell>

                {/* Loại cảm biến */}
                <TableCell className="text-center text-[15px] py-3">
                  <SensorTypeCell type={record.type} />
                </TableCell>

                {/* Giá trị */}
                <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                  {record.value}
                </TableCell>

                {/* Thời gian */}
                <TableCell className="text-center text-[15px] text-slate-500 py-3">
                  {record.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* ---- Footer: số bản ghi + Pagination ---- */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          {/* Số bản ghi */}
          <span className="text-sm text-slate-500">
            {filteredData.length} bản ghi dữ liệu
          </span>

          {/* Pagination */}
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              {/* Nút Previous */}
              <PaginationItem>
                <PaginationPrevious
                  text=""
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((p) => p - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-40 border-0"
                      : "hover:bg-[#BDD6EE] hover:text-[#002D6A] border-0"
                  }
                />
              </PaginationItem>

              {getPaginationRange(currentPage, totalPages).map((item, idx) =>
                item === "…" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(item);
                      }}
                      className={
                        item === currentPage
                          ? "bg-[#93C5FD] text-[#003270] font-semibold border-0 hover:bg-[#93C5FD] hover:text-[#003270]"
                          : "hover:bg-[#BDD6EE] hover:text-[#002D6A] border-0"
                      }
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              {/* Nút Next */}
              <PaginationItem>
                <PaginationNext
                  text=""
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-40 border-0"
                      : "hover:bg-[#BDD6EE] hover:text-[#002D6A] border-0"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>
    </div>
  );
};

export default DataSensor;
