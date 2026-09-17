import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router";

interface MainLayoutProps {
  children?: ReactNode;
}

const SIDEBAR_W = 200;

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* ① Header nằm ngang trên cùng, toàn chiều rộng */}
      <Header />

      {/* ② Phần dưới: Sidebar (trái) + nội dung (phải) */}
      <div className="flex flex-1">
        <Sidebar width={SIDEBAR_W} />

        {/* Nội dung trang — đẩy sang phải bằng marginLeft */}
        <main
          className="flex-1 overflow-auto"
          style={{
            marginLeft: SIDEBAR_W,
            background: "#F3F8FD",
            minHeight: "calc(100vh - 56px)", // trừ chiều cao Header
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
