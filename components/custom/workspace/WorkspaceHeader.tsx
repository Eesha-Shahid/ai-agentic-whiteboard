"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadIcon, Loader2, Save, Share, Sparkles } from "lucide-react";
import Image from "next/image";

type Props = {
  projectName: string;
  selectedTab: (value: "whiteboard" | "doc") => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  onSave: () => void;
  isSaving: boolean;
};

function WorkspaceHeader({
  projectName,
  selectedTab,
  onOpenExport,
  onOpenShare,
  onSave,
  isSaving,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-white/90 p-3 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_4px_10px_rgba(67,56,202,0.3)]">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={16}
            height={16}
            className="brightness-0 invert"
          />
        </div>
        <h2 className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
          {projectName}
        </h2>
      </div>

      <Tabs
        defaultValue="whiteboard"
        onValueChange={(value) => selectedTab(value as "whiteboard" | "doc")}
      >
        <TabsList className="rounded-full bg-gray-100 p-1">
          <TabsTrigger
            value="whiteboard"
            className="rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 data-active:bg-white data-active:text-[#4338CA] data-active:hover:text-[#4338CA] data-active:shadow-sm cursor-pointer"
          >
            Whiteboard
          </TabsTrigger>
          <TabsTrigger
            value="doc"
            className="rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 data-active:bg-white data-active:text-[#4338CA] data-active:hover:text-[#4338CA] data-active:shadow-sm cursor-pointer"
          >
            Doc
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="cursor-pointer gap-1.5 border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] shadow-[0_4px_12px_rgba(67,56,202,0.25)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={15} />
              Save
            </>
          )}
        </Button>
        <Button onClick={onOpenShare} variant="outline" className="cursor-pointer gap-1.5 border-gray-200">
  <Share size={15} />
  Share
</Button>
        <Button
          onClick={onOpenExport}
          variant="outline"
          className="cursor-pointer gap-1.5 border-gray-200"
        >
          <DownloadIcon size={15} />
          Export
        </Button>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
