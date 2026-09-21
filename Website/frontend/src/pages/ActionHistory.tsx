import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, RefreshCw, XCircle, RotateCcw, X } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
import { actionApi, deviceApi } from "@/api";
import type {
  ActionHistoryResponse,
  DeviceResponse,
  ActionStatus,
  GetActionHistoryParams,
} from "@/types";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ACTION_HISTORY_PAGE_SIZE } from "@/config";

// ─── Label Maps ───────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  all: "Tất cả",
  ON: "ON",
  OFF: "OFF",
};

const STATUS_LABELS: Record<string, string> = {
  all: "Tất cả",
  success: "Thành công",
  pending: "Đang xử lý",
  failed: "Thất bại",
};

const SORT_LABELS: Record<string, string> = {
  desc: "Mới nhất",
  asc: "Cũ nhất",
};

// ─── Helper: Action Badge ─────────────────────────────────────────────────────

function ActionBadge({ action }: { action?: string }) {
  const cleanAction = action ? action.toUpperCase() : "-";
  const isON = cleanAction === "ON";
  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs font-semibold ${
        isON
          ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-50"
          : cleanAction === "OFF"
            ? "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-100"
            : "border-slate-200 bg-slate-50 text-slate-400"
      }`}
    >
      {cleanAction}
    </Badge>
  );
}

// ─── Helper: Status Badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ActionStatus | string }) {
  const config: Record<
    string,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    success: {
      label: "Thành công",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      className: "border-green-300 bg-green-50 text-green-600 hover:bg-green-50",
    },
    pending: {
      label: "Đang xử lý",
      icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />,
      className: "border-blue-300 bg-blue-50 text-blue-500 hover:bg-blue-50",
    },
    failed: {
      label: "Thất bại",
      icon: <XCircle className="h-3.5 w-3.5" />,
      className: "border-red-300 bg-red-50 text-red-500 hover:bg-red-50",
    },
  };

  const key = status?.toLowerCase() || "pending";
  const item = config[key] || {
    label: status,
    icon: null,
    className: "border-slate-300 bg-slate-50 text-slate-600",
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold ${item.className}`}
    >
      {item.icon}
      {item.label}
    </Badge>
  );
}

// ─── Helper: Pagination Range ─────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const ActionHistory: React.FC = () => {
  // Data states
  const [data, setData] = useState<ActionHistoryResponse[]>([]);
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter states
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // 1. Tải danh sách thiết bị khi mount
  useEffect(() => {
    let isMounted = true;
    const fetchDevices = async () => {
      try {
        const response = await deviceApi.getAllDevices();
        if (isMounted && response.success && response.data) {
          setDevices(response.data);
        }
      } catch (error) {
        console.error("Không thể tải danh sách thiết bị:", error);
      }
    };
    fetchDevices();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Hàm fetch dữ liệu dùng chung (tránh lặp code)
  const fetchActionHistory = useCallback(
    async (isManualRefresh = false) => {
      setIsLoading(true);
      try {
        const params: GetActionHistoryParams = {
          deviceId: filterDevice === "all" ? undefined : filterDevice,
          action: filterAction === "all" ? undefined : filterAction,
          status: filterStatus === "all" ? undefined : filterStatus,
          date: filterDate ? filterDate : undefined,
          page: currentPage,
          size: ACTION_HISTORY_PAGE_SIZE,
          sort: sortOrder,
        };

        const response = await actionApi.getActionHistory(params);

        if (response.success && response.data) {
          setData(response.data.content || []);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
          if (isManualRefresh) {
            toast.success("Đã làm mới dữ liệu lịch sử");
          }
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Không thể tải lịch sử hoạt động",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filterDevice, filterAction, filterStatus, filterDate, sortOrder, currentPage],
  );

  useEffect(() => {
    fetchActionHistory();
  }, [fetchActionHistory]);

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
    setSortOrder(val as "desc" | "asc");
    setCurrentPage(1);
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };
  const handleClearDate = () => {
    setFilterDate("");
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setFilterDevice("all");
    setFilterAction("all");
    setFilterStatus("all");
    setFilterDate("");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return format(parsed, "HH:mm:ss dd-MM-yyyy");
    } catch {
      return dateStr;
    }
  };

  const isFiltered =
    filterDevice !== "all" ||
    filterAction !== "all" ||
    filterStatus !== "all" ||
    filterDate !== "";

  return (
    <div className="page-container">
      {/* Header trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Action History</h1>
          <p className="page-subtitle">
            Tra cứu lịch sử điều khiển và trạng thái thực thi của các thiết bị
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="gap-1 text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Đặt lại
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActionHistory(true)}
            disabled={isLoading}
            className="gap-1.5 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </div>

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
                <SelectValue>
                  {filterDevice === "all"
                    ? "Tất cả"
                    : devices.find((d) => d.id === filterDevice)?.id ||
                      filterDevice}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.id}
                  </SelectItem>
                ))}
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
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Thời gian */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600">
                Thời gian
              </label>
              {filterDate && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  Xóa
                </button>
              )}
            </div>
            <div className="relative w-full">
              <Input
                type="date"
                className="w-full !h-9"
                value={filterDate}
                onChange={handleDateChange}
              />
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
                <SelectItem value="desc">Mới nhất</SelectItem>
                <SelectItem value="asc">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── Card: Bảng dữ liệu ── */}
      <Card className="rounded-xl shadow-sm overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="table-header-row">
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
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: ACTION_HISTORY_PAGE_SIZE }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`} className="border-b last:border-0">
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-12 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-20 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-14 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-24 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-36 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-36 text-center text-slate-400 text-sm"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Không tìm thấy bản ghi hoạt động nào phù hợp.</p>
                    {isFiltered && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600"
                      >
                        Bỏ toàn bộ bộ lọc
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => (
                <TableRow key={record.id} className="table-data-row">
                  {/* Log ID */}
                  <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                    #{record.id}
                  </TableCell>

                  {/* Tên Thiết bị */}
                  <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                    {record.deviceName || record.deviceId}
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
                    {formatDateTime(record.time)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ── Footer: Số bản ghi + Pagination ── */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-slate-500">
            {isLoading
              ? "Đang tải dữ liệu..."
              : `Tổng cộng: ${totalElements} bản ghi`}
          </span>

          {totalPages > 1 && (
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                {/* Nút Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    text=""
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1 && !isLoading)
                        setCurrentPage((p) => p - 1);
                    }}
                    className={
                      currentPage === 1 || isLoading
                        ? "pointer-events-none opacity-40 border-0"
                        : "pagination-link"
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
                          if (!isLoading) setCurrentPage(item);
                        }}
                        className={
                          item === currentPage
                            ? "pagination-link-active"
                            : isLoading
                              ? "pointer-events-none opacity-50 border-0"
                              : "pagination-link"
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
                      if (currentPage < totalPages && !isLoading)
                        setCurrentPage((p) => p + 1);
                    }}
                    className={
                      currentPage === totalPages ||
                      totalPages === 0 ||
                      isLoading
                        ? "pointer-events-none opacity-40 border-0"
                        : "pagination-link"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ActionHistory;
