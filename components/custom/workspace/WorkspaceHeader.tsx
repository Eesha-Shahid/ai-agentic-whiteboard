"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadIcon, Save, Share } from "lucide-react";
import Image from "next/image";

type Props = {
  projectName: string;
  selectedTab: (value: "whiteboard" | "doc") => void;
  onExport: any;
};

function WorkspaceHeader({ projectName, selectedTab, onExport }: Props) {
  return (
    <div className="p-3 border-b flex justify-between">
      <div className="flex gap-2 items-center">
        <Image src="/logo.svg" alt="Logo" width={35} height={35} />
        <h2>{projectName}</h2>
      </div>

      {/* Switch */}
      <div>
        <Tabs
          defaultValue="whiteboard"
          onValueChange={(value) => selectedTab(value)}
        >
          <TabsList>
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="doc">Doc</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Extra Button */}
      <div className="flex gap-2">
        <Button className="cursor-pointer">
          <Save />
          Save
        </Button>
        <Button className="cursor-pointer" variant="outline">
          <Share />
          Share
        </Button>
        <Button className="cursor-pointer" onClick={onExport}>
          <DownloadIcon />
          Export
        </Button>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
