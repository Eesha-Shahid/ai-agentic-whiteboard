"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { useState } from "react";

function Workspace() {
  const [activeTab, setActiveTab] = useState<"whiteboard" | "doc">(
    "whiteboard",
  );

  return (
    <div>
      <WorkspaceHeader selectedTab={(value) => setActiveTab(value)} />
      {activeTab === "whiteboard" ? <Whiteboard /> : <SmartDoc />}
    </div>
  );
}

export default Workspace;
