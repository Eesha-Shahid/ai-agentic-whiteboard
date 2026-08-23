"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { useState } from "react";

import dynamic from "next/dynamic";

const Whiteboard = dynamic(
  () => import("@/components/custom/workspace/Whiteboard"),
  { ssr: false }
);

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
