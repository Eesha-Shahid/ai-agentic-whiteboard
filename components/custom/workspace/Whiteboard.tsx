import React from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
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
  HelpCircle,
  Image,
  Lock,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import FloatingProperties from "./FloatingProperties";
import AIFloatingSidebar from "./AIFloatingSidebar";
import FloatingActionBar from "./FloatingActionBar";
import { renderToStaticMarkup } from "react-dom/server";
import type { LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import HelpDialog from "./HelpDialog";

const TOOL_GROUPS = [
  {
    label: "Navigate",
    tools: [
      {
        name: "selection",
        icon: MousePointer2,
        color: "#8B5CF6",
        label: "Select",
        shortcut: "V",
      },
      {
        name: "hand",
        icon: Hand,
        color: "#06B6D4",
        label: "Pan",
        shortcut: "H",
      },
    ],
  },
  {
    label: "Shapes",
    tools: [
      {
        name: "rectangle",
        icon: Square,
        color: "#3B82F6",
        label: "Rectangle",
        shortcut: "R",
      },
      {
        name: "diamond",
        icon: Diamond,
        color: "#10B981",
        label: "Diamond",
        shortcut: "D",
      },
      {
        name: "ellipse",
        icon: Circle,
        color: "#F59E0B",
        label: "Ellipse",
        shortcut: "O",
      },
    ],
  },
  {
    label: "Draw",
    tools: [
      {
        name: "arrow",
        icon: ArrowRight,
        color: "#8B5CF6",
        label: "Arrow",
        shortcut: "A",
      },
      {
        name: "line",
        icon: Minus,
        color: "#EC4899",
        label: "Line",
        shortcut: "L",
      },
      {
        name: "freedraw",
        icon: Pencil,
        color: "#F97316",
        label: "Draw",
        shortcut: "P",
      },
    ],
  },
  {
    label: "Content",
    tools: [
      {
        name: "text",
        icon: Type,
        color: "#6366F1",
        label: "Text",
        shortcut: "T",
      },
      {
        name: "image",
        icon: Image,
        color: "#22C55E",
        label: "Image",
        shortcut: "I",
      },
      {
        name: "eraser",
        icon: Eraser,
        color: "#F43F5E",
        label: "Eraser",
        shortcut: "E",
      },
    ],
  },
];

const NOTE_STYLES: Record<
  "sticky" | "glass" | "task",
  {
    bg: string;
    border: string;
    badgeBg: string;
    fold: string;
    textColor: string;
    placeholder: string;
  }
> = {
  sticky: {
    bg: "#FFF7D6",
    border: "#F5C451",
    badgeBg: "#F59E0B",
    fold: "#F5E08A",
    textColor: "#7C4A03",
    placeholder: "New idea...",
  },
  glass: {
    bg: "#EFF6FF",
    border: "#93C5FD",
    badgeBg: "#4338CA",
    fold: "#C7D2FE",
    textColor: "#1D4ED8",
    placeholder: "Meeting notes...",
  },
  task: {
    bg: "#ECFDF5",
    border: "#6EE7B7",
    badgeBg: "#10B981",
    fold: "#A7F3D0",
    textColor: "#047857",
    placeholder: "☐ Task item...",
  },
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
  showAISidebar: boolean;
  onToggleAI: () => void;
};

function ToolButton({ tool, isActive, onClick, index }: any) {
  const Icon = tool.icon;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleMouseEnter = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleMouseLeave = () => setTooltipPos(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-transform duration-200 ease-out hover:scale-[1.12] active:scale-95"
      >
        {isActive && (
          <span
            className="absolute inset-0 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: `${tool.color}16`,
              boxShadow: `inset 0 0 0 1.5px ${tool.color}40`,
            }}
          />
        )}
        <Icon
          size={17}
          strokeWidth={isActive ? 2.6 : 2.2}
          className="relative z-10 transition-colors duration-200"
          style={{ color: isActive ? tool.color : "#6B7280" }}
        />
        {isActive && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white"
            style={{
              backgroundColor: tool.color,
              animation: "glowPulse 2s ease-in-out infinite",
            }}
          />
        )}
      </button>

      {tooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[200] flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            {tool.label}
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
              {tool.shortcut}
            </kbd>
            <div className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900" />
          </div>,
          document.body,
        )}
    </div>
  );
}

function ToolPalette({
  activeTool,
  changeTool,
}: {
  activeTool: string;
  changeTool: (t: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  let flatIndex = 0;

  return (
    <div
      className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl border border-gray-100 bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur-sm transition-all duration-300"
      style={{ animation: "fadeInUp 0.4s ease-out both" }}
    >
      <div
        className={`flex flex-col gap-1 p-1.5 transition-all duration-300 ${
          collapsed ? "h-[48px] overflow-hidden" : "h-auto overflow-visible"
        }`}
      >
        {TOOL_GROUPS.map((group, groupIndex) => (
          <div key={group.label}>
            {groupIndex > 0 && <div className="mx-1.5 my-1 h-px bg-gray-100" />}
            <div className="flex flex-col gap-1">
              {group.tools.map((tool) => {
                const i = flatIndex++;
                return (
                  <ToolButton
                    key={tool.name}
                    tool={tool}
                    isActive={activeTool === tool.name}
                    onClick={() => changeTool(tool.name)}
                    index={i}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex h-6 w-full cursor-pointer items-center justify-center overflow-hidden rounded-b-2xl border-t border-gray-50 text-gray-300 transition hover:bg-gray-50 hover:text-gray-500"
      >
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className="transition-transform duration-300"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function Whiteboard({
  onApiReady,
  onSaveReady,
  onSavingChange,
  showAISidebar,
  onToggleAI,
}: Props) {
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
  const [isSaving, setIsSaving] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
      const base64ImagePreview = await generatePreviewBase64();
      await axios.post("/api/whiteboard", {
        projectId: projectid,
        elements,
        appState,
        files,
        base64ImagePreview,
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

  const generatePreviewBase64 = async () => {
    if (!excalidrawAPI) return null;

    const elements = excalidrawAPI.getSceneElements();

    if (!elements.length) return null;

    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const blob = await exportToBlob({
      elements,
      appState: {
        ...appState,
        exportBackground: true,
        exportWithDarkMode: false,
      },
      files,
      mimeType: "image/webp",
      quality: 0.5,
      getDimensions: () => ({
        width: 400,
        height: 225,
        scale: 1,
      }),
    });

    return await blobToBase64(blob);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
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

    const { bg, border, badgeBg, textColor, placeholder } = NOTE_STYLES[type];
    const width = 240;
    const height = 200;
    const position = getNextPlacementPosition(width, height);
    const noteId = `note-${Date.now()}`;

    const noteElements = convertToExcalidrawElements([
      // Soft drop shadow behind the note
      {
        id: `${noteId}-shadow`,
        type: "rectangle",
        x: position.x + 4,
        y: position.y + 6,
        width,
        height,
        backgroundColor: "#00000010",
        strokeColor: "transparent",
        fillStyle: "solid",
        roughness: 0,
        roundness: { type: 3 },
      },
      // Main note body — label is a separate bound text with explicit padding
      // from the top-left, instead of relying on default container padding
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
      // Text placed as its own element, inset well clear of the rounded corner —
      // more reliable than a bound label's default padding
      {
        id: `${noteId}-text`,
        type: "text",
        x: position.x + 20,
        y: position.y + 22,
        text: placeholder,
        fontSize: 15,
        strokeColor: textColor,
        textAlign: "left",
      },
      // Small rounded tab/marker in the top-right — sits inside the note's
      // bounds with its own inset, rather than a dot that felt disconnected
      {
        id: `${noteId}-tab`,
        type: "rectangle",
        x: position.x + width - 44,
        y: position.y + 14,
        width: 28,
        height: 10,
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

      <ToolPalette activeTool={activeTool} changeTool={changeTool} />

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
              className="absolute z-[90] flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md transition hover:scale-110 hover:shadow-lg cursor-pointer"
              style={{ left: pos.left - 14, top: pos.top - 14 }}
            >
              <Lock size={13} className="text-[#4338CA]" />
            </button>
          );
        })}

      <FloatingActionBar
        onAddNote={addStickyElement}
        onAddEmoji={addEmojiElement}
        onAddIcon={addIconElement}
        showAISidebar={showAISidebar}
        onToggleAI={onToggleAI}
      />

      {showAISidebar && (
        <AIFloatingSidebar excalidrawApi={excalidrawAPI} onClose={onToggleAI} />
      )}

      <button
  onClick={() => setHelpOpen(true)}
  className="absolute bottom-6 right-6 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-[0_8px_20px_rgba(15,23,42,0.1)] transition hover:scale-105 hover:text-[#4338CA]"
>
  <HelpCircle size={18} />
</button>

<HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}

export default Whiteboard;
