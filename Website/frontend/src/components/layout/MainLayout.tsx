import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/config";

interface MainLayoutProps {
  children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* ① Header nằm ngang trên cùng, toàn chiều rộng */}
      <Header />

      {/* ② Phần dưới: Sidebar (trái) + nội dung (phải) */}
      <div className="flex flex-1">
        <Sidebar width={SIDEBAR_WIDTH} />

        {/* Nội dung trang — đẩy sang phải bằng marginLeft */}
        <main
          className="flex-1 overflow-auto"
          style={{
            marginLeft: SIDEBAR_WIDTH,
            background: "var(--app-bg-main)",
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
