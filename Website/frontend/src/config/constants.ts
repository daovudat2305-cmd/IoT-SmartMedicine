// ─── Layout ──────────────────────────────────────────────────────────────────
/** Chiều cao Header (px) — dùng trong Sidebar (top) và MainLayout (minHeight calc) */
export const HEADER_HEIGHT = 56;

/** Chiều rộng Sidebar mặc định (px) */
export const SIDEBAR_WIDTH = 200;

// ─── Pagination ───────────────────────────────────────────────────────────────
/** Số dòng mỗi trang trong DataSensor */
export const DATA_SENSOR_PAGE_SIZE = 7;

/** Số dòng mỗi trang trong ActionHistory */
export const ACTION_HISTORY_PAGE_SIZE = 5;

// ─── Chart ────────────────────────────────────────────────────────────────────
/** Độ dày nét stroke của Area Chart */
export const CHART_STROKE_WIDTH = 2;

/** Ngưỡng nhiệt độ tham chiếu trên (°C) — ReferenceLine trên Dashboard */
export const CHART_REF_TEMP_MAX = 25;

/** Ngưỡng nhiệt độ tham chiếu dưới (°C) — ReferenceLine trên Dashboard */
export const CHART_REF_TEMP_MIN = 20;

// ─── Chart YAxis Domains ──────────────────────────────────────────────────────
/** Domain trục Y trái — dùng cho Nhiệt độ (°C) và Độ ẩm (%) */
export const CHART_Y_LEFT_DOMAIN: [number, number] = [0, 100];

/** Domain trục Y phải — dùng cho Độ sáng (Lux).
 *  Dùng "auto" để Recharts tự động mở rộng scale theo giá trị thực tế,
 *  tránh bị clip khi sensor Lux vượt ngưỡng cố định. */
export const CHART_Y_RIGHT_DOMAIN: [number, string] = [0, "auto"];
