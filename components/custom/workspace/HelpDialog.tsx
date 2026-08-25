"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, ExternalLink, Github, HelpCircle, X, Youtube } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const RESOURCES = [
  { label: "Documentation", icon: BookOpen, href: "#" },
  { label: "Read our blog", icon: ExternalLink, href: "#" },
  { label: "Found an issue?", icon: Github, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
];

const SHORTCUT_GROUPS = [
  {
    label: "Tools",
    shortcuts: [
      { name: "Selection", keys: ["V", "1"] },
      { name: "Hand (pan)", keys: ["H"] },
      { name: "Rectangle", keys: ["R", "2"] },
      { name: "Diamond", keys: ["D", "3"] },
      { name: "Ellipse", keys: ["O", "4"] },
      { name: "Arrow", keys: ["A", "5"] },
      { name: "Line", keys: ["L", "6"] },
      { name: "Draw", keys: ["P", "7"] },
      { name: "Text", keys: ["T", "8"] },
      { name: "Eraser", keys: ["E", "0"] },
    ],
  },
  {
    label: "Actions",
    shortcuts: [
      { name: "Duplicate", keys: ["Ctrl", "D"] },
      { name: "Delete", keys: ["Del"] },
      { name: "Lock / unlock", keys: ["Ctrl", "Shift", "L"] },
      { name: "Bring to front", keys: ["Ctrl", "Shift", "]"] },
      { name: "Send to back", keys: ["Ctrl", "Shift", "["] },
      { name: "Undo", keys: ["Ctrl", "Z"] },
      { name: "Redo", keys: ["Ctrl", "Shift", "Z"] },
    ],
  },
  {
    label: "Canvas",
    shortcuts: [
      { name: "Zoom in / out", keys: ["Ctrl", "+/-"] },
      { name: "Reset zoom", keys: ["Ctrl", "0"] },
      { name: "Pan", keys: ["Space", "Drag"] },
      { name: "Save", keys: ["Ctrl", "S"] },
    ],
  },
];

function KeyBadge({ children }: { children: string }) {
  return (
    <kbd className="min-w-[22px] rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-center text-[10px] font-semibold text-gray-500">
      {children}
    </kbd>
  );
}

function HelpDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-lg">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] px-6 pb-5 pt-6">
          <div className="pointer-events-none absolute -right-16 -top-10 h-32 w-32 rounded-full bg-[#818CF8]/15 blur-2xl" />

          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-gray-700"
          >
            <X size={16} />
          </button>

          <DialogHeader className="relative z-10">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_8px_20px_rgba(67,56,202,0.3)]">
              <HelpCircle size={20} className="text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">Help & shortcuts</DialogTitle>
            <p className="text-sm text-gray-500">Everything you need to move faster on the canvas.</p>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* Resource links */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RESOURCES.map((r) => (
              <a
                key={r.label}
                href={r.href}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 p-3 text-center transition hover:border-gray-200 hover:bg-gray-50"
              >
                <r.icon size={16} className="text-[#4338CA]" />
                <span className="text-[11px] font-medium text-gray-600">{r.label}</span>
              </a>
            ))}
          </div>

          {/* Shortcut groups */}
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label} className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</h3>
              <div className="divide-y divide-gray-50 rounded-xl border border-gray-100">
                {group.shortcuts.map((s) => (
                  <div key={s.name} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <KeyBadge>{k}</KeyBadge>
                          {i < s.keys.length - 1 && <span className="text-[10px] text-gray-300">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HelpDialog;