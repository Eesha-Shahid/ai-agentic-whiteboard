"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import Image from "next/image";
import { Eye, Loader2, Lock, PenLine, Sparkles } from "lucide-react";
import "@/components/custom/workspace/whiteboard.css";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false },
);

const normalizeAppState = (savedAppState: any, forceViewMode?: boolean) => {
  if (!savedAppState) return {};

  return {
    ...savedAppState,
    collaborators: new Map(),
    selectedElementIds: {},
    selectedGroupIds: {},
    editingElement: null,
    draggingElement: null,
    resizingElement: null,
    multiElement: null,
    editingLinearElement: null,
    activeTool: {
      type: "selection",
      customType: null,
      locked: false,
      lastActiveTool: null,
    },
    isLoading: false,
    errorMessage: null,
    contextMenu: null,
    openMenu: null,
    openPopup: null,
    zenModeEnabled: false,
    ...(forceViewMode !== undefined ? { viewModeEnabled: forceViewMode } : {}),
  };
};

function PublicViewPage() {
  const { projectId } = useParams();
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode");
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [projectName, setProjectName] = useState("");
  const [publicRole, setPublicRole] = useState<"view" | "edit">("view");
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">(
    "loading",
  );
  const [contentState, setContentState] = useState<
    "loading" | "empty" | "has-content"
  >("loading");

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
    setExcalidrawAPI(api);
  }, []);

  useEffect(() => {
    if (!projectId || !excalidrawAPI) return;
    loadPublicBoard();
  }, [projectId, excalidrawAPI]);

  const loadPublicBoard = async () => {
    try {
      const result = await axios.get(`/api/public/${projectId}`);
      setProjectName(result.data.projectName);

      const elements = result.data.elements || [];
      setContentState(elements.length > 0 ? "has-content" : "empty");

      const resolvedRole = urlMode === "edit" || urlMode === "view" ? urlMode : result.data.publicRole || "view";
      setPublicRole(resolvedRole);

      excalidrawAPI?.updateScene({
        elements,
        appState: normalizeAppState(result.data.appState, resolvedRole === "view"),
      });
      if (result.data.files) {
        excalidrawAPI?.addFiles(Object.values(result.data.files));
      }
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load public board:", error);
      setStatus("not-found");
    }
  };

  if (status === "not-found") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-gray-50 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-sm">
          <Lock size={22} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          This board isn't publicly shared
        </h2>
        <p className="max-w-sm text-sm text-gray-400">
          The owner may have turned off the public link, or the URL is
          incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
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
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            publicRole === "edit"
              ? "bg-[#EEF2FF] text-[#4338CA]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {publicRole === "edit" ? <PenLine size={13} /> : <Eye size={13} />}
          {publicRole === "edit" ? "You can edit" : "View only"}
        </div>
      </div>

      <div className="relative flex-1">
        <Excalidraw
          // @ts-ignore
          excalidrawAPI={handleApiReady}
          viewModeEnabled={publicRole === "view"}
        />

        {contentState !== "has-content" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white">
            {contentState === "loading" ? (
              <Loader2 size={22} className="animate-spin text-gray-300" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-sm">
                  <Sparkles size={22} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    This board is empty
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-gray-400">
                    The owner hasn't added anything to this whiteboard yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicViewPage;
