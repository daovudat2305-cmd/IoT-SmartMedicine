import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Syringe,
  ShieldPlus,
  BriefcaseMedical,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { MedicineBottle } from "../components/MedicineBottle";
import { useAuth } from "@/context";
import { Navigate, useLocation, useNavigate } from "react-router";
import { authApi } from "@/api";
import { toast } from "sonner";

const BRAND = "#0061A5";
const BTN_CLR = "#0D99FF";
const TITLE = "#0B1C30";
const ICON_FG = "#707884";
const IN_BG = "#F1F5F9";
const IN_BD = "#E2E8F0";
const PAGE_BG = "#F8F9FF";
const LOGO_BG = "rgba(13,153,255,0.1)";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // giữ nguyên cả search params khi redirect lại trang cũ
  const fromState = (
    location.state as { from?: { pathname: string; search: string } }
  )?.from;
  const redirectPath = fromState
    ? `${fromState.pathname}${fromState.search || ""}`
    : "/dashboard";

  //reset error message
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    // Validate email cơ bản
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrorMessage("Định dạng email không hợp lệ");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authApi.login({
        email: cleanEmail,
        password: cleanPassword,
      });

      login(cleanEmail, cleanPassword, response.data.username);

      toast.success("Đăng nhập thành công");
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardContent style={{ padding: 32 }}>
            {/* Thẻ form bao bọc */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Hiển thị lỗi nếu có */}
              {errorMessage && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {errorMessage}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="login-email"
                  style={{ color: TITLE, fontSize: 14, fontWeight: 500 }}
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: ICON_FG }}
                  />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    disabled={isLoading}
                    autoComplete="email"
                    placeholder="example@gmail.com"
                    className="pl-10 focus-visible:border-[#0D99FF] focus-visible:ring-[#0D99FF]/20"
                    onChange={handleEmailChange}
                    style={{
                      height: 49,
                      background: IN_BG,
                      borderColor: IN_BD,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="login-password"
                  style={{ color: TITLE, fontSize: 14, fontWeight: 500 }}
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
                    value={password}
                    disabled={isLoading}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-10 pr-10 focus-visible:border-[#0D99FF] focus-visible:ring-[#0D99FF]/20"
                    onChange={handlePasswordChange}
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

              {/* Nút Submit */}
              <Button
                type="submit"
                id="login-submit"
                disabled={isLoading}
                className="w-full font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
                style={{
                  height: 46,
                  background: BTN_CLR,
                  borderRadius: 4,
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                  fontSize: 14,
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
