import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./whiteboard.css";
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Image,
  Lock,
  Minus,
  MousePointer2,
  Pencil,
  Sparkles,
  Square,
  Type,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import FloatingProperties from "./FloatingProperties";
import { Button } from "@/components/ui/button";
import AIFloatingSidebar from "./AIFloatingSidebar";

const tools = [
  { name: "selection", icon: MousePointer2, color: "text-purple-600" },
  { name: "hand", icon: Hand, color: "text-cyan-500" },
  { name: "rectangle", icon: Square, color: "text-blue-500" },
  { name: "diamond", icon: Diamond, color: "text-emerald-500" },
  { name: "ellipse", icon: Circle, color: "text-amber-500" },
  { name: "arrow", icon: ArrowRight, color: "text-violet-500" },
  { name: "line", icon: Minus, color: "text-pink-500" },
  { name: "freedraw", icon: Pencil, color: "text-orange-500" },
  { name: "text", icon: Type, color: "text-indigo-500" },
  { name: "image", icon: Image, color: "text-green-500" },
  { name: "eraser", icon: Eraser, color: "text-rose-500" },
];

// Bumps Excalidraw's internal versioning so external mutations are actually accepted
const bumpElement = (el: any, patch: Record<string, any>) => ({
  ...el,
  ...patch,
  version: (el.version || 0) + 1,
  versionNonce: Math.floor(Math.random() * 2 ** 31),
  updated: Date.now(),
});

function Whiteboard() {
  const { projectid } = useParams();
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const selectedElementRef = useRef<any>(null);
  const lockToggleRef = useRef(false);

  const [activeTool, setActiveTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<any>(null);
  const [lockedElements, setLockedElements] = useState<any[]>([]);
  const [showAISidebar, setShowAISidebar] = useState<boolean>(true);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  const handleExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    setExcalidrawAPI(api);
  }, []);

  const handleCanvasChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      setCanvasState(appState);
      setLockedElements(elements.filter((el) => el.locked));

      const selectedIds = Object.keys(appState.selectedElementIds || {});

      if (selectedIds.length === 1) {
        lockToggleRef.current = false;
        const element = elements.find((el) => el.id === selectedIds[0]);
        setSelectedElement(element);
      } else if (lockToggleRef.current && selectedElementRef.current) {
        // Locking deselects the element in Excalidraw — recover it by id so our panel stays open
        const stillExists = elements.find(
          (el) => el.id === selectedElementRef.current.id,
        );
        setSelectedElement(stillExists ?? null);
        lockToggleRef.current = false;
      } else {
        setSelectedElement(null);
      }

      if (saveTimeRef.current) clearTimeout(saveTimeRef.current);
      saveTimeRef.current = setTimeout(() => {
        // SaveCanvasChanges(elements, appState, files);
        // toast.add({
        //   type: "success",
        //   title: "Changes Saved"
        // })
      }, 10000);
    },
    [],
  );

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

  const handleUpdateElement = (patch: Record<string, any>) => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const updated = elements.map((el) =>
      el.id === selectedElement.id ? bumpElement(el, patch) : el,
    );
    // @ts-ignore
    excalidrawAPI.updateScene({ elements: updated });
    setSelectedElement((prev: any) => (prev ? bumpElement(prev, patch) : prev));
    setLockedElements(updated.filter((el) => el.locked));
  };

  const handleDeleteElement = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const updated = elements.filter((el) => el.id !== selectedElement.id);
    // @ts-ignore
    excalidrawAPI.updateScene({ elements: updated });
    setSelectedElement(null);
  };

  const handleDuplicateElement = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const clone = bumpElement(selectedElement, {
      id: `${selectedElement.id}-copy-${Date.now()}`,
      x: selectedElement.x + 16,
      y: selectedElement.y + 16,
    });
    // @ts-ignore
    excalidrawAPI.updateScene({ elements: [...elements, clone] });
  };

  const handleToggleLock = () => {
    if (!selectedElement) return;
    lockToggleRef.current = true; // tells handleCanvasChange to keep the panel open next tick
    handleUpdateElement({ locked: !selectedElement.locked });
  };

  const handleBringFront = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const rest = elements.filter((el) => el.id !== selectedElement.id);
    // @ts-ignore
    excalidrawAPI.updateScene({ elements: [...rest, selectedElement] });
  };

  const handleSendBack = () => {
    if (!excalidrawAPI || !selectedElement) return;
    const elements = excalidrawAPI.getSceneElements();
    const rest = elements.filter((el) => el.id !== selectedElement.id);
    // @ts-ignore
    excalidrawAPI.updateScene({ elements: [selectedElement, ...rest] });
  };

  const getFloatingPosition = () => {
    if (!selectedElement || !canvasState) {
      return { left: 0, top: 0 };
    }

    const zoom = canvasState.zoom?.value ?? 1;
    const scrollX = canvasState.scrollX ?? 0;
    const scrollY = canvasState.scrollY ?? 0;

    // Center of selected element
    const centerX = selectedElement.x + selectedElement.width / 2;

    // Convert Excalidraw coordinates into browser coordinates
    const screenX = (centerX + scrollX) * zoom;
    const screenY = (selectedElement.y + scrollY) * zoom;

    return {
      left: screenX,
      top: screenY - 44,
    };
  };

  const getElementScreenPosition = (el: any) => {
    if (!canvasState) return { left: 0, top: 0 };
    const zoom = canvasState.zoom?.value ?? 1;
    const scrollX = canvasState.scrollX ?? 0;
    const scrollY = canvasState.scrollY ?? 0;
    return {
      left: (el.x + el.width + scrollX) * zoom,
      top: (el.y + scrollY) * zoom,
    };
  };

  const floatingPosition = getFloatingPosition();

  return (
    <div style={{ height: "90vh" }}>
      <Excalidraw
        // @ts-ignore
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleCanvasChange}
      />

      <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white border p-1.5 shadow-xl">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              onClick={() => changeTool(tool.name)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition 
                hover:bg-primary/10 hover:cursor-pointer
                ${activeTool === tool.name ? "bg-primary/10" : null}
              `}
            >
              <Icon size={17} strokeWidth={3} className={tool.color} />
            </button>
          );
        })}
      </div>

      <FloatingProperties
        selectedElement={selectedElement}
        position={floatingPosition}
        onUpdateElement={handleUpdateElement}
        onDelete={handleDeleteElement}
        onDuplicate={handleDuplicateElement}
        onToggleLock={handleToggleLock}
        onBringFront={handleBringFront}
        onSendBack={handleSendBack}
      />

      {lockedElements
        .filter((el) => el.id !== selectedElement?.id)
        .map((el) => {
          const pos = getElementScreenPosition(el);
          return (
            <button
              key={el.id}
              onClick={() => setSelectedElement(el)}
              title="Locked — click to unlock"
              className="absolute z-[90] flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-md hover:bg-slate-50"
              style={{ left: pos.left - 14, top: pos.top - 14 }}
            >
              <Lock size={13} className="text-slate-500" />
            </button>
          );
        })}

      <div className="absolute right-15 bottom-3 z-50">
        <Button size="lg" onClick={() => setShowAISidebar(!showAISidebar)}>
          <Sparkles /> AI
        </Button>
      </div>

      {showAISidebar && <AIFloatingSidebar excalidrawApi={excalidrawAPI} />}
    </div>
  );
}

export default Whiteboard;
