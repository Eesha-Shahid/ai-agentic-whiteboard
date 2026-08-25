"use client";
import { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import {
  Archive,
  ChevronRight,
  LayoutGrid,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CreateNewBoardDialog from "./CreateNewBoardDialog";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "All Files", icon: LayoutGrid },
  { href: "/shared", label: "Shared", icon: Users },
  { href: "/archived", label: "Archived", icon: Archive },
];

const OTHER_ITEMS = [
  { href: "/ai", label: "AI Helper", icon: Sparkles, accent: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  accent = false,
  index = 0,
}: any) {
  return (
    <Link
      href={href}
      style={{ animation: `fadeInUp 0.35s ease-out ${index * 0.04}s both` }}
    >
      <SidebarMenuButton
        className={`group relative mt-1 overflow-hidden rounded-xl p-3 transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] font-semibold text-[#4338CA]"
            : "text-gray-600 hover:bg-gray-50"
        }`}
        isActive={active}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#4338CA] to-[#6366F1]" />
        )}
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
            active
              ? accent
                ? "bg-gradient-to-br from-[#FDA4AF] to-[#FB7185] text-white shadow-[0_4px_10px_rgba(251,113,133,0.35)]"
                : "bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white shadow-[0_4px_10px_rgba(67,56,202,0.3)]"
              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
          }`}
        >
          <Icon size={15} />
        </span>
        <span>{label}</span>
        <ChevronRight
          size={14}
          className={`ml-auto shrink-0 text-gray-300 transition-all duration-200 ${
            active
              ? "translate-x-0 opacity-100"
              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
          }`}
        />
      </SidebarMenuButton>
    </Link>
  );
}

export function AppSideBar() {
  const path = usePathname();
  const { user } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const MAX_CREDITS = 10;
  const hasLoaded =
    userDetail?.credits !== undefined && userDetail?.credits !== null;
  const creditsUsed = hasLoaded ? MAX_CREDITS - userDetail.credits : 0;
  const progress = hasLoaded ? (creditsUsed / MAX_CREDITS) * 100 : 0;

  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div
          className="flex items-center gap-2.5"
          style={{ animation: "fadeInUp 0.4s ease-out both" }}
        >
          <div className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_4px_14px_rgba(67,56,202,0.35)] transition-transform duration-300 hover:scale-105 hover:rotate-3">
            <div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1]"
              style={{ animation: "glowPulse 3s ease-in-out infinite" }}
            />
            <Image
              src="/logo.svg"
              alt="Logo"
              height={20}
              width={20}
              className="relative z-10 brightness-0 invert"
            />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            WhizBoard
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup
          style={{ animation: "fadeInUp 0.4s ease-out 0.05s both" }}
        >
          <CreateNewBoardDialog />
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            My Boards
          </SidebarGroupLabel>
          {NAV_ITEMS.map((item, i) => (
            <NavLink
              key={item.href}
              {...item}
              active={path === item.href}
              index={i + 1}
            />
          ))}
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Others
          </SidebarGroupLabel>
          {OTHER_ITEMS.map((item, i) => (
            <NavLink
              key={item.href}
              {...item}
              active={path === item.href}
              index={NAV_ITEMS.length + i + 1}
            />
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        <CreateNewBoardDialog fullWidth />

        {hasLoaded ? (
          <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#4338CA]/10 bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4338CA]/20 hover:shadow-[0_10px_28px_rgba(67,56,202,0.14)]">
            <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[#818CF8]/10 blur-2xl transition-opacity duration-300 group-hover:opacity-150" />
            <div className="relative z-10 flex items-center gap-3.5">
              <svg width="52" height="52" className="-rotate-90 shrink-0">
                <circle
                  cx="26"
                  cy="26"
                  r={radius}
                  fill="none"
                  stroke="#E0E7FF"
                  strokeWidth="5"
                />
                <circle
                  cx="26"
                  cy="26"
                  r={radius}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
                <defs>
                  <linearGradient
                    id="ringGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4338CA" />
                    <stop offset="100%" stopColor="#FB7185" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {creditsUsed} of {MAX_CREDITS} boards
                </p>
                <p className="text-xs text-gray-400">Upgrade for unlimited</p>
              </div>
              <ChevronRight
                size={15}
                className="ml-auto shrink-0 text-[#4338CA]/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#4338CA]"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{ animation: "shimmer 1.6s infinite" }}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="relative h-3.5 w-24 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{ animation: "shimmer 1.6s infinite" }}
                  />
                </div>
                <div className="relative h-3 w-20 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{ animation: "shimmer 1.6s infinite" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="group flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-colors duration-200 hover:bg-gray-50">
            <div className="relative shrink-0">
              <Image
                className="rounded-full ring-2 ring-[#4338CA]/10 transition-all duration-200 group-hover:ring-[#4338CA]/25"
                src={user?.imageUrl ?? ""}
                alt="User Image"
                height={36}
                width={36}
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#34D399]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="truncate text-xs text-gray-400">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="shrink-0 text-gray-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
