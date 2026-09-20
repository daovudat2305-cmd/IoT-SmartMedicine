import React, { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  FileText,
  Code2,
  Terminal,
  Palette,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { userApi } from "../api";
import type { UserInfoResponse } from "../types";

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

const getInitials = (name?: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userApi.getMyInfo();
        if (response.data) {
          setUserInfo(response.data);
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thông tin người dùng",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const isValidLink = (url?: string) =>
    Boolean(url && url.trim() !== "" && url !== "#");

  const documentList: DocumentItem[] = [
    {
      id: "doc-guide",
      title: "Tài liệu báo cáo",
      description: "Complete guide for Smart Classroom IoT system",
      tag: "DOCS",
      tagClass: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none",
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      link: userInfo?.docs,
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
      link: userInfo?.apiDocs,
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
      link: userInfo?.github,
    },
    {
      id: "doc-figma",
      title: "Thiết kế Figma",
      description: "UI/UX design files and components",
      tag: "DESIGN",
      tagClass: "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none",
      icon: Palette,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      link: userInfo?.figma,
    },
  ];

  return (
    <div className="page-container space-y-4">
      <h1 className="page-title tracking-tight">
        Thông tin cá nhân
      </h1>

      {/* ─── BANNER PROFILE ─── */}
      <div
        className="relative overflow-hidden rounded-xl p-4 sm:p-5 text-white shadow-md"
        style={{
          background: `linear-gradient(to right, var(--profile-banner-from), var(--profile-banner-via), var(--profile-banner-to))`,
        }}
      >
        {isLoading ? (
          /* Skeleton Loading cho Banner */
          <div className="flex flex-row items-center gap-4 sm:gap-5 animate-pulse">
            <div className="h-20 w-20 shrink-0 rounded-xl bg-white/20" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-white/20 rounded" />
              <div className="h-4 w-32 bg-white/20 rounded" />
              <div className="h-3.5 w-60 bg-white/20 rounded mt-2" />
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-4 sm:gap-5">
            <Avatar className="h-20 w-20 shrink-0 !rounded-xl border-2 border-white/25 shadow-sm after:!rounded-xl">
              <AvatarImage
                src="/avatar.jpg"
                alt={userInfo?.fullName || "User Avatar"}
                className="!rounded-xl object-cover"
              />
              <AvatarFallback className="!rounded-xl bg-white/20 text-white font-bold text-lg">
                {getInitials(userInfo?.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col text-left">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                {userInfo?.fullName || "Chưa cập nhật tên"}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-white/95">
                Sinh viên CNPM
              </p>
              <p className="text-xs text-white/80">PTIT / D23CNPM01</p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/90">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>{userInfo?.email || "Chưa có email"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MỤC TÀI LIỆU ─── */}
      <div>
        <h2 className="section-title mb-2.5 tracking-tight">
          Tài liệu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading
            ? /* Skeleton Loading cho 4 cards tài liệu */
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="flex flex-row items-center justify-between rounded-xl bg-white border border-slate-200 p-3 h-[74px] animate-pulse"
                >
                  <div className="flex items-center gap-3 w-full pr-2">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-44 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-12 bg-slate-200 rounded shrink-0" />
                </Card>
              ))
            : documentList.map((item) => {
                const IconComponent = item.icon;
                const hasLink = isValidLink(item.link);

                const cardContent = (
                  <Card
                    className={`flex flex-row items-center justify-between rounded-xl bg-white border border-slate-200 p-3 transition-all duration-200 ${
                      hasLink
                        ? "group-hover:shadow-md group-hover:border-slate-300 cursor-pointer"
                        : "opacity-75 cursor-default bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}
                      >
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3
                            className={`text-sm font-bold text-slate-800 leading-snug ${
                              hasLink
                                ? "group-hover:text-blue-600 transition-colors"
                                : ""
                            }`}
                          >
                            {item.title}
                          </h3>
                          {hasLink && (
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {hasLink ? (
                      <Badge
                        variant="secondary"
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 tracking-wider ${item.tagClass}`}
                      >
                        {item.tag}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] font-medium px-2 py-0.5 text-slate-500 bg-slate-100 border-slate-200"
                      >
                        Chưa có
                      </Badge>
                    )}
                  </Card>
                );

                if (!hasLink) {
                  return (
                    <div key={item.id} className="block select-none">
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block group no-underline"
                  >
                    {cardContent}
                  </a>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
