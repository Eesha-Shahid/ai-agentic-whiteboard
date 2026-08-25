"use client";
import { useSearch } from "@/lib/search-context";
import { Share, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SharedProject = {
  projectId: string;
  projectName: string;
  previewImage: string;
  updatedAt: string;
  sharedBy: { name: string; imageUrl: string };
  role: "editor" | "viewer";
};

// Sample data — swap for a real /api/shared fetch once collaboration exists
const SAMPLE_SHARED: SharedProject[] = [
  {
    projectId: "sample-1",
    projectName: "Q3 Product Roadmap",
    previewImage: "",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    sharedBy: { name: "Maya Chen", imageUrl: "" },
    role: "editor",
  },
  {
    projectId: "sample-2",
    projectName: "Onboarding Flow Sketch",
    previewImage: "",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    sharedBy: { name: "Arjun Patel", imageUrl: "" },
    role: "viewer",
  },
];

const formatRelativeTime = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

function SharedPage() {
  const { searchQuery } = useSearch();

  const visibleShared = SAMPLE_SHARED.filter((p) =>
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-[0_6px_16px_rgba(0,0,0,0.15)]">
          <Share size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shared Boards</h2>
          <p className="mt-0.5 text-sm text-gray-400">Boards your teammates have shared with you.</p>
        </div>
      </div>

      {visibleShared.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 p-14 text-center">
          <p className="text-sm text-gray-500">No shared boards match "{searchQuery}"</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visibleShared.map((project, index) => (
            <Link
              href={"/workspace/" + project.projectId}
              key={project.projectId}
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4338CA]/15 hover:shadow-[0_20px_44px_rgba(67,56,202,0.16)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-gray-50 to-[#FFF1F2]">
                <span
                  className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm ${
                    project.role === "editor"
                      ? "bg-white/90 text-[#4338CA]"
                      : "bg-white/90 text-gray-500"
                  }`}
                >
                  {project.role === "editor" ? "Can edit" : "Can view"}
                </span>

                {project.previewImage ? (
                  <Image
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent" }}
                    src={project.previewImage}
                    alt={project.projectName}
                    width={200}
                    height={150}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Sparkles size={28} className="text-[#818CF8]/40" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              <div className="p-4">
                <h2 className="truncate font-semibold text-gray-900">{project.projectName}</h2>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#818CF8] to-[#4338CA] text-[9px] font-semibold text-white">
                    {project.sharedBy.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="truncate text-xs text-gray-400">
                    {project.sharedBy.name} · {formatRelativeTime(project.updatedAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SharedPage;