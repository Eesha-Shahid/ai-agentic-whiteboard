"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  DownloadIcon,
  FileImage,
  FileJson,
  FileCode,
  Loader2,
  Maximize2,
  Palette,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ExportFormat = "png" | "svg" | "json";

const FORMATS: { id: ExportFormat; label: string; desc: string; icon: any }[] =
  [
    {
      id: "png",
      label: "PNG",
      desc: "Best for sharing images",
      icon: FileImage,
    },
    {
      id: "svg",
      label: "SVG",
      desc: "Scalable, editable vector",
      icon: FileCode,
    },
    {
      id: "json",
      label: "JSON",
      desc: "Raw scene data, re-importable",
      icon: FileJson,
    },
  ];

const SCALE_OPTIONS = [
  { value: 1, label: "1x", tag: "Standard" },
  { value: 2, label: "2x", tag: "Retina" },
  { value: 3, label: "3x", tag: "High-res" },
  { value: 4, label: "4x", tag: "Print" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-gradient-to-r from-[#4338CA] to-[#6366F1]" : "bg-gray-200"
      }`}
      style={{ minWidth: "44px" }}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ExportDialog({
  excalidrawApi,
  projectName,
  open,
  onOpenChange,
}: Props) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [scale, setScale] = useState(2);
  const [transparentBg, setTransparentBg] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fileName = (projectName || "whiteboard")
    .replace(/[^a-z0-9-_]/gi, "-")
    .toLowerCase();

  // Live dimension estimate based on the current scene's bounding box
  const dimensions = useMemo(() => {
    if (!excalidrawApi) return null;
    const elements = excalidrawApi
      .getSceneElements()
      .filter((el) => !el.isDeleted);
    if (!elements.length) return null;
    const minX = Math.min(...elements.map((el) => el.x));
    const minY = Math.min(...elements.map((el) => el.y));
    const maxX = Math.max(...elements.map((el) => el.x + el.width));
    const maxY = Math.max(...elements.map((el) => el.y + el.height));
    const width = Math.round((maxX - minX) * scale);
    const height = Math.round((maxY - minY) * scale);
    return { width, height };
  }, [excalidrawApi, scale, open]);

  const downloadBlob = (blob: Blob, extension: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!excalidrawApi) return;
    setIsExporting(true);

    try {
      const elements = excalidrawApi.getSceneElements();
      const appState = excalidrawApi.getAppState();
      const files = excalidrawApi.getFiles();

      if (format === "json") {
        const sceneData = JSON.stringify(
          {
            type: "excalidraw",
            version: 2,
            source: "whizboard",
            elements,
            appState,
            files,
          },
          null,
          2,
        );
        downloadBlob(
          new Blob([sceneData], { type: "application/json" }),
          "json",
        );
      } else if (format === "svg") {
        const { exportToSvg } = await import("@excalidraw/excalidraw");
        const svgElement = await exportToSvg({
          elements,
          appState: { ...appState, exportBackground: !transparentBg },
          files,
        });
        const svgString = new XMLSerializer().serializeToString(svgElement);
        downloadBlob(new Blob([svgString], { type: "image/svg+xml" }), "svg");
      } else {
        const { exportToBlob } = await import("@excalidraw/excalidraw");
        const blob = await exportToBlob({
          elements,
          appState: { ...appState, exportBackground: !transparentBg },
          files,
          mimeType: "image/png",
          quality: 1,
          getDimensions: (width: number, height: number) => ({
            width: width * scale,
            height: height * scale,
            scale,
          }),
        });
        downloadBlob(blob, "png");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const showRasterOptions = format === "png" || format === "svg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 sm:max-w-md"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] px-6 pb-5 pt-6">
          <div className="pointer-events-none absolute -right-16 -top-10 h-32 w-32 rounded-full bg-[#818CF8]/15 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[#FB7185]/10 blur-2xl" />

          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-gray-700"
          >
            <X size={16} />
          </button>

          <DialogHeader className="relative z-10">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_8px_20px_rgba(67,56,202,0.3)]">
              <DownloadIcon size={20} className="text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Export whiteboard
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Choose a format and quality for your download.
            </p>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* Format */}
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150",
                  format === f.id
                    ? "border-[#4338CA] bg-gradient-to-b from-[#EEF2FF] to-white shadow-sm"
                    : "border-gray-100 hover:border-gray-200",
                )}
              >
                <f.icon
                  size={20}
                  className={
                    format === f.id ? "text-[#4338CA]" : "text-gray-400"
                  }
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    format === f.id ? "text-[#4338CA]" : "text-gray-700",
                  )}
                >
                  {f.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            {FORMATS.find((f) => f.id === format)?.desc}
          </p>

          {showRasterOptions && (
            <>
              {format === "png" && (
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <Maximize2 size={12} />
                      Resolution
                    </label>
                    {dimensions && (
                      <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        {dimensions.width} × {dimensions.height}px
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SCALE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setScale(opt.value)}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border-2 py-2 transition-all duration-150",
                          scale === opt.value
                            ? "border-[#4338CA] bg-[#EEF2FF]"
                            : "border-gray-100 hover:border-gray-200",
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            scale === opt.value
                              ? "text-[#4338CA]"
                              : "text-gray-700",
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {opt.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 p-3.5 transition hover:border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4338CA]">
                    <Palette size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Transparent background
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Skip the canvas background color
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={transparentBg}
                  onChange={() => setTransparentBg((prev) => !prev)}
                />
              </div>
            </>
          )}

          {format === "json" && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-gray-50 p-3.5">
              <FileJson size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-xs text-gray-500">
                Exports the raw scene — elements, styling, and embedded files —
                as a JSON file that can be re-imported into any
                Excalidraw-compatible tool.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t bg-gray-50/60 px-6 py-4">
          <DialogClose
            className={buttonVariants({
              variant: "outline",
              className: "cursor-pointer",
            })}
          >
            Cancel
          </DialogClose>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="cursor-pointer gap-1.5 border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] shadow-[0_6px_16px_rgba(67,56,202,0.25)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isExporting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon size={15} />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog;
