"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSearch } from "@/lib/search-context";
import { usePathname } from "next/navigation";

function AppHeader() {
  const [focused, setFocused] = useState(false);
  const pathname = usePathname();
  const showSearch = pathname !== "/settings";
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-gray-100 bg-white/80 p-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100" />

        {showSearch && (
          <div
            className={`hidden items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 sm:flex ${
              focused
                ? "w-72 border-[#4338CA]/30 bg-white shadow-[0_0_0_3px_rgba(67,56,202,0.08)]"
                : "w-56 border-gray-200 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <Search
              size={15}
              className={focused ? "text-[#4338CA]" : "text-gray-400"}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search boards..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full ring-2 ring-transparent transition hover:ring-[#4338CA]/15">
          <UserButton />
        </div>
      </div>
    </div>
  );
}

export default AppHeader;
