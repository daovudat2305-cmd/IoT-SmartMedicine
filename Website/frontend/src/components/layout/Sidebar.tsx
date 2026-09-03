import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  ActivitySquare,
  History,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";

const BRAND = "#0055A5";
const ICON_FG = "#4B5563";
const IN_BD = "#E2E8F0";
const ACTIVE_BG = "#BDDEFF";

// Danh sách menu
const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "Data Sensors", path: "/data-sensor", Icon: ActivitySquare },
  { label: "Action History", path: "/action-history", Icon: History },
  { label: "Profile", path: "/profile", Icon: UserCircle },
];

interface SidebarProps {
  width?: number;
}

export default function Sidebar({ width = 200 }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: xử lý logout (clear token, redirect)
    navigate("/login");
  };

  return (
    <aside
      className="fixed left-0 flex flex-col border-r"
      style={{
        top: 56,
        width,
        height: "calc(100vh - 56px)",
        background: "#fff",
        borderColor: IN_BD,
      }}
    >
      {/* Navigation Menu */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? `font-semibold`
                  : "font-normal hover:bg-[#D9E8F5] hover:text-[#003870]",
              ].join(" ")
            }
            style={({ isActive }) => ({
              ...(isActive
                ? { background: ACTIVE_BG, color: "#004080" }
                : { color: ICON_FG }),
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2 : 1.6} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Nút Đăng xuất */}
      <div className="px-3 pb-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <LogOut size={16} />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
