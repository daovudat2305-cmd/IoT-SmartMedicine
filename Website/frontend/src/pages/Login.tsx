import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Syringe,
  ShieldPlus,
  BriefcaseMedical,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MedicineBottle } from "@/components/MedicineBottle";

const BRAND = "#0061A5";
const BTN_CLR = "#0D99FF";
const TITLE = "#0B1C30";
const ICON_FG = "#707884";
const IN_BG = "#F1F5F9";
const IN_BD = "#E2E8F0";
const PAGE_BG = "#F8F9FF";
const LOGO_BG = "rgba(13,153,255,0.1)";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-8"
      style={{ background: PAGE_BG }}
    >
      {/* Desktop decorative icons */}
      <div
        className="absolute hidden md:flex items-end"
        style={{ left: "14%", top: "14%", color: BRAND }}
      >
        <Syringe
          size={60}
          strokeWidth={1.4}
          style={{ transform: "rotate(-40deg)" }}
          className="lg:!size-[70px]"
        />
        <Syringe
          size={46}
          strokeWidth={1.4}
          style={{ transform: "rotate(-8deg)", marginLeft: -18 }}
          className="lg:!size-[54px]"
        />
      </div>
      <div
        className="absolute hidden md:block"
        style={{ right: "19%", top: "22%" }}
      >
        <MedicineBottle className="w-[52px] h-[68px] lg:w-[62px] lg:h-[80px]" />
      </div>
      <div
        className="absolute hidden md:flex"
        style={{ right: "3.5%", bottom: "18%" }}
      >
        <ShieldPlus
          strokeWidth={1.3}
          style={{ color: BRAND }}
          className="size-[100px] lg:size-[120px]"
        />
      </div>

      {/* Mobile decorative icons */}
      <div
        className="absolute top-3 left-3 flex items-end md:hidden"
        style={{ color: BRAND }}
      >
        <Syringe
          size={32}
          strokeWidth={1.5}
          style={{ transform: "rotate(-40deg)" }}
        />
        <Syringe
          size={24}
          strokeWidth={1.5}
          style={{ transform: "rotate(-8deg)", marginLeft: -8 }}
        />
      </div>
      <div className="absolute top-3 right-3 md:hidden">
        <MedicineBottle className="w-[32px] h-[42px]" />
      </div>
      <div className="absolute bottom-3 right-3 md:hidden">
        <ShieldPlus size={44} strokeWidth={1.4} style={{ color: BRAND }} />
      </div>

      {/* Login Card Container */}
      <div
        className="relative z-10 flex w-full flex-col gap-8"
        style={{ maxWidth: 420 }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 64, height: 58, background: LOGO_BG }}
          >
            <BriefcaseMedical
              size={27}
              strokeWidth={2}
              style={{ color: BRAND }}
            />
          </div>
          <h1
            className="text-center"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(20px, 4vw, 32px)",
              lineHeight: "40px",
              letterSpacing: "-0.8px",
              color: TITLE,
              margin: 0,
            }}
          >
            Smart Medicine Storage
          </h1>
        </div>

        {/* Login Card */}
        <Card
          className="w-full border"
          style={{
            borderColor: IN_BD,
            borderRadius: 8,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent
            className="flex flex-col"
            style={{ gap: 24, padding: 32 }}
          >
            {/* Ten dang nhap */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="login-username"
                style={{
                  color: TITLE,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.14px",
                }}
              >
                Tên đăng nhập
              </Label>
              <div className="relative">
                <User
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: ICON_FG }}
                />
                <Input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  className="pl-10 focus-visible:border-[#0D99FF] focus-visible:ring-[#0D99FF]/20"
                  style={{
                    height: 49,
                    background: IN_BG,
                    borderColor: IN_BD,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="login-password"
                style={{
                  color: TITLE,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.14px",
                }}
              >
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: ICON_FG }}
                />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10 focus-visible:border-[#0D99FF] focus-visible:ring-[#0D99FF]/20"
                  style={{
                    height: 49,
                    background: IN_BG,
                    borderColor: IN_BD,
                    borderRadius: 4,
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                >
                  {showPassword ? (
                    <Eye size={18} style={{ color: ICON_FG }} />
                  ) : (
                    <EyeOff size={18} style={{ color: ICON_FG }} />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              id="login-submit"
              className="w-full font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
              style={{
                height: 46,
                background: BTN_CLR,
                borderRadius: 4,
                boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                fontSize: 14,
                letterSpacing: "0.14px",
              }}
            >
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
