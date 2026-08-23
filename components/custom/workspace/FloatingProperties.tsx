"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  ArrowUpToLine,
  ArrowDownToLine,
  Check,
  Circle,
  Copy,
  Diamond,
  Droplet,
  GripVertical,
  Image as ImageIcon,
  Lock,
  Minus,
  MoreHorizontal,
  Palette,
  Pencil,
  Square,
  Trash2,
  Type,
  Unlock,
  X,
} from "lucide-react";

type Props = {
  selectedElement: any;
  position: { left: number; top: number };
  onUpdateElement: (patch: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onBringFront: () => void;
  onSendBack: () => void;
};

const COLORS = ["#1e1e1e", "#e03131", "#f08c00", "#2f9e44", "#1971c2", "#7048e8"];
const STROKE_WIDTHS = [
  { label: "Thin", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Bold", value: 4 },
];

const TYPE_ICON: Record<string, any> = {
  rectangle: Square,
  ellipse: Circle,
  diamond: Diamond,
  text: Type,
  line: Minus,
  arrow: ArrowRight,
  freedraw: Pencil,
  image: ImageIcon,
};

function FloatingProperties({
  selectedElement,
  position,
  onUpdateElement,
  onDelete,
  onDuplicate,
  onToggleLock,
  onBringFront,
  onSendBack,
}: Props) {
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setOpenPanel(null);
  }, [selectedElement?.id]);

  if (!selectedElement) return null;

  const type = selectedElement.type;
  const TypeIcon = TYPE_ICON[type] ?? Square;

  // --- Locked elements: access only, nothing editable ---
  if (selectedElement.locked) {
    return (
      <div
        className="absolute z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full border bg-white px-2 py-1 shadow-xl"
        style={{ left: position.left, top: position.top }}
      >
        <div className="flex h-8 w-8 items-center justify-center text-slate-500" title={type}>
          <TypeIcon size={16} />
        </div>
        <ToolbarDivider />
        <button
          onClick={onToggleLock}
          title="Unlock"
          className="flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Lock size={15} /> Unlocked
        </button>
      </div>
    );
  }

  const isText = type === "text";
  const isShape = ["rectangle", "ellipse", "diamond"].includes(type);
  const isLineOrArrow = type === "line" || type === "arrow";
  const isFreeDraw = type === "freedraw";
  const isImage = type === "image";

  const toggle = (panel: string) => setOpenPanel((p) => (p === panel ? null : panel));

  // --- Drag handling ---
  const handleDragStart = (e: React.MouseEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: dragOffset.x, originY: dragOffset.y };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
  };
  const handleDragMove = (e: MouseEvent) => {
    if (!dragState.current) return;
    const { startX, startY, originX, originY } = dragState.current;
    setDragOffset({ x: originX + (e.clientX - startX), y: originY + (e.clientY - startY) });
  };
  const handleDragEnd = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
  };

  return (
    <div
      className="absolute z-[100] flex -translate-x-1/2 items-center gap-0.5 rounded-full border bg-white px-1 py-1 shadow-xl"
      style={{ left: position.left + dragOffset.x, top: position.top + dragOffset.y }}
    >
      <button
        onMouseDown={handleDragStart}
        title="Drag toolbar"
        className="flex h-8 w-6 cursor-grab items-center justify-center text-slate-400 active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex h-8 w-8 items-center justify-center text-slate-700" title={type}>
        <TypeIcon size={16} />
      </div>

      {/* ---------- Text: color + alignment ---------- */}
      {isText && (
        <>
          <div className="relative">
            <button onClick={() => toggle("textColor")} title="Text color" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
              <ToolbarIconWithBar icon={Palette} color={selectedElement.strokeColor || "#1e1e1e"} barWidth="thick" />
            </button>
            {openPanel === "textColor" && (
              <ColorPopover label="Text color" colors={COLORS} active={selectedElement.strokeColor} onSelect={(c) => onUpdateElement({ strokeColor: c })} shape="circle" />
            )}
          </div>

          <div className="relative">
            <button onClick={() => toggle("align")} title="Text alignment" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
              <AlignCenter size={17} />
            </button>
            {openPanel === "align" && (
              <div className="absolute left-1/2 top-10 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-white p-1 shadow-xl">
                <button title="Align left" onClick={() => onUpdateElement({ textAlign: "left" })} className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedElement.textAlign === "left" ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100"}`}>
                  <AlignLeft size={16} />
                </button>
                <button title="Align center" onClick={() => onUpdateElement({ textAlign: "center" })} className={`flex h-8 w-8 items-center justify-center rounded-full ${(!selectedElement.textAlign || selectedElement.textAlign === "center") ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100"}`}>
                  <AlignCenter size={16} />
                </button>
                <button title="Align right" onClick={() => onUpdateElement({ textAlign: "right" })} className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedElement.textAlign === "right" ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100"}`}>
                  <AlignRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------- Shape: stroke + fill ---------- */}
      {isShape && (
        <>
          <div className="relative">
            <button onClick={() => toggle("stroke")} title="Stroke color" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
              <ToolbarIconWithBar icon={Palette} color={selectedElement.strokeColor || "#1e1e1e"} barWidth="thick" />
            </button>
            {openPanel === "stroke" && (
              <ColorPopover label="Stroke color" colors={COLORS} active={selectedElement.strokeColor} onSelect={(c) => onUpdateElement({ strokeColor: c })} shape="circle" />
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggle("fill")} title="Fill color" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
              <ToolbarIconWithBar
                icon={Droplet}
                color={selectedElement.backgroundColor && selectedElement.backgroundColor !== "transparent" ? selectedElement.backgroundColor : "#94a3b8"}
                barWidth="thin"
              />
            </button>
            {openPanel === "fill" && (
              <ColorPopover
                label="Fill color"
                colors={COLORS}
                active={selectedElement.backgroundColor}
                onSelect={(c) => onUpdateElement({ backgroundColor: c })}
                showNoFill
                onNoFill={() => onUpdateElement({ backgroundColor: "transparent" })}
                shape="square"
              />
            )}
          </div>
        </>
      )}

      {/* ---------- Line / Arrow / Freedraw: stroke color + width ---------- */}
      {(isLineOrArrow || isFreeDraw) && (
        <>
          <div className="relative">
            <button onClick={() => toggle("stroke")} title="Stroke color" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
              <ToolbarIconWithBar icon={Palette} color={selectedElement.strokeColor || "#1e1e1e"} barWidth="thick" />
            </button>
            {openPanel === "stroke" && (
              <ColorPopover label="Stroke color" colors={COLORS} active={selectedElement.strokeColor} onSelect={(c) => onUpdateElement({ strokeColor: c })} shape="circle" />
            )}
          </div>
          <div className="relative">
            <button onClick={() => toggle("width")} title="Stroke width" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
              <Minus size={17} />
            </button>
            {openPanel === "width" && (
              <div className="absolute left-1/2 top-10 z-50 w-52 -translate-x-1/2 rounded-xl border bg-white p-3 shadow-xl">
                <p className="mb-2 text-xs font-medium text-slate-500">Stroke width</p>
                <div className="flex gap-2">
                  {STROKE_WIDTHS.map((w) => (
                    <button
                      key={w.value}
                      title={w.label}
                      onClick={() => onUpdateElement({ strokeWidth: w.value })}
                      className={`flex h-9 flex-1 items-center justify-center rounded-lg border ${
                        (selectedElement.strokeWidth || 2) === w.value ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-8 border-t-2 border-slate-700" style={{ borderTopWidth: w.value }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Image gets no color/width controls */}

      <ToolbarDivider />

      <button onClick={onDuplicate} title="Duplicate" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
        <Copy size={16} />
      </button>
      <button onClick={onToggleLock} title={selectedElement.locked ? "Unlock" : "Lock"} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
        {selectedElement.locked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>
      <button onClick={onDelete} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50">
        <Trash2 size={16} />
      </button>

      <ToolbarDivider />

      <div className="relative">
        <button onClick={() => toggle("more")} title="More options" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
          <MoreHorizontal size={16} />
        </button>
        {openPanel === "more" && (
          <MorePanel
            type={type}
            selectedElement={selectedElement}
            onUpdateElement={onUpdateElement}
            onBringFront={onBringFront}
            onSendBack={onSendBack}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </div>
    </div>
  );
}

// --- "More" panel router ---

function MorePanel({
  type,
  selectedElement,
  onUpdateElement,
  onBringFront,
  onSendBack,
  onClose,
}: {
  type: string;
  selectedElement: any;
  onUpdateElement: (patch: Record<string, any>) => void;
  onBringFront: () => void;
  onSendBack: () => void;
  onClose: () => void;
}) {
  if (type === "text") {
    return (
      <MorePanelShell title="Text options" onClose={onClose} onBringFront={onBringFront} onSendBack={onSendBack} opacity={selectedElement.opacity ?? 100} onOpacityChange={(v) => onUpdateElement({ opacity: v })}>
        <div className="mb-4">
          <PropertyLabel>Font</PropertyLabel>
          <div className="mt-1.5 flex gap-2">
            <FontPill label="Hand" active={selectedElement.fontFamily === 1} onClick={() => onUpdateElement({ fontFamily: 1 })} />
            <FontPill label="Normal" active={selectedElement.fontFamily === 2} onClick={() => onUpdateElement({ fontFamily: 2 })} />
            <FontPill label="Mono" active={selectedElement.fontFamily === 3} onClick={() => onUpdateElement({ fontFamily: 3 })} />
          </div>
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <PropertyLabel>Size</PropertyLabel>
            <select
              value={selectedElement.fontSize || 20}
              onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm"
            >
              {[16, 20, 24, 28, 36, 48].map((s) => (
                <option key={s} value={s}>{s} px</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <PropertyLabel>Alignment</PropertyLabel>
            <div className="mt-1.5 flex gap-1">
              <AlignBtn active={selectedElement.textAlign === "left"} onClick={() => onUpdateElement({ textAlign: "left" })}><AlignLeft size={15} /></AlignBtn>
              <AlignBtn active={!selectedElement.textAlign || selectedElement.textAlign === "center"} onClick={() => onUpdateElement({ textAlign: "center" })}><AlignCenter size={15} /></AlignBtn>
              <AlignBtn active={selectedElement.textAlign === "right"} onClick={() => onUpdateElement({ textAlign: "right" })}><AlignRight size={15} /></AlignBtn>
            </div>
          </div>
        </div>
        <div>
          <PropertyLabel>Text color</PropertyLabel>
          <div className="mt-1.5 flex gap-1.5">
            {COLORS.map((c) => (
              <ColorSquare key={c} backgroundColor={c} active={selectedElement.strokeColor === c} onClick={() => onUpdateElement({ strokeColor: c })} shape="circle" />
            ))}
          </div>
        </div>
      </MorePanelShell>
    );
  }

  if (["rectangle", "ellipse", "diamond"].includes(type)) {
    return (
      <MorePanelShell title="Shape options" onClose={onClose} onBringFront={onBringFront} onSendBack={onSendBack} opacity={selectedElement.opacity ?? 100} onOpacityChange={(v) => onUpdateElement({ opacity: v })}>
        <StrokeSection selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
        <SectionDivider />
        <div>
          <PropertyLabel>Fill</PropertyLabel>
          <div className="mt-1.5 flex items-center gap-1.5">
            {COLORS.map((c) => (
              <ColorSquare key={c} backgroundColor={c} active={selectedElement.backgroundColor === c} onClick={() => onUpdateElement({ backgroundColor: c })} shape="square" />
            ))}
            <button onClick={() => onUpdateElement({ backgroundColor: "transparent" })} title="No fill" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-slate-400 hover:bg-slate-50">
              <X size={14} />
            </button>
          </div>
        </div>
      </MorePanelShell>
    );
  }

  if (type === "line" || type === "arrow" || type === "freedraw") {
    const title = type === "line" ? "Line options" : type === "arrow" ? "Arrow options" : "Drawing options";
    return (
      <MorePanelShell title={title} onClose={onClose} onBringFront={onBringFront} onSendBack={onSendBack} opacity={selectedElement.opacity ?? 100} onOpacityChange={(v) => onUpdateElement({ opacity: v })}>
        <StrokeSection selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
        <SectionDivider />
        <div>
          <PropertyLabel>Color</PropertyLabel>
          <div className="mt-1.5 flex gap-1.5">
            {COLORS.map((c) => (
              <ColorSquare key={c} backgroundColor={c} active={selectedElement.strokeColor === c} onClick={() => onUpdateElement({ strokeColor: c })} shape="circle" />
            ))}
          </div>
        </div>
      </MorePanelShell>
    );
  }

  if (type === "image") {
    return (
      <MorePanelShell title="Image options" onClose={onClose} onBringFront={onBringFront} onSendBack={onSendBack} opacity={selectedElement.opacity ?? 100} onOpacityChange={(v) => onUpdateElement({ opacity: v })} />
    );
  }

  return null;
}

// --- Shared "Stroke" section (style + width + edge style) used by shape/line/arrow/freedraw ---

function StrokeSection({ selectedElement, onUpdateElement }: { selectedElement: any; onUpdateElement: (p: Record<string, any>) => void }) {
  const strokeStyle = selectedElement.strokeStyle || "solid";
  const strokeWidth = selectedElement.strokeWidth || 2;
  const roughness = selectedElement.roughness ?? 1;

  return (
    <div className="mb-1">
      <div className="mb-1.5 flex items-center justify-between">
        <PropertyLabel>Stroke</PropertyLabel>
        <span className="text-[11px] text-slate-400">Style & width</span>
      </div>
      <div className="mb-2 flex gap-2">
        <StrokeStyle styleType="solid" selected={strokeStyle === "solid"} onClick={() => onUpdateElement({ strokeStyle: "solid" })} />
        <StrokeStyle styleType="dashed" selected={strokeStyle === "dashed"} onClick={() => onUpdateElement({ strokeStyle: "dashed" })} />
        <StrokeStyle styleType="dotted" selected={strokeStyle === "dotted"} onClick={() => onUpdateElement({ strokeStyle: "dotted" })} />
      </div>
      <select
        value={strokeWidth}
        onChange={(e) => onUpdateElement({ strokeWidth: Number(e.target.value) })}
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
      >
        <option value={1}>1 px — Thin</option>
        <option value={2}>2 px — Medium</option>
        <option value={4}>4 px — Bold</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={() => onUpdateElement({ roughness: 0 })}
          className={`flex-1 rounded-lg border py-2 text-xs ${roughness === 0 ? "border-blue-400 bg-blue-50 text-blue-600 font-medium" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Sharp
        </button>
        <button
          onClick={() => onUpdateElement({ roughness: 1 })}
          className={`flex-1 rounded-lg border py-2 text-xs ${roughness !== 0 ? "border-blue-400 bg-blue-50 text-blue-600 font-medium" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Hand drawn
        </button>
      </div>
    </div>
  );
}

// --- Shell shared by every "more" panel: header, layer controls, children, opacity ---

function MorePanelShell({
  title,
  onClose,
  onBringFront,
  onSendBack,
  opacity,
  onOpacityChange,
  children,
}: {
  title: string;
  onClose: () => void;
  onBringFront: () => void;
  onSendBack: () => void;
  opacity: number;
  onOpacityChange: (v: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={onBringFront} title="Bring to front" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs text-slate-500 hover:bg-slate-50">
          <ArrowUpToLine size={13} /> Bring front
        </button>
        <button onClick={onSendBack} title="Send to back" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs text-slate-500 hover:bg-slate-50">
          <ArrowDownToLine size={13} /> Send back
        </button>
      </div>

      <SectionDivider />

      {children && (
        <>
          {children}
          <SectionDivider />
        </>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <PropertyLabel>Opacity</PropertyLabel>
          <span className="text-[11px] text-slate-500">{opacity}%</span>
        </div>
        <input type="range" min={0} max={100} value={opacity} onChange={(e) => onOpacityChange(Number(e.target.value))} className="w-full" />
      </div>
    </div>
  );
}

// --- Small reusable pieces ---

function ToolbarIconWithBar({
  icon: Icon,
  color,
  barWidth,
}: {
  icon: any;
  color: string;
  barWidth: "thick" | "thin";
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={17} className="text-slate-600" />
      <span
        className={`rounded-full ${barWidth === "thick" ? "h-[3px] w-4" : "h-[2px] w-3"}`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function ColorPopover({
  label,
  colors,
  active,
  onSelect,
  showNoFill,
  onNoFill,
  shape = "circle",
}: {
  label: string;
  colors: string[];
  active: string;
  onSelect: (c: string) => void;
  showNoFill?: boolean;
  onNoFill?: () => void;
  shape?: "circle" | "square";
}) {
  return (
    <div className="absolute left-1/2 top-10 z-50 w-max -translate-x-1/2 rounded-xl border bg-white p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex gap-2">
        {colors.map((c) => (
          <ColorSquare key={c} backgroundColor={c} active={active === c} onClick={() => onSelect(c)} shape={shape} />
        ))}
      </div>
      {showNoFill && (
        <button onClick={onNoFill} className="mt-3 w-full rounded-lg border py-1.5 text-xs text-slate-500 hover:bg-slate-50">
          No fill
        </button>
      )}
    </div>
  );
}

function ColorSquare({
  backgroundColor,
  active,
  onClick,
  shape = "circle",
}: {
  backgroundColor: string;
  active: boolean;
  onClick: () => void;
  shape?: "circle" | "square";
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-8 w-8 shrink-0 aspect-square items-center justify-center border-2 transition hover:scale-110 ${
        shape === "circle" ? "rounded-full" : "rounded-lg"
      } ${active ? "border-blue-500" : "border-slate-200"}`}
      style={{ backgroundColor }}
    >
      {active && <Check size={12} className="text-white" />}
    </button>
  );
}

function StrokeStyle({ selected, styleType, onClick }: { styleType: "solid" | "dashed" | "dotted"; selected?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} title={styleType} className={`flex h-9 flex-1 items-center justify-center rounded-lg border transition ${selected ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
      <div className={`w-8 border-t-2 border-slate-600 ${styleType === "solid" ? "border-solid" : styleType === "dashed" ? "border-dashed" : "border-dotted"}`} />
    </button>
  );
}

function FontPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex-1 rounded-full border py-2 text-xs ${active ? "border-blue-400 bg-blue-50 text-blue-600 font-medium" : "text-slate-500 hover:bg-slate-50"}`}>
      {label}
    </button>
  );
}

function AlignBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex h-9 flex-1 items-center justify-center rounded-lg border ${active ? "border-blue-400 bg-blue-50 text-blue-600" : "border-slate-200 hover:bg-slate-50"}`}>
      {children}
    </button>
  );
}

function PropertyLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold text-slate-500">{children}</span>;
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-6 w-px bg-slate-200" />;
}

function SectionDivider() {
  return <div className="my-3 h-px w-full bg-slate-100" />;
}

export default FloatingProperties;