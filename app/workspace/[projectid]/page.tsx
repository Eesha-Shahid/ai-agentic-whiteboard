"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { useCallback, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import ExportDialog from "@/components/custom/workspace/ExportDialog";
import ShareDialog from "@/components/custom/workspace/SharedDialog";

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
  const [exportOpen, setExportOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
    setApi(api);
  }, []);

  const handleSaveReady = useCallback((saveFn: () => void) => {
    setManualSave(() => saveFn);
  }, []);

  const handleSavingChange = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const openExport = () => {
    setAiOpen(false);
    setExportOpen(true);
  };

  const openAI = () => {
    setExportOpen(false);
    setAiOpen((prev) => !prev);
  };

  const openShare = () => {
    setAiOpen(false);
    setExportOpen(false);
    setShareOpen(true);
  };

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

  return (
    <div>
      <WorkspaceHeader
        projectName={projectName}
        selectedTab={(value) => setActiveTab(value)}
        onOpenExport={openExport}
        onSave={() => manualSave?.()}
        isSaving={isSaving}
        onOpenShare={openShare}
      />
      {activeTab === "whiteboard" ? (
        <Whiteboard
          onApiReady={handleApiReady}
          onSaveReady={handleSaveReady}
          onSavingChange={handleSavingChange}
          showAISidebar={aiOpen}
          onToggleAI={openAI}
        />
      ) : (
        <SmartDoc />
      )}
      <ShareDialog
        projectId={projectid as string}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
      <ExportDialog
        excalidrawApi={api}
        projectName={projectName}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}

export default Workspace;
