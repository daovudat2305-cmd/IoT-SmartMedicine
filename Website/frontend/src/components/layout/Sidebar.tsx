import { NavLink, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context";
import { toast } from "sonner";
import { NAV_ITEMS, HEADER_HEIGHT } from "@/config";

interface SidebarProps {
  width?: number;
}

export default function Sidebar({ width = 200 }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất khỏi hệ thống");
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="fixed left-0 flex flex-col border-r"
      style={{
        top: HEADER_HEIGHT,
        width,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        background: "var(--app-surface)",
        borderColor: "var(--border-layout)",
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
                isActive ? "font-semibold" : "font-normal",
              ].join(" ")
            }
            style={({ isActive }) => ({
              ...(isActive
                ? {
                    background: "var(--nav-active-bg)",
                    color: "var(--nav-active-text)",
                  }
                : { color: "var(--nav-icon-fg)" }),
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              if (!el.classList.contains("font-semibold")) {
                el.style.background = "var(--nav-hover-bg)";
                el.style.color = "var(--nav-hover-text)";
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              if (!el.classList.contains("font-semibold")) {
                el.style.background = "";
                el.style.color = "var(--nav-icon-fg)";
              }
            }}
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
