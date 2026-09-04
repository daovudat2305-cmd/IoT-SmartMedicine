import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  ActivitySquare,
  History,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";

const BRAND = "#004080";
const ICON_FG = "#2D5078";
const IN_BD = "#D0DCEC";
const ACTIVE_BG = "#93C5FD";

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
        background: "#F7FBFF",
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
                  : "font-normal hover:bg-[#BDD6EE] hover:text-[#002D6A]",
              ].join(" ")
            }
            style={({ isActive }) => ({
              ...(isActive
                ? { background: ACTIVE_BG, color: "#003270" }
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
          className="w-full justify-start gap-2 text-sm font-semibold text-red-700 bg-red-100 hover:text-red-800 hover:bg-red-200"
        >
          <LogOut size={16} />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
