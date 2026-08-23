"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Share } from "lucide-react";
import Image from "next/image";

type Props = {
  selectedTab: (value: "whiteboard" | "doc") => void;
};

function WorkspaceHeader({ selectedTab }: Props) {
  return (
    <div className="p-3 border-b flex justify-between">
      <div className="flex gap-2 items-center">
        <Image src="/logo.svg" alt="Logo" width={35} height={35} />
        <h2>Workspace Name</h2>
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
        <Button>
          <Save />
          Save
        </Button>
        <Button variant="outline">
          <Share />
          Share
        </Button>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
