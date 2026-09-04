import React from "react";
import { Mail, MapPin, FileText, Code2, Terminal, Palette } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagClass: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  link?: string;
}

const documentList: DocumentItem[] = [
  {
    id: "doc-guide",
    title: "Tài liệu",
    description: "Complete guide for Smart Classroom IoT system",
    tag: "PDF",
    tagClass: "bg-blue-100 text-blue-600 hover:bg-blue-100 border-none",
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    link: "#",
  },
  {
    id: "doc-api",
    title: "API Reference",
    description: "REST API endpoints and integration guide",
    tag: "API",
    tagClass: "bg-sky-100 text-sky-700 hover:bg-sky-100 border-none",
    icon: Code2,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    link: "#",
  },
  {
    id: "doc-github",
    title: "GitHub Repository",
    description: "Source code and project files",
    tag: "CODE",
    tagClass:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none",
    icon: Terminal,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    link: "https://github.com",
  },
  {
    id: "doc-figma",
    title: "Thiết kế Figma",
    description: "UI/UX design files and components",
    tag: "DESIGN",
    tagClass: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none",
    icon: Palette,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    link: "#",
  },
];

const Profile: React.FC = () => {
  return (
    <div className="px-6 py-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
        Thông tin cá nhân
      </h1>

      {/* ─── BANNER PROFILE ─── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#6355EE] via-[#7D5DF4] to-[#A359F6] p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-row items-center gap-4 sm:gap-5">
          <Avatar className="h-20 w-20 shrink-0 !rounded-xl border-2 border-white/25 shadow-sm after:!rounded-xl">
            <AvatarImage
              src="/avatar.jpg"
              alt="Đào Vũ Đạt"
              className="!rounded-xl object-cover"
            />
            <AvatarFallback className="!rounded-xl bg-white/20 text-white font-bold text-lg">
              ĐĐ
            </AvatarFallback>
          </Avatar>

          {/* Cụm thông tin chi tiết */}
          <div className="flex flex-col text-left">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Đào Vũ Đạt
            </h2>
            <p className="mt-0.5 text-sm font-medium text-white/95">
              Sinh viên CNPM
            </p>
            <p className="text-xs text-white/80">PTIT / D23CNPM01</p>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/90">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>daovudat2305@gmail.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MỤC TÀI LIỆU ─── */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-2.5 tracking-tight">
          Tài liệu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentList.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.id}
                href={item.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="block group no-underline"
              >
                <Card className="flex flex-row items-center justify-between rounded-xl bg-white border border-slate-200 p-3 transition-all duration-200 group-hover:shadow-md group-hover:border-slate-300">
                  {/* Left: Icon + Content */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Badge */}
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 tracking-wider ${item.tagClass}`}
                  >
                    {item.tag}
                  </Badge>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
