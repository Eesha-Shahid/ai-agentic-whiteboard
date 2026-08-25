"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import CreateNewBoardDialog from "./CreateNewBoardDialog";
import axios from "axios";
import { Archive, Loader2, Lock, Plus, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import ProjectCardSkeleton from "./ProjectCardSkeleton";
import { useSearch } from "@/lib/search-context";

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

function ProjectList() {
  const { searchQuery } = useSearch();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    GetProjectList();
  }, []);

  const GetProjectList = async () => {
    try {
      const result = await axios.get("/api/projects");
      setProjectList(result.data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.add({
        type: "error",
        title: "Failed to load boards",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveToggle = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (archivingId || deletingId) return;
    const nextArchived = !project.archived;
    setArchivingId(project.projectId);
    try {
      await axios.patch("/api/projects", {
        projectId: project.projectId,
        archived: nextArchived,
      });
      setProjectList((prev) =>
        prev.map((p) =>
          p.projectId === project.projectId
            ? { ...p, archived: nextArchived }
            : p,
        ),
      );
      toast.add({
        type: "success",
        title: nextArchived ? "Board archived" : "Board restored",
      });
    } catch (error) {
      console.error("Failed to update archive status:", error);
      toast.add({
        type: "error",
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setArchivingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (archivingId || deletingId) return;
    const confirmed = window.confirm(
      `Delete "${project.projectName}"? This can't be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(project.projectId);
    try {
      await axios.delete("/api/projects?projectId=" + project.projectId);
      setProjectList((prev) =>
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

  const visibleProjects = projectList
    .filter((p) => !p.archived)
    .filter((p) =>
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  if (isLoading) {
    return (
      <div className="mt-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Your Boards
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Create, organize and continue working on your ideas
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {visibleProjects.length === 0 ? (
        searchQuery ? (
          <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 p-14 text-center">
            <p className="text-sm text-gray-500">
              No boards match "{searchQuery}"
            </p>
            <p className="text-xs text-gray-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="relative mt-10 flex flex-col items-center overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b from-[#EEF2FF]/40 to-white px-10 py-16 text-center">
            <div
              className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#818CF8] to-[#4338CA] opacity-10 blur-3xl"
              style={{ animation: "floatSlow 7s ease-in-out infinite" }}
            />
            <div
              className="absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#FDA4AF] to-[#FB7185] opacity-10 blur-3xl"
              style={{ animation: "floatSlow 9s ease-in-out infinite reverse" }}
            />

            {/* Mini canvas illustration — a blank board with floating notes and a cursor */}
            <div
              className="relative mb-3 h-32 w-48"
              style={{ animation: "fadeInUp 0.5s ease-out both" }}
            >
              {/* The "canvas" itself */}
              <div className="absolute inset-0 rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(67,56,202,0.08)]">
                <div
                  className="absolute inset-0 rounded-2xl opacity-[0.4]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #E0E7FF 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
              </div>

              {/* Floating sticky notes, mid-drop onto the canvas */}
              <div
                className="absolute -left-4 -top-3 h-9 w-9 -rotate-12 rounded-md bg-gradient-to-br from-[#FDE68A] to-[#FBBF24] shadow-md"
                style={{ animation: "floatSlow 4s ease-in-out infinite" }}
              />
              <div
                className="absolute -right-3 top-1 h-8 w-8 rotate-6 rounded-md bg-gradient-to-br from-[#C7D2FE] to-[#818CF8] shadow-md"
                style={{
                  animation: "floatSlow 5s ease-in-out infinite reverse",
                }}
              />
              <div
                className="absolute -bottom-3 left-6 h-7 w-7 rotate-3 rounded-md bg-gradient-to-br from-[#FECDD3] to-[#FB7185] shadow-md"
                style={{ animation: "floatSlow 4.5s ease-in-out infinite" }}
              />

              {/* A little "drawing" stroke on the canvas, like the start of an idea */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 192 128"
              >
                <path
                  d="M 50 70 Q 80 40 110 65 T 150 55"
                  fill="none"
                  stroke="#4338CA"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="140"
                  strokeDashoffset="140"
                  style={{ animation: "drawLine 1.2s ease-out 0.3s forwards" }}
                />
              </svg>

              {/* Cursor, sitting at the end of the stroke */}
              <div
                className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-[#4338CA] shadow-[0_4px_12px_rgba(67,56,202,0.4)]"
                style={{
                  left: "138px",
                  top: "44px",
                  animation: "fadeInUp 0.4s ease-out 1.3s both",
                }}
              >
                <Plus size={13} className="text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}>
              <h2 className="text-xl font-bold text-gray-900">
                Your canvas is waiting
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-400">
                Create your first board to start sketching ideas, mapping flows,
                and building diagrams — all on one infinite canvas.
              </p>
              <div className="mt-5">
                <CreateNewBoardDialog fullWidth={false} />
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Your Boards
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Create, organize and continue working on your ideas
              </p>
            </div>
            <span className="hidden rounded-full bg-gradient-to-r from-[#EEF2FF] to-[#FFF1F2] px-2.5 py-1 text-xs font-medium text-[#4338CA] sm:block">
              {visibleProjects.length} board
              {visibleProjects.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {visibleProjects.map((project, index) => (
              <Link
                href={"/workspace/" + project.projectId}
                key={project.projectId}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                }}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4338CA]/15 hover:shadow-[0_20px_44px_rgba(67,56,202,0.16)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-gray-50 to-[#FFF1F2]">
                  <Badge className="absolute left-3 top-3 z-10 border-0 bg-white/90 text-[#4338CA] shadow-sm backdrop-blur-sm">
                    <Lock size={11} className="mr-1" />
                    Private
                  </Badge>
                  <Image
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
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
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/10 to-transparent" />

                  {/* Hover-reveal actions — hidden by default, slide up on hover */}
                  <div className="absolute bottom-2 right-2 flex translate-y-2 gap-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleArchiveToggle(e, project)}
                      disabled={
                        archivingId === project.projectId ||
                        deletingId === project.projectId
                      }
                      title="Archive"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-gray-600 shadow-md backdrop-blur-sm transition hover:bg-[#EEF2FF] hover:text-[#4338CA] disabled:opacity-50"
                    >
                      {archivingId === project.projectId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Archive size={14} strokeWidth={2} />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, project)}
                      disabled={
                        archivingId === project.projectId ||
                        deletingId === project.projectId
                      }
                      title="Delete"
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
                  <h2 className="truncate font-semibold text-gray-900">
                    {project.projectName}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <Sparkles size={11} className="text-[#FB7185]" />
                    {project.updatedAt
                      ? `Edited ${formatRelativeTime(project.updatedAt)}`
                      : "Not yet edited"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;
