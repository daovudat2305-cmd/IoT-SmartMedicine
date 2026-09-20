import {
  LayoutDashboard,
  ActivitySquare,
  History,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  path: string;
  Icon: LucideIcon;
}

// ─── Navigation Items ─────────────────────────────────────────────────────────
/**
 * Danh sách menu điều hướng toàn app.
 * Dùng trong Sidebar — tách ra đây để sau này có thể dùng
 * thêm cho breadcrumb, mobile nav, hay kiểm tra quyền truy cập.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "Data Sensors", path: "/data-sensor", Icon: ActivitySquare },
  { label: "Action History", path: "/action-history", Icon: History },
  { label: "Profile", path: "/profile", Icon: UserCircle },
];
