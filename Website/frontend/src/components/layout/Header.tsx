import { useNavigate } from "react-router";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { User, LogOut, CircleUserRound } from "lucide-react";

const BRAND = "#004080";
const IN_BD = "#E2E8F0";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b px-6"
      style={{
        background: "#F7FBFF",
        borderColor: IN_BD,
        height: 56,
      }}
    >
      {/* Brand Name */}
      <span
        className="font-semibold select-none"
        style={{
          color: BRAND,
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
            className="flex items-center justify-center p-0 rounded-full hover:bg-[#BDDEFF]/80 transition-all h-10 w-10"
          >
            <CircleUserRound className="size-7" style={{ color: BRAND }} />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-40 p-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm font-medium text-[#003070] hover:bg-[#C5DCF0] hover:text-[#002050]"
            onClick={() => navigate("/profile")}
          >
            <User size={15} />
            Trang cá nhân
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={() => navigate("/login")}
          >
            <LogOut size={15} />
            Đăng xuất
          </Button>
        </PopoverContent>
      </Popover>
    </header>
  );
}
