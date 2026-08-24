"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { useCallback, useState } from "react";

import dynamic from "next/dynamic";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const Whiteboard = dynamic(
  () => import("@/components/custom/workspace/Whiteboard"),
  { ssr: false },
);

function Workspace() {
  const [activeTab, setActiveTab] = useState<"whiteboard" | "doc">(
    "whiteboard",
  );
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
    setApi(api);
  }, []);

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
        selectedTab={(value) => setActiveTab(value)}
        onExport={() => handleExportImage()}
      />
      {activeTab === "whiteboard" ? (
        <Whiteboard onApiReady={handleApiReady} />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
}

export default Workspace;
