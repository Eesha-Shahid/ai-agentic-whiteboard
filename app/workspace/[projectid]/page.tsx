"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { useCallback, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";

const Whiteboard = dynamic(
  () => import("@/components/custom/workspace/Whiteboard"),
  { ssr: false },
);

const normalizeAppState = (savedAppState: any) => {
  if (!savedAppState) return {};

  return {
    ...savedAppState,
    // Excalidraw expects collaborators as a Map instance — JSON.parse
    // always produces a plain object, which crashes internal reconciliation
    collaborators: new Map(),
    // Don't restore transient UI state from a saved snapshot —
    // these should always start fresh on load
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
  };
};

function Workspace() {
  const { projectid } = useParams();
  const [activeTab, setActiveTab] = useState<"whiteboard" | "doc">(
    "whiteboard",
  );
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [manualSave, setManualSave] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
    setApi(api);
  }, []);

  const handleSaveReady = useCallback((saveFn: () => void) => {
    setManualSave(() => saveFn);
  }, []);

  const handleSavingChange = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  useEffect(() => {
    projectid && api && GetWhiteboardData();
  }, [projectid, api]);

  const GetWhiteboardData = async () => {
    try {
      const result = await axios.get("/api/projects?projectId=" + projectid);

      setProjectName(result.data.projectName);

      api?.updateScene({
        elements: result.data.elements || [],
        appState: normalizeAppState(result.data.appState),
      });

      if (result.data.files) {
        api?.addFiles(Object.values(result.data.files));
      }
    } catch (error) {
      console.error("Failed to load whiteboard: ", error);
      toast.add({
        type: "error",
        title: "Failed to load whiteboard",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleExportImage = async () => {
    if (!api) return;

    // Loaded lazily so it never touches `window` during server render
    const { exportToBlob } = await import("@excalidraw/excalidraw");

    const blob = await exportToBlob({
      elements: api.getSceneElements(),
      appState: {
        ...api.getAppState(),
        exportBackground: true,
      },
      files: api.getFiles(),
      mimeType: "image/png",
      quality: 1,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "whiteboard.png";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <WorkspaceHeader
        projectName={projectName}
        selectedTab={(value) => setActiveTab(value)}
        onExport={() => handleExportImage()}
        onSave={() => manualSave?.()}
        isSaving={isSaving}
      />
      {activeTab === "whiteboard" ? (
        <Whiteboard
          onApiReady={handleApiReady}
          onSaveReady={handleSaveReady}
          onSavingChange={handleSavingChange}
        />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
}

export default Workspace;
