import AppHeader from "@/components/custom/dashboard/AppHeader";
import { AppSideBar } from "@/components/custom/dashboard/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchProvider } from "@/lib/search-context";
import React from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AppSideBar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <div className="p-5">{children}</div>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}