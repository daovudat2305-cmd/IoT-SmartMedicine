import { useNavigate } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { User, LogOut, CircleUserRound } from "lucide-react";
import { useAuth } from "@/context";
import { toast } from "sonner";

export default function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất khỏi hệ thống");
    navigate("/login", { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b px-6"
      style={{
        background: "var(--app-surface)",
        borderColor: "var(--border-input)",
        height: 56,
      }}
    >
      {/* Brand Name */}
      <span
        className="font-semibold select-none"
        style={{
          color: "var(--brand-primary)",
          fontSize: 16,
          letterSpacing: "-0.16px",
        }}
      >
        Smart Medicine Storage
      </span>

      {/* Avatar */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tài khoản"
            className="flex items-center justify-center p-0 rounded-full transition-all h-10 w-10 cursor-pointer hover:bg-[var(--nav-hover-bg)]/80"
          >
            <CircleUserRound
              className="size-7"
              style={{ color: "var(--brand-primary)" }}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-40 p-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm font-medium cursor-pointer hover:bg-[var(--nav-hover-bg)]"
            style={{ color: "var(--nav-active-text)" }}
            onClick={() => navigate("/profile")}
          >
            <User size={15} />
            Trang cá nhân
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm font-medium cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Đăng xuất
          </Button>
        </PopoverContent>
      </Popover>
    </header>
  );
}
