"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArchiveRestore, ArchiveX, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import ProjectCardSkeleton from "@/components/custom/dashboard/ProjectCardSkeleton";

type Project = {
  id: number;
  projectName: string;
  projectId: string;
  previewImage: string;
  userEmail: string;
  updatedAt: string;
  archived: boolean;
};

const formatRelativeTime = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

function ArchivedPage() {
  const [archivedList, setArchivedList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    GetArchivedList();
  }, []);

  const GetArchivedList = async () => {
    try {
      const result = await axios.get("/api/projects");
      setArchivedList(result.data.filter((p: Project) => p.archived));
    } catch (error) {
      console.error("Failed to load archived boards:", error);
      toast.add({
        type: "error",
        title: "Failed to load archived boards",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (restoringId || deletingId) return;
    setRestoringId(project.projectId);
    try {
      await axios.patch("/api/projects", {
        projectId: project.projectId,
        archived: false,
      });
      setArchivedList((prev) =>
        prev.filter((p) => p.projectId !== project.projectId),
      );
      toast.add({ type: "success", title: "Board restored" });
    } catch (error) {
      console.error("Failed to restore board:", error);
      toast.add({
        type: "error",
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      setRestoringId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (restoringId || deletingId) return;
    const confirmed = window.confirm(
      `Permanently delete "${project.projectName}"? This can't be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(project.projectId);
    try {
      await axios.delete("/api/projects?projectId=" + project.projectId);
      setArchivedList((prev) =>
        prev.filter((p) => p.projectId !== project.projectId),
      );
      toast.add({ type: "success", title: "Board deleted" });
    } catch (error) {
      console.error("Failed to delete board:", error);
      toast.add({
        type: "error",
        title: "Failed to delete board",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div
        className="flex items-center gap-3"
        style={{ animation: "fadeInUp 0.4s ease-out both" }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-[0_6px_16px_rgba(0,0,0,0.15)]">
          <ArchiveX size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Archived Boards
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            Boards you've archived. Restore them anytime, or delete permanently.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : archivedList.length === 0 ? (
        <div className="relative mt-10 flex flex-col items-center overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-10 py-16 text-center">
          <div className="absolute -right-14 top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#818CF8] to-[#4338CA] opacity-[0.06] blur-3xl" />
          <div className="absolute -left-14 bottom-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#FDA4AF] to-[#FB7185] opacity-[0.06] blur-3xl" />

          {/* Fanned ghost-card stack, illustrating "archived boards" */}
          <div
            className="relative mb-2 h-28 w-40"
            style={{ animation: "fadeInUp 0.5s ease-out both" }}
          >
            <div className="absolute inset-x-0 top-3 h-20 -rotate-6 rounded-xl border border-gray-200 bg-white shadow-sm" />
            <div className="absolute inset-x-0 top-2 h-20 rotate-3 rounded-xl border border-gray-200 bg-white shadow-sm" />
            <div className="absolute inset-x-0 top-1 h-20 -rotate-1 rounded-xl border border-gray-200 bg-gray-50 shadow-sm" />

            {/* Front card with the "opened" flap */}
            <div className="absolute inset-x-1 top-4 flex h-20 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white shadow-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-900">
                <ArchiveX size={15} className="text-white" />
              </div>
            </div>

            {/* Little dust/sparkle marks for character */}
            <span
              className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-gray-300"
              style={{ animation: "floatSlow 3s ease-in-out infinite" }}
            />
            <span
              className="absolute -left-3 bottom-2 h-1 w-1 rounded-full bg-gray-300"
              style={{ animation: "floatSlow 4s ease-in-out infinite reverse" }}
            />
          </div>

          <div style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}>
            <h2 className="text-lg font-semibold text-gray-900">
              Your archive is empty
            </h2>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-gray-400">
              Boards you tuck away from the dashboard will land here, ready to
              restore anytime.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {archivedList.map((project, index) => (
            <Link
              href={"/workspace/" + project.projectId}
              key={project.projectId}
              style={{
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
              }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <Badge className="absolute left-3 top-3 z-10 border-0 bg-white/90 text-gray-500 shadow-sm backdrop-blur-sm">
                  <ArchiveX size={11} className="mr-1" />
                  Archived
                </Badge>
                <Image
                  className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.05] group-hover:grayscale-0"
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    inset: "0px",
                    color: "transparent",
                  }}
                  src={project?.previewImage || "/folder.png"}
                  alt={project.projectName}
                  width={200}
                  height={150}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-300 group-hover:opacity-0"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 10px, transparent 10px, transparent 20px)",
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-black/5" />

                <div className="absolute bottom-2 right-2 flex translate-y-2 gap-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleRestore(e, project)}
                    disabled={
                      restoringId === project.projectId ||
                      deletingId === project.projectId
                    }
                    title="Restore"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-gray-600 shadow-md backdrop-blur-sm transition hover:bg-[#ECFDF5] hover:text-[#059669] disabled:opacity-50"
                  >
                    {restoringId === project.projectId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArchiveRestore size={14} strokeWidth={2} />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, project)}
                    disabled={
                      restoringId === project.projectId ||
                      deletingId === project.projectId
                    }
                    title="Delete permanently"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-gray-600 shadow-md backdrop-blur-sm transition hover:bg-red-50 hover:text-[#F43F5E] disabled:opacity-50"
                  >
                    {deletingId === project.projectId ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-[#F43F5E]"
                      />
                    ) : (
                      <Trash2 size={14} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h2 className="truncate font-semibold text-gray-700">
                  {project.projectName}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {project.updatedAt
                    ? `Edited ${formatRelativeTime(project.updatedAt)}`
                    : "Not yet edited"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArchivedPage;
