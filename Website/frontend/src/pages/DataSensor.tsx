import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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

// ─── Helper Components ────────────────────────────────────────────────────────

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

// ─── Filter Options ───────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const DataSensor: React.FC = () => {
  const [data, setData] = useState<DataSensorResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Gọi API lấy dữ liệu với cơ chế chống Race Condition
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await sensorApi.getDataSensors({
          type: filterType,
          page: currentPage,
          size: DATA_SENSOR_PAGE_SIZE,
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
  }, [filterType, sortOrder, currentPage]);

  const handleFilterChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortOrder(val as "asc" | "desc");
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await sensorApi.getDataSensors({
        type: filterType,
        page: currentPage,
        size: DATA_SENSOR_PAGE_SIZE,
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-1.5 text-slate-600 hover:text-primary cursor-pointer"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Card bộ lọc */}
      <Card className="rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-6">
          {/* Filter: Loại cảm biến */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">
              Loại cảm biến
            </label>
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
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
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">
              Sắp xếp thời gian
            </label>
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-52">
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
              Array.from({ length: DATA_SENSOR_PAGE_SIZE }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`} className="border-b last:border-0">
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
                  Không tìm thấy bản ghi dữ liệu nào phù hợp.
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
                      {record.id}
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
                    <TableCell className="text-center text-[15px] text-slate-500 py-3">
                      {formatDateTime(record.time)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer: Tổng số bản ghi + Phân trang */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-slate-500">
            {isLoading
              ? "Đang tải dữ liệu..."
              : `Tổng cộng: ${totalElements} bản ghi`}
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
