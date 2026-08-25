"use client";
import { useEffect, useMemo, useState } from "react";
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
import { Bot, Clock, MessageSquare, Search, Sparkles, Sticker } from "lucide-react";
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
  { type: "sticky" as const, label: "Sticky Note", desc: "Warm idea card", bg: "#FFF7D6", fold: "#F5E08A", border: "#F5C451", barColor: "#F59E0B" },
  { type: "glass" as const, label: "Glass Note", desc: "Polished meeting note", bg: "#EEF2FF", fold: "#C7D2FE", border: "#93C5FD", barColor: "#4338CA" },
  { type: "task" as const, label: "Task Card", desc: "Structured checklist tile", bg: "#ECFDF5", fold: "#A7F3D0", border: "#6EE7B7", barColor: "#10B981" },
];

const kebabToPascal = (kebab: string) => kebab.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
const kebabToDisplay = (kebab: string) => {
  const words = kebab.split("-");
  const parts: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    if (word.length === 1 && i + 1 < words.length) {
      const next = words[i + 1];
      parts.push(capitalized + next.charAt(0).toUpperCase() + next.slice(1));
      i++;
    } else {
      parts.push(capitalized);
    }
  }
  return parts.join(" ");
};

const ALL_ICONS: { key: string; name: string; icon: LucideIcon }[] = Object.keys(dynamicIconImports)
  .map((kebabName) => {
    const pascalName = kebabToPascal(kebabName);
    const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalName];
    if (!icon) return null;
    return { key: kebabName, name: kebabToDisplay(kebabName), icon };
  })
  .filter((entry): entry is { key: string; name: string; icon: LucideIcon } => entry !== null)
  .sort((a, b) => a.name.localeCompare(b.name));

const ICON_COLORS = ["#4338CA", "#6366F1", "#FB7185", "#818CF8", "#F59E0B", "#10B981", "#EC4899", "#06B6D4"];
const INITIAL_ICON_COUNT = 80;
const RECENT_ICONS_KEY = "whizboard-recent-icons";

// Quick-browse categories — filters the search box, no need to know exact names
const ICON_CATEGORIES = [
  { label: "Arrows", query: "arrow" },
  { label: "UI", query: "square" },
  { label: "Shapes", query: "circle" },
  { label: "People", query: "user" },
  { label: "Files", query: "file" },
  { label: "Charts", query: "chart" },
];

function FloatingActionBar({ onAddNote, onAddEmoji, onAddIcon, showAISidebar, onToggleAI }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "emoji">("notes");
  const [emojiTab, setEmojiTab] = useState<"emoji" | "icons">("emoji");
  const [iconSearch, setIconSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ICON_COUNT);
  const [recentIcons, setRecentIcons] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RECENT_ICONS_KEY);
      if (stored) setRecentIcons(JSON.parse(stored));
    } catch {}
  }, []);

  const recentIconItems = useMemo(
    () => recentIcons.map((key) => ALL_ICONS.find((i) => i.key === key)).filter((i): i is (typeof ALL_ICONS)[number] => !!i),
    [recentIcons],
  );

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICONS.slice(0, visibleCount);
    return ALL_ICONS.filter((item) => item.name.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch, visibleCount]);

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom && !iconSearch.trim()) {
      setVisibleCount((prev) => Math.min(prev + 80, ALL_ICONS.length));
    }
  };

  const openTab = (tab: "notes" | "emoji") => {
    if (open && activeTab === tab) setOpen(false);
    else {
      setActiveTab(tab);
      setOpen(true);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onAddEmoji(emojiData.emoji);
    setOpen(false);
  };

  const handleIconPick = (item: (typeof ALL_ICONS)[number], color: string) => {
    onAddIcon(item.name, item.icon, color);
    const updated = [item.key, ...recentIcons.filter((k) => k !== item.key)].slice(0, 8);
    setRecentIcons(updated);
    try {
      sessionStorage.setItem(RECENT_ICONS_KEY, JSON.stringify(updated));
    } catch {}
    setOpen(false);
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-[90] -translate-x-1/2 px-2">
      <div className="relative">
        {/* Ambient glow beneath the bar */}
        <div className="absolute inset-x-4 -bottom-2 h-8 rounded-full bg-gradient-to-r from-[#4338CA]/15 via-[#818CF8]/15 to-[#FB7185]/15 blur-xl" />

        <div
          className="relative inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_20px_60px_rgba(67,56,202,0.18)] backdrop-blur-xl"
          style={{ animation: "fadeInUp 0.4s ease-out both" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                onClick={() => openTab("notes")}
                className={`relative flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  open && activeTab === "notes" ? "bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] text-[#4338CA]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MessageSquare size={17} strokeWidth={2} />
                Notes
              </PopoverTrigger>

              <PopoverTrigger
                onClick={() => openTab("emoji")}
                className={`relative flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  open && activeTab === "emoji" ? "bg-gradient-to-r from-[#FFF1F2] to-[#FFF7F8] text-[#FB7185]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Sticker size={17} strokeWidth={2} />
                Emoji
              </PopoverTrigger>

              <PopoverContent
                side="top"
                align="center"
                sideOffset={16}
                className={`rounded-2xl border border-gray-100 bg-white/95 shadow-[0_24px_64px_rgba(67,56,202,0.2)] backdrop-blur-xl ${
                  activeTab === "notes" ? "w-[360px] p-4" : "w-[400px] p-3"
                }`}
              >
                {activeTab === "notes" ? (
                  <>
                    <PopoverHeader>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white">
                          <MessageSquare size={13} />
                        </div>
                        <PopoverTitle className="text-base text-gray-900">Add notes</PopoverTitle>
                      </div>
                      <PopoverDescription className="text-xs text-gray-500">Pick a blank note style for the whiteboard.</PopoverDescription>
                    </PopoverHeader>

                    <div className="mt-3 flex gap-3">
                      {NOTE_OPTIONS.map((note, i) => (
                        <button
                          key={note.type}
                          onClick={() => {
                            onAddNote(note.type);
                            setOpen(false);
                          }}
                          style={{ animation: `fadeInUp 0.25s ease-out ${i * 0.06}s both` }}
                          className="group flex flex-1 cursor-pointer flex-col items-center gap-2"
                        >
                          {/* Real folded-corner sticky note shape */}
                          <div
                            className="relative h-24 w-full overflow-hidden rounded-md border shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(15,23,42,0.15)]"
                            style={{ backgroundColor: note.bg, borderColor: note.border }}
                          >
                            <div
                              className="absolute right-0 top-0 h-0 w-0 transition-all duration-200 group-hover:brightness-95"
                              style={{
                                borderStyle: "solid",
                                borderWidth: "0 16px 16px 0",
                                borderColor: `transparent ${note.fold} transparent transparent`,
                              }}
                            />
                            <div className="flex h-full flex-col justify-center gap-1.5 p-3">
                              <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: note.barColor }} />
                              <div className="h-1.5 w-10 rounded-full bg-white/70" />
                              <div className="h-1.5 w-6 rounded-full bg-white/50" />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-gray-900">{note.label}</p>
                            <p className="text-[10px] text-gray-400">{note.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <PopoverHeader>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FB7185] to-[#F43F5E] text-white">
                          <Sticker size={13} />
                        </div>
                        <PopoverTitle className="text-base text-gray-900">Emoji and icons</PopoverTitle>
                      </div>
                      <PopoverDescription className="text-xs text-gray-500">Choose from the picker or scroll the icon library.</PopoverDescription>
                    </PopoverHeader>

                    <Tabs value={emojiTab} onValueChange={(v) => setEmojiTab(v as "emoji" | "icons")} className="mt-3">
                      <TabsList className="w-full rounded-2xl bg-gray-100 p-1">
                        <TabsTrigger value="emoji" className="cursor-pointer rounded-xl text-xs font-medium data-active:bg-white data-active:text-[#4338CA] data-active:shadow-sm">
                          Emoji
                        </TabsTrigger>
                        <TabsTrigger value="icons" className="cursor-pointer rounded-xl text-xs font-medium data-active:bg-white data-active:text-[#4338CA] data-active:shadow-sm">
                          Icons
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="emoji" className="mt-3">
                        <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" height={380} searchDisabled={false} previewConfig={{ showPreview: false }} />
                      </TabsContent>

                      <TabsContent value="icons" className="mt-3">
                        <div className="relative mb-2.5">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            placeholder="Search icons..."
                            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm outline-none transition focus:border-[#4338CA]/30 focus:bg-white focus:ring-2 focus:ring-[#4338CA]/10"
                          />
                        </div>

                        {/* Quick-browse category chips */}
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {ICON_CATEGORIES.map((cat) => (
                            <button
                              key={cat.label}
                              onClick={() => setIconSearch(cat.query)}
                              className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                iconSearch === cat.query
                                  ? "border-[#4338CA]/30 bg-[#EEF2FF] text-[#4338CA]"
                                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Recently used shelf */}
                        {recentIconItems.length > 0 && !iconSearch && (
                          <div className="mb-3">
                            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-gray-400">
                              <Clock size={11} />
                              Recently used
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                              {recentIconItems.map((item, i) => {
                                const Icon = item.icon;
                                const color = ICON_COLORS[i % ICON_COLORS.length];
                                return (
                                  <button
                                    key={item.key}
                                    title={item.name}
                                    onClick={() => handleIconPick(item, color)}
                                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                                    style={{ color }}
                                  >
                                    <Icon size={17} strokeWidth={2.4} />
                                  </button>
                                );
                              })}
                            </div>
                            <div className="my-2.5 h-px bg-gray-100" />
                          </div>
                        )}

                        <div onScroll={handleGridScroll} className="grid max-h-[320px] grid-cols-4 gap-2 overflow-y-auto pr-1">
                          {filteredIcons.map((item, index) => {
                            const Icon = item.icon;
                            const color = ICON_COLORS[index % ICON_COLORS.length];
                            return (
                              <button
                                key={item.key}
                                type="button"
                                title={item.name}
                                onClick={() => handleIconPick(item, color)}
                                className="group flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-gray-100 bg-white p-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-[0_8px_16px_rgba(15,23,42,0.08)]"
                              >
                                <div
                                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                                  style={{ backgroundColor: `${color}16`, color }}
                                >
                                  <Icon size={19} strokeWidth={2.4} />
                                </div>
                                <span className="max-w-full truncate text-[11px] font-medium text-gray-600">{item.name}</span>
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

            <div className="mx-1 hidden h-8 w-px bg-gray-200 sm:block" />

            <Button
              onClick={onToggleAI}
              className={`group relative h-10 cursor-pointer gap-1.5 overflow-hidden rounded-xl px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(67,56,202,0.3)] transition-all duration-200 hover:shadow-[0_8px_20px_rgba(67,56,202,0.4)] ${
                showAISidebar ? "bg-gradient-to-r from-[#312E81] to-[#4338CA]" : "bg-gradient-to-r from-[#4338CA] to-[#6366F1]"
              }`}
            >
              {!showAISidebar && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: "shimmer 2.5s ease-in-out infinite" }} />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles size={16} strokeWidth={2.2} className={showAISidebar ? "" : "transition-transform duration-300 group-hover:rotate-12"} />
                {showAISidebar ? "Close AI" : "AI Helper"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingActionBar;