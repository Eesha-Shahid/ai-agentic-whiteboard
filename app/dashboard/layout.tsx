import AppHeader from "@/components/custom/dashboard/AppHeader";
import { AppSideBar } from "@/components/custom/dashboard/AppSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return(
    <SidebarProvider>
      <AppSideBar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        {children}
      </div>
    </SidebarProvider>
  )
}
