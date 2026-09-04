import React, { useState, useMemo } from "react";
import { Search, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
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

type ActionType = "ON" | "OFF";
type StatusType = "Success" | "Processing" | "Failed";

interface ActionRecord {
  id: number;
  device: string;
  action: ActionType;
  status: StatusType;
  time: string; // "HH:MM:SS D-M-YYYY"
}

// Mock Data
const ALL_RECORDS: ActionRecord[] = [
  {
    id: 101,
    device: "LED 1",
    action: "ON",
    status: "Success",
    time: "10:42:15 12-8-2026",
  },
  {
    id: 102,
    device: "LED 2",
    action: "OFF",
    status: "Processing",
    time: "10:45:00 12-8-2026",
  },
  {
    id: 103,
    device: "LED 3",
    action: "ON",
    status: "Failed",
    time: "11:02:30 12-8-2026",
  },
  {
    id: 104,
    device: "LED 1",
    action: "ON",
    status: "Success",
    time: "11:15:00 12-8-2026",
  },
  {
    id: 105,
    device: "LED 2",
    action: "OFF",
    status: "Success",
    time: "11:30:45 12-8-2026",
  },
  {
    id: 106,
    device: "LED 3",
    action: "ON",
    status: "Processing",
    time: "11:45:10 12-8-2026",
  },
  {
    id: 107,
    device: "LED 1",
    action: "OFF",
    status: "Failed",
    time: "12:00:00 12-8-2026",
  },
  {
    id: 108,
    device: "LED 2",
    action: "ON",
    status: "Success",
    time: "12:10:20 12-8-2026",
  },
  {
    id: 109,
    device: "LED 3",
    action: "OFF",
    status: "Success",
    time: "12:25:35 12-8-2026",
  },
  {
    id: 110,
    device: "LED 1",
    action: "ON",
    status: "Processing",
    time: "12:40:50 12-8-2026",
  },
  {
    id: 111,
    device: "LED 2",
    action: "OFF",
    status: "Failed",
    time: "13:00:05 12-8-2026",
  },
  {
    id: 112,
    device: "LED 3",
    action: "ON",
    status: "Success",
    time: "13:15:20 12-8-2026",
  },
  {
    id: 113,
    device: "LED 1",
    action: "OFF",
    status: "Success",
    time: "13:30:00 12-8-2026",
  },
  {
    id: 114,
    device: "LED 2",
    action: "ON",
    status: "Processing",
    time: "13:45:40 12-8-2026",
  },
  {
    id: 115,
    device: "LED 3",
    action: "OFF",
    status: "Failed",
    time: "14:00:55 12-8-2026",
  },
  {
    id: 116,
    device: "LED 1",
    action: "ON",
    status: "Success",
    time: "14:10:10 12-8-2026",
  },
  {
    id: 117,
    device: "LED 2",
    action: "OFF",
    status: "Success",
    time: "14:20:25 12-8-2026",
  },
  {
    id: 118,
    device: "LED 3",
    action: "ON",
    status: "Processing",
    time: "14:35:30 12-8-2026",
  },
  {
    id: 119,
    device: "LED 1",
    action: "OFF",
    status: "Failed",
    time: "14:50:45 12-8-2026",
  },
  {
    id: 120,
    device: "LED 2",
    action: "ON",
    status: "Success",
    time: "15:05:00 12-8-2026",
  },
];

// Label Maps
const DEVICE_LABELS: Record<string, string> = {
  all: "Tất cả",
  "LED 1": "LED 1",
  "LED 2": "LED 2",
  "LED 3": "LED 3",
};

const ACTION_LABELS: Record<string, string> = {
  all: "Tất cả",
  ON: "ON",
  OFF: "OFF",
};

const STATUS_LABELS: Record<string, string> = {
  all: "Tất cả",
  Success: "Thành công",
  Processing: "Đang xử lý",
  Failed: "Thất bại",
};

const SORT_LABELS: Record<string, string> = {
  newest: "Mới nhất",
  oldest: "Cũ nhất",
};

// Helper: Action Badge
function ActionBadge({ action }: { action: ActionType }) {
  const config: Record<ActionType, string> = {
    ON: "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-50",
    OFF: "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-100",
  };
  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs font-semibold ${config[action]}`}
    >
      {action}
    </Badge>
  );
}

// Helper: Status Badge
function StatusBadge({ status }: { status: StatusType }) {
  const config: Record<
    StatusType,
    { icon: React.ReactNode; className: string }
  > = {
    Success: {
      icon: <CheckCircle className="h-3 w-3" />,
      className:
        "border-green-300 bg-green-50 text-green-600 hover:bg-green-50",
    },
    Processing: {
      icon: <RefreshCw className="h-3 w-3" />,
      className: "border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-50",
    },
    Failed: {
      icon: <XCircle className="h-3 w-3" />,
      className: "border-red-300 bg-red-50 text-red-500 hover:bg-red-50",
    },
  };

  const { icon, className } = config[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {icon}
      {STATUS_LABELS[status]}
    </Badge>
  );
}

// Helper: Pagination Range
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

// Constants
const PAGE_SIZE = 5;

// Main Component
const ActionHistory: React.FC = () => {
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    let data = ALL_RECORDS;

    if (filterDevice !== "all") {
      data = data.filter((r) => r.device === filterDevice);
    }

    if (filterAction !== "all") {
      data = data.filter((r) => r.action === filterAction);
    }

    if (filterStatus !== "all") {
      data = data.filter((r) => r.status === filterStatus);
    }

    // → chuyển thành "12-8-2026" để so với field time
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      const datePart = `${parseInt(day)}-${parseInt(month)}-${year}`;
      data = data.filter((r) => r.time.includes(datePart));
    }

    data = [...data].sort((a, b) =>
      sortOrder === "newest" ? b.id - a.id : a.id - b.id,
    );

    return data;
  }, [filterDevice, filterAction, filterStatus, filterDate, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const pageData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Handlers
  const handleDeviceChange = (val: string) => {
    setFilterDevice(val);
    setCurrentPage(1);
  };
  const handleActionChange = (val: string) => {
    setFilterAction(val);
    setCurrentPage(1);
  };
  const handleStatusChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };
  const handleSortChange = (val: string) => {
    setSortOrder(val as "newest" | "oldest");
    setCurrentPage(1);
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  // Render
  return (
    <div className="px-6 py-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Action History</h1>

      {/* ── Card: Bộ lọc ── */}
      <Card className="rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {/* Thiết bị */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-600">
              Thiết bị
            </label>
            <Select value={filterDevice} onValueChange={handleDeviceChange}>
              <SelectTrigger className="w-full !h-9">
                <SelectValue>{DEVICE_LABELS[filterDevice]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="LED 1">LED 1</SelectItem>
                <SelectItem value="LED 2">LED 2</SelectItem>
                <SelectItem value="LED 3">LED 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hành động */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-600">
              Hành động
            </label>
            <Select value={filterAction} onValueChange={handleActionChange}>
              <SelectTrigger className="w-full !h-9">
                <SelectValue>{ACTION_LABELS[filterAction]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ON">ON</SelectItem>
                <SelectItem value="OFF">OFF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-600">
              Trạng thái
            </label>
            <Select value={filterStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full !h-9">
                <SelectValue>{STATUS_LABELS[filterStatus]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Success">Thành công</SelectItem>
                <SelectItem value="Processing">Đang xử lý</SelectItem>
                <SelectItem value="Failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Thời gian (Date picker) */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-600">
              Thời gian
            </label>
            <div className="relative w-full">
              <Input
                type="date"
                className="w-full !h-9 pr-8"
                value={filterDate}
                onChange={handleDateChange}
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-600">
              Sắp xếp
            </label>
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full !h-9">
                <SelectValue>{SORT_LABELS[sortOrder]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── Card: Bảng dữ liệu ── */}
      <Card className="rounded-xl shadow-sm overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#D0DCEC] hover:bg-[#D0DCEC]">
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-28 py-3">
                Log ID
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Thiết bị
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Hành động
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider py-3">
                Thời gian
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-400 text-sm"
                >
                  Không có dữ liệu phù hợp
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((record) => (
                <TableRow
                  key={record.id}
                  className="border-b last:border-0 cursor-default hover:bg-[#BDD6EE] hover:text-[#002D6A] transition-colors duration-150"
                >
                  {/* Log ID */}
                  <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                    #{record.id}
                  </TableCell>

                  {/* Thiết bị */}
                  <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                    {record.device}
                  </TableCell>

                  {/* Hành động */}
                  <TableCell className="text-center py-3">
                    <ActionBadge action={record.action} />
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell className="text-center py-3">
                    <StatusBadge status={record.status} />
                  </TableCell>

                  {/* Thời gian */}
                  <TableCell className="text-center text-[15px] text-slate-500 py-3">
                    {record.time}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ── Footer: Số bản ghi + Pagination ── */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-slate-500">
            {filteredData.length} bản ghi
          </span>

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

              {/* Số trang */}
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
                    currentPage === totalPages || totalPages === 0
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

export default ActionHistory;
