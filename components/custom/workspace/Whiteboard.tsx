import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import "./whiteboard.css";
import { ArrowRight, Circle, Diamond, Eraser, Hand, Icon, Image, Minus, MousePointer2, Pencil, Square, Type } from "lucide-react";
import { TOOL_TYPE } from "@excalidraw/excalidraw/constants";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const tools = [
  {
    name: "selection",
    icon: MousePointer2,
    color: "text-blue-600",
  },
  {
    name: "hand",
    icon: Hand,
    color: "text-cyan-600",
  },
  {
    name: "rectangle",
    icon: Square,
    color: "text-blue-600",
  },
  {
    name: "diamond",
    icon: Diamond,
    color: "text-emerald-500"
  },
  {
    name: "ellipse",
    icon: Circle,
    color: "text-amber-500"
  },
  {
    name: "arrow",
    icon: ArrowRight,
    color: "text-violet-500"
  },
  {
    name: "line",
    icon: Minus,
    color: "text-pink-500"
  },
  {
    name: "freedraw",
    icon: Pencil,
    color: "text-orange-500"
  },
  {
    name: "text",
    icon: Type,
    color: "text-indigo-500"
  },
  {
    name: "image",
    icon: Image,
    color: "text-green-500"
  },
  {
    name: "eraser",
    icon: Eraser,
    color: "text-rose-500"
  }
];

function Whiteboard() {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const { projectid } = useParams();
  const [activeTool, setActiveTool] = useState("selection");

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    // Canvas Prev Timer
    if (saveTimeRef) {
      clearTimeout(saveTimeRef.current);
    }

    // Strat New 10 Second Timer
    saveTimeRef.current = setTimeout(() => {
      // SaveCanvasChanges(elements, appState, files);
      // toast.add({
      //   type: "success",
      //   title: "Changes Saved"
      // })
    }, 10000);
  };

  const SaveCanvasChanges = async (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    const result = await axios.post("/api/whiteboard", {
      projectId: projectid,
      elements: elements,
      appState: appState,
      files: files,
    });
  };

  const changeTool = (tool: any) => {
    if (!excalidrawAPI) return;
    setActiveTool(tool);
    excalidrawAPI.setActiveTool({
      type: tool,
    });
  };

  return (
    <div style={{ height: "90vh" }}>
      <Excalidraw
        // @ts-ignore
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleCanvasChange}
      />
      <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white border p-1.5 shadow-xl">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              onClick={() => changeTool(tool.name)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition 
                hover:bg-primary/10 hover:cursor-pointer
                ${activeTool === tool.name ? "bg-primary/10" : null}
              `}
            >
              <Icon size={19} className={tool.color} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Whiteboard;
