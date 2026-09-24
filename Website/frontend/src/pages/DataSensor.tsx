import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  RotateCcw,
  X,
  Copy,
} from "lucide-react";
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
import { sensorApi } from "@/api";
import type { DataSensorResponse, SensorDataType } from "@/types";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { SENSOR_META, DATA_SENSOR_PAGE_SIZE } from "@/config";

// Helper Components

function SensorTypeCell({ type }: { type: SensorDataType }) {
  const meta = SENSOR_META[type as keyof typeof SENSOR_META];
  if (!meta) return <span>{type}</span>;
  const { Icon, iconClass, label } = meta;
  return (
    <span className="flex items-center gap-1.5 justify-center">
      <Icon className={`h-4 w-4 ${iconClass}`} />
      {label}
    </span>
  );
}

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

// Filter Options

const SENSOR_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả cảm biến" },
  { value: "temperature", label: SENSOR_META.temperature.label },
  { value: "humidity", label: SENSOR_META.humidity.label },
  { value: "light", label: SENSOR_META.light.label },
];

const SORT_OPTIONS = [
  { value: "desc", label: "Giảm dần (Mới nhất)" },
  { value: "asc", label: "Tăng dần (Cũ nhất)" },
];

// Main Component

const DataSensor: React.FC = () => {
  const [data, setData] = useState<DataSensorResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DATA_SENSOR_PAGE_SIZE);
  const [searchTime, setSearchTime] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Debounce ô tìm kiếm 500ms và đưa về trang 1 mỗi khi thay đổi từ khóa
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTime.trim());
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTime]);

  // Gọi API lấy dữ liệu với cơ chế chống Race Condition
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await sensorApi.getDataSensors({
          type: filterType,
          search: debouncedSearch || undefined,
          page: currentPage,
          size: pageSize,
          sort: sortOrder,
        });

        if (isMounted && response.success && response.data) {
          setData(response.data.content || []);
          setTotalPages(response.data.totalPages || 1);
          setTotalElements(response.data.totalElements || 0);
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(
            error?.response?.data?.message || "Không thể tải dữ liệu cảm biến",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [filterType, sortOrder, currentPage, pageSize, debouncedSearch]);

  const handleFilterChange = (val: string | null) => {
    if (val) {
      setFilterType(val);
      setCurrentPage(1);
    }
  };

  const handleSortChange = (val: "asc" | "desc" | null) => {
    if (val) {
      setSortOrder(val);
      setCurrentPage(1);
    }
  };

  const handlePageSizeChange = (val: string | null) => {
    if (val) {
      setPageSize(Number(val));
      setCurrentPage(1);
    }
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
    filterType !== "all" || sortOrder !== "desc" || searchTime.trim() !== "";

  const handleResetFilters = () => {
    setFilterType("all");
    setSortOrder("desc");
    setSearchTime("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await sensorApi.getDataSensors({
        type: filterType,
        search: debouncedSearch || undefined,
        page: currentPage,
        size: pageSize,
        sort: sortOrder,
      });
      if (response.success && response.data) {
        setData(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
        toast.success("Đã làm mới dữ liệu");
      }
    } catch (error: any) {
      toast.error("Lỗi khi làm mới dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Lịch Sử Cảm Biến</h1>
          <p className="page-subtitle">
            Tra cứu và giám sát dữ liệu môi trường theo thời gian thực
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
            onClick={handleRefresh}
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

      {/* Card bộ lọc căn chỉnh 3 cột cân đối */}
      <Card className="rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Filter: Loại cảm biến */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between h-5">
              <label className="text-sm font-medium text-slate-600">
                Loại cảm biến
              </label>
            </div>
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full !h-9">
                <SelectValue>
                  {
                    SENSOR_TYPE_OPTIONS.find((o) => o.value === filterType)
                      ?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SENSOR_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Sắp xếp theo thời gian */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between h-5">
              <label className="text-sm font-medium text-slate-600">
                Sắp xếp
              </label>
            </div>
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full !h-9">
                <SelectValue>
                  {SORT_OPTIONS.find((o) => o.value === sortOrder)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Tìm kiếm theo thời gian & giá trị */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between h-5">
              <label className="text-sm font-medium text-slate-600">
                Tìm kiếm thời gian / giá trị
              </label>
              {searchTime && (
                <button
                  type="button"
                  onClick={() => setSearchTime("")}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  Xóa
                </button>
              )}
            </div>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="VD: 14:30:00, 23-09-2026, 28°C..."
                value={searchTime}
                onChange={(e) => setSearchTime(e.target.value)}
                className="pl-8 pr-8 !h-9 bg-background border-input w-full"
              />
              {searchTime && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTime("");
                    setDebouncedSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Card bảng dữ liệu */}
      <Card className="rounded-xl shadow-sm overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="table-header-row">
              <TableHead className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-24 py-3">
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
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: pageSize }).map((_, idx) => (
                <TableRow
                  key={`skeleton-${idx}`}
                  className="border-b last:border-0"
                >
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-10 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-24 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="skeleton-box h-5 w-36 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-36 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>
                      {searchTime.trim()
                        ? `Không tìm thấy bản ghi nào khớp với từ khóa "${searchTime}".`
                        : "Không tìm thấy bản ghi dữ liệu nào phù hợp."}
                    </p>
                    {searchTime && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setSearchTime("");
                          setDebouncedSearch("");
                          setCurrentPage(1);
                        }}
                        className="text-xs text-blue-600"
                      >
                        Xóa từ khóa tìm kiếm
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => {
                const isWarning = record.warningLevel === "WARNING";
                const displayValue =
                  record.value !== null && record.value !== undefined
                    ? `${record.value} ${record.unit || ""}`
                    : "-";

                return (
                  <TableRow key={record.id} className="table-data-row">
                    {/* ID */}
                    <TableCell className="text-center font-bold text-[15px] text-slate-800 py-3">
                      #{record.id}
                    </TableCell>

                    {/* Loại cảm biến */}
                    <TableCell className="text-center text-[15px] py-3">
                      <SensorTypeCell type={record.dataType} />
                    </TableCell>

                    {/* Giá trị + Cảnh báo */}
                    <TableCell className="text-center font-bold text-[15px] py-3">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={
                            isWarning ? "text-rose-600" : "text-slate-800"
                          }
                        >
                          {displayValue}
                        </span>
                        {isWarning && (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-[11px] gap-1 animate-pulse"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Cảnh báo
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Thời gian */}
                    <TableCell
                      className="text-center text-[15px] text-slate-500 py-3 select-all cursor-text group"
                      title="Click để copy thời gian"
                    >
                      <span className="inline-flex items-center justify-center gap-1.5">
                        {formatDateTime(record.time)}
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-slate-400 hover:text-slate-600 transition-opacity cursor-pointer"
                          title="Copy thời gian"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              formatDateTime(record.time),
                            );
                            toast.success("Đã copy thời gian vào clipboard");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer: Tổng số bản ghi + PageSize + Phân trang */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {isLoading
                ? "Đang tải dữ liệu..."
                : debouncedSearch
                  ? `Tìm thấy: ${totalElements} bản ghi khớp từ khóa`
                  : `Tổng cộng: ${totalElements} bản ghi`}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <span>Hiển thị:</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 7, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>/ trang</span>
            </div>
          </div>
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
                    currentPage === totalPages || isLoading
                      ? "pointer-events-none opacity-40 border-0"
                      : "pagination-link"
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
