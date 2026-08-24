"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bot, MessageSquare, Search, Sticker } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

type Props = {
  onAddNote: (type: "sticky" | "glass" | "task") => void;
  onAddEmoji: (emoji: string) => void;
  onAddIcon: (iconName: string, icon: LucideIcon, color: string) => void;
  showAISidebar: boolean;
  onToggleAI: () => void;
};

const NOTE_OPTIONS = [
  {
    type: "sticky" as const,
    label: "Sticky Note",
    desc: "Warm idea card",
    bg: "#FFF7D6",
    border: "#F5C451",
    badgeBg: "#FFE6A3",
    badgeText: "#7C4A03",
    barColor: "#F59E0B",
    rotate: "-rotate-2",
  },
  {
    type: "glass" as const,
    label: "Glass Note",
    desc: "Polished meeting note",
    bg: "#EFF6FF",
    border: "#93C5FD",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
    barColor: "#2563EB",
    rotate: "rotate-1",
  },
  {
    type: "task" as const,
    label: "Task Card",
    desc: "Structured checklist tile",
    bg: "#ECFDF5",
    border: "#6EE7B7",
    badgeBg: "#D1FAE5",
    badgeText: "#047857",
    barColor: "#10B981",
    rotate: "-rotate-1",
  },
];

// --- Build the full Lucide icon list dynamically ---
const kebabToPascal = (kebab: string) =>
  kebab
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

const kebabToDisplay = (kebab: string) => {
  const words = kebab.split("-");
  const parts: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);

    // Single-letter segments (e.g. "a" in "a-arrow-down") glue onto the next word
    if (word.length === 1 && i + 1 < words.length) {
      const next = words[i + 1];
      parts.push(capitalized + next.charAt(0).toUpperCase() + next.slice(1));
      i++; // skip the next word since it's now merged in
    } else {
      parts.push(capitalized);
    }
  }

  return parts.join(" ");
};

const ALL_ICONS: { key: string; name: string; icon: LucideIcon }[] =
  Object.keys(dynamicIconImports)
    .map((kebabName) => {
      const pascalName = kebabToPascal(kebabName);
      const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[
        pascalName
      ];
      if (!icon) return null;
      return { key: kebabName, name: kebabToDisplay(kebabName), icon };
    })
    .filter(
      (entry): entry is { key: string; name: string; icon: LucideIcon } =>
        entry !== null,
    )
    .sort((a, b) => a.name.localeCompare(b.name));

// Wider palette so the color cycle doesn't visibly repeat every 4 icons
const ICON_COLORS = [
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EF4444", // red
  "#06B6D4", // cyan
  "#10B981", // green
  "#F97316", // orange
  "#14B8A6", // teal
  "#6366F1", // indigo
];

const INITIAL_ICON_COUNT = 80;

function FloatingActionBar({
  onAddNote,
  onAddEmoji,
  onAddIcon,
  showAISidebar,
  onToggleAI,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "emoji">("notes");
  const [emojiTab, setEmojiTab] = useState<"emoji" | "icons">("emoji");
  const [iconSearch, setIconSearch] = useState("");

  const [visibleCount, setVisibleCount] = useState(INITIAL_ICON_COUNT);

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) {
      return ALL_ICONS.slice(0, visibleCount);
    }
    return ALL_ICONS.filter((item) =>
      item.name.toLowerCase().includes(iconSearch.toLowerCase()),
    );
  }, [iconSearch, visibleCount]);

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom && !iconSearch.trim()) {
      setVisibleCount((prev) => Math.min(prev + 80, ALL_ICONS.length));
    }
  };

  const openTab = (tab: "notes" | "emoji") => {
    if (open && activeTab === tab) {
      setOpen(false);
    } else {
      setActiveTab(tab);
      setOpen(true);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onAddEmoji(emojiData.emoji);
    setOpen(false);
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-[90] -translate-x-1/2 px-2">
      <div className="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="flex items-center justify-center gap-1.5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              onClick={() => openTab("notes")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition text-gray-700 cursor-pointer ${
                open && activeTab === "notes"
                  ? "bg-muted"
                  : "hover:bg-amber-50 hover:text-pink-700 "
              }`}
            >
              <MessageSquare size={18} strokeWidth={2} />
              Notes
            </PopoverTrigger>

            <PopoverTrigger
              onClick={() => openTab("emoji")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition text-gray-700 cursor-pointer ${
                open && activeTab === "emoji"
                  ? "bg-muted"
                  : "hover:bg-pink-50 hover:text-pink-700 "
              }`}
            >
              <Sticker size={18} strokeWidth={2} />
              Emoji
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="center"
              sideOffset={16}
              className={`rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.18)] ${
                activeTab === "notes" ? "w-[340px] p-4" : "w-[380px] p-3"
              }`}
            >
              {activeTab === "notes" ? (
                <>
                  <PopoverHeader>
                    <PopoverTitle className="text-base text-gray-900">
                      Add notes
                    </PopoverTitle>
                    <PopoverDescription className="text-xs text-gray-500">
                      Pick a blank note style for the whiteboard.
                    </PopoverDescription>
                  </PopoverHeader>

                  <div className="mt-3 grid gap-3">
                    {NOTE_OPTIONS.map((note) => (
                      <button
                        key={note.type}
                        onClick={() => {
                          onAddNote(note.type);
                          setOpen(false);
                        }}
                        className="group flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <div
                          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border p-3 shadow-sm transition group-hover:scale-[1.02] ${note.rotate}`}
                          style={{
                            backgroundColor: note.bg,
                            borderColor: note.border,
                          }}
                        >
                          <div
                            className="mb-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold"
                            style={{
                              backgroundColor: note.badgeBg,
                              color: note.badgeText,
                            }}
                          >
                            New
                          </div>
                          <div className="space-y-1.5">
                            <div
                              className="h-2.5 w-12 rounded-full"
                              style={{ backgroundColor: note.barColor }}
                            />
                            <div className="h-2 w-14 rounded-full bg-white/80" />
                            <div className="h-2 w-10 rounded-full bg-white/70" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {note.label}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {note.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <PopoverHeader>
                    <PopoverTitle className="text-base text-gray-900">
                      Emoji and icons
                    </PopoverTitle>
                    <PopoverDescription className="text-xs text-gray-500">
                      Choose from the picker or scroll the icon library.
                    </PopoverDescription>
                  </PopoverHeader>

                  <Tabs
                    value={emojiTab}
                    onValueChange={(v) => setEmojiTab(v as "emoji" | "icons")}
                    className="mt-3"
                  >
                    <TabsList className="w-full rounded-2xl bg-gray-100 p-1">
                      <TabsTrigger
                        value="emoji"
                        className="rounded-xl text-xs font-medium cursor-pointer"
                      >
                        Emoji
                      </TabsTrigger>
                      <TabsTrigger
                        value="icons"
                        className="rounded-xl text-xs font-medium cursor-pointer"
                      >
                        Icons
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="emoji" className="mt-0">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width="100%"
                        height={380}
                        searchDisabled={false}
                        previewConfig={{ showPreview: false }}
                      />
                    </TabsContent>

                    <TabsContent value="icons" className="mt-0">
                      <div className="relative mb-3">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder="Search"
                          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm outline-none focus:border-gray-300 focus:bg-white"
                        />
                      </div>

                      <div
                        onScroll={handleGridScroll}
                        className="grid max-h-[380px] grid-cols-4 gap-2 overflow-y-auto pr-1"
                      >
                        {filteredIcons.map((item, index) => {
                          const Icon = item.icon;
                          const color = ICON_COLORS[index % ICON_COLORS.length];

                          return (
                            <button
                              key={item.key}
                              type="button"
                              title={item.name}
                              onClick={() => {
                                onAddIcon(item.name, item.icon, color);
                                setOpen(false);
                              }}
                              className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white p-2 text-center transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                            >
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${color}1a`, color }}
                              >
                                <Icon size={19} strokeWidth={2.6} />
                              </div>
                              <span className="max-w-full truncate text-[11px] font-medium text-gray-600">
                                {item.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </PopoverContent>
          </Popover>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          <Button
            className="h-10 rounded-xl px-4 text-sm font-semibold shadow-sm transition bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700 cursor-pointer"
            onClick={onToggleAI}
          >
            <Bot size={18} strokeWidth={2} />
            AI Helper
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FloatingActionBar;
