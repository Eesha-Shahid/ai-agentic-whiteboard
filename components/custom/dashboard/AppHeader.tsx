import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";

function AppHeader() {
  return (
    <div className="w-full border-b p-4 flex justify-between items-center">
      <SidebarTrigger />
      <UserButton />
    </div>
  );
}

export default AppHeader;
