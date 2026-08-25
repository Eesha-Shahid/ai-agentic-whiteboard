import React from "react";
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
import { toast } from "@/components/ui/toast";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import FloatingProperties from "./FloatingProperties";
import { Button } from "@/components/ui/button";
import AIFloatingSidebar from "./AIFloatingSidebar";
import FloatingActionBar from "./FloatingActionBar";
import { renderToStaticMarkup } from "react-dom/server";
import type { LucideIcon } from "lucide-react";

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

const NOTE_STYLES: Record<
  "sticky" | "glass" | "task",
  { bg: string; border: string; badgeBg: string }
> = {
  sticky: { bg: "#FFF7D6", border: "#F5C451", badgeBg: "#FFE6A3" },
  glass: { bg: "#EFF6FF", border: "#93C5FD", badgeBg: "#DBEAFE" },
  task: { bg: "#ECFDF5", border: "#6EE7B7", badgeBg: "#D1FAE5" },
};

// Bumps Excalidraw's internal versioning so external mutations are actually accepted
const bumpElement = (el: any, patch: Record<string, any>) => ({
  ...el,
  ...patch,
  version: (el.version || 0) + 1,
  versionNonce: Math.floor(Math.random() * 2 ** 31),
  updated: Date.now(),
});

type Props = {
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
  onSaveReady: (saveFn: () => void) => void;
  onSavingChange: (saving: boolean) => void;
};

function Whiteboard({ onApiReady, onSaveReady, onSavingChange }: Props) {
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
  const [showAISidebar, setShowAISidebar] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  useEffect(() => {
    onSavingChange(isSaving);
  }, [isSaving]);

  const handleExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      setExcalidrawAPI(api);
      onApiReady(api);
    },
    [onApiReady],
  );

  useEffect(() => {
    if (!excalidrawAPI) return;

    const manualSave = () => {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();
      SaveCanvasChanges(elements, appState, files);
    };

    onSaveReady(manualSave);
  }, [excalidrawAPI]);

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
    setIsSaving(true);
    try {
      await axios.post("/api/whiteboard", {
        projectId: projectid,
        elements,
        appState,
        files,
      });
      toast.add({ type: "success", title: "Changes Saved" });
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
      toast.add({
        type: "error",
        title: "Failed to save changes",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
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

  const getNextPlacementPosition = (width: number, height: number) => {
    if (!excalidrawAPI) return { x: 200, y: 200 };

    const elements = excalidrawAPI
      .getSceneElements()
      .filter((el) => !el.isDeleted);

    if (elements.length === 0) {
      return { x: 200, y: 200 };
    }

    // Place to the right of whatever's currently furthest right on the canvas
    const maxRight = Math.max(...elements.map((el) => el.x + el.width));
    const avgTop =
      elements.reduce((sum, el) => sum + el.y, 0) / elements.length;

    return {
      x: maxRight + 40, // gap between the previous item and the new one
      y: avgTop,
    };
  };

  const addStickyElement = (type: "sticky" | "glass" | "task") => {
    if (!excalidrawAPI) return;

    const { bg, border, badgeBg } = NOTE_STYLES[type];
    const width = 260;
    const height = 220;
    const position = getNextPlacementPosition(width, height);

    const noteId = `note-${Date.now()}`;

    const noteElements = convertToExcalidrawElements([
      {
        id: noteId,
        type: "rectangle",
        x: position.x,
        y: position.y,
        width,
        height,
        backgroundColor: bg,
        strokeColor: border,
        fillStyle: "solid",
        strokeWidth: 1.5,
        roughness: 0,
        roundness: { type: 3 },
      },
      {
        id: `${noteId}-badge`,
        type: "rectangle",
        x: position.x + 24,
        y: position.y + 24,
        width: 90,
        height: 32,
        backgroundColor: badgeBg,
        strokeColor: "transparent",
        fillStyle: "solid",
        roughness: 0,
        roundness: { type: 3 },
      },
    ]);

    const currentElements = excalidrawAPI.getSceneElements();
    excalidrawAPI.updateScene({
      elements: [...currentElements, ...noteElements],
    });
  };

  const addEmojiElement = (emoji: string) => {
    if (!excalidrawAPI) return;

    const position = getNextPlacementPosition(60, 60); // rough emoji footprint

    const emojiElements = convertToExcalidrawElements([
      {
        id: `emoji-${Date.now()}`,
        type: "text",
        x: position.x,
        y: position.y,
        text: emoji,
        fontSize: 48,
      },
    ]);

    const currentElements = excalidrawAPI.getSceneElements();
    excalidrawAPI.updateScene({
      elements: [...currentElements, ...emojiElements],
    });
  };

  const addIconElement = async (
    iconName: string,
    IconComponent: LucideIcon,
    color: string,
  ) => {
    if (!excalidrawAPI) return;

    const size = 64;

    const innerSvg = renderToStaticMarkup(
      React.createElement(IconComponent, {
        size,
        strokeWidth: 2,
        color,
      }),
    );

    const innerContentMatch = innerSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    const innerContent = innerContentMatch ? innerContentMatch[1] : "";

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${innerContent}</svg>`;

    // Base64-encode via TextEncoder first, so btoa never chokes on
    // any character outside its Latin1-only range
    const utf8ToBase64 = (str: string) => {
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    };

    const dataUrl = `data:image/svg+xml;base64,${utf8ToBase64(fullSvg)}`;

    const fileId = `icon-${iconName}-${Date.now()}` as any;
    const position = getNextPlacementPosition(size, size);

    const imageElements = convertToExcalidrawElements([
      {
        id: `icon-el-${Date.now()}`,
        type: "image",
        x: position.x,
        y: position.y,
        width: size,
        height: size,
        fileId,
      },
    ]);

    const currentElements = excalidrawAPI.getSceneElements();

    excalidrawAPI.addFiles([
      {
        id: fileId,
        dataURL: dataUrl as any,
        mimeType: "image/svg+xml",
        created: Date.now(),
      },
    ]);

    excalidrawAPI.updateScene({
      elements: [...currentElements, ...imageElements],
    });
  };

  return (
    <div style={{ height: "93vh" }}>
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

      <div className="absolute right-15 bottom-6 z-50">
        <Button
          className="cursor-pointer"
          size="lg"
          onClick={() => setShowAISidebar(!showAISidebar)}
        >
          <Sparkles /> AI
        </Button>
      </div>

      <FloatingActionBar
        onAddNote={addStickyElement}
        onAddEmoji={addEmojiElement}
        onAddIcon={addIconElement}
        showAISidebar={showAISidebar}
        onToggleAI={() => setShowAISidebar((prev) => !prev)}
      />

      {showAISidebar && (
        <AIFloatingSidebar
          excalidrawApi={excalidrawAPI}
          onClose={() => setShowAISidebar(!showAISidebar)}
        />
      )}
    </div>
  );
}

export default Whiteboard;
