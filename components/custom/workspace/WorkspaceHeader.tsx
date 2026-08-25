"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DownloadIcon, Loader2, Pencil, Save, Share } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  projectName: string;
  selectedTab: (value: "whiteboard" | "doc") => void;
  onExport: () => void;
  onSave: () => void;
  onOpenShare: () => void;
  onRename: (newName: string) => Promise<void>;
  isSaving: boolean;
  isOwner: boolean;
};

function WorkspaceHeader({
  projectName,
  selectedTab,
  onExport,
  onSave,
  onOpenShare,
  onRename,
  isSaving,
  isOwner,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(projectName);
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setDraftName(projectName);
  }, [projectName, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    if (!isOwner) return;
    setDraftName(projectName);
    setIsEditing(true);
  };

  const commitRename = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === projectName) {
      setIsEditing(false);
      setDraftName(projectName);
      return;
    }
    setIsRenaming(true);
    try {
      await onRename(trimmed);
    } finally {
      setIsRenaming(false);
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setDraftName(projectName);
    setIsEditing(false);
  };

  const handleBack = () => {
    // Only go back if there's real history to return to (e.g. arrived
    // via a link from Dashboard/Archived/Shared) — otherwise a direct
    // visit to the workspace URL would have nowhere to "go back" to
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-white/90 p-3 backdrop-blur-xl">
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleBack}
          title="Go back"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
        </button>

        <Link
          href="/dashboard"
          title="Back to dashboard"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_4px_10px_rgba(67,56,202,0.3)] transition-transform hover:scale-105"
        >
          <Image src="/logo.svg" alt="Logo" width={16} height={16} className="brightness-0 invert" />
        </Link>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") cancelEditing();
              }}
              maxLength={30}
              className="h-7 max-w-[220px] rounded-md border border-[#4338CA]/30 bg-white px-2 text-sm font-semibold text-gray-900 outline-none ring-2 ring-[#4338CA]/10"
            />
            {isRenaming && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </div>
        ) : (
          <button
            onClick={startEditing}
            disabled={!isOwner}
            className={`group flex items-center gap-1.5 rounded-md px-1.5 py-0.5 ${isOwner ? "cursor-pointer hover:bg-gray-50" : "cursor-default"}`}
          >
            <h2 className="max-w-[220px] truncate text-sm font-semibold text-gray-900">{projectName}</h2>
            {isOwner && (
              <Pencil size={12} className="shrink-0 text-gray-300 opacity-0 transition group-hover:opacity-100" />
            )}
          </button>
        )}
      </div>

      <Tabs defaultValue="whiteboard" onValueChange={(value) => selectedTab(value as "whiteboard" | "doc")}>
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
        <Button onClick={onExport} variant="outline" className="cursor-pointer gap-1.5 border-gray-200">
          <DownloadIcon size={15} />
          Export
        </Button>
      </div>
    </div>
  );
}

export default WorkspaceHeader;