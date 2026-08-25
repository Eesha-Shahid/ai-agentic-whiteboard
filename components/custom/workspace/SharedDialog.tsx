"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Check, Copy, Globe, Loader2, Mail, Share2, Trash2, X } from "lucide-react";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Collaborator = { userEmail: string; role: string };

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
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

function ShareDialog({ projectId, open, onOpenChange }: Props) {
  const [isPublic, setIsPublic] = useState(false);
  const [publicRole, setPublicRole] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/view/${projectId}?mode=${publicRole}`
    : "";

  useEffect(() => {
    if (!open) return;
    loadShareData();
  }, [open]);

  const loadShareData = async () => {
    setIsLoading(true);
    try {
      const [projectRes, collabRes] = await Promise.all([
        axios.get(`/api/projects?projectId=${projectId}`),
        axios.get(`/api/collaborators?projectId=${projectId}`),
      ]);
      setIsPublic(!!projectRes.data.isPublic);
      setPublicRole(projectRes.data.publicRole || "view");
      setCollaborators(collabRes.data || []);
    } catch (error) {
      console.error("Failed to load sharing info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    const next = !isPublic;
    setIsPublic(next);
    try {
      await axios.patch("/api/projects", { projectId, isPublic: next, publicRole });
      toast.add({ type: "success", title: next ? "Public link enabled" : "Public link disabled" });
    } catch (error) {
      setIsPublic(!next);
      toast.add({ type: "error", title: "Something went wrong" });
    }
  };

  const handleRoleChange = async (role: "view" | "edit") => {
    setPublicRole(role);
    try {
      await axios.patch("/api/projects", { projectId, publicRole: role });
    } catch (error) {
      toast.add({ type: "error", title: "Something went wrong" });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.add({ type: "error", title: "Enter a valid email address" });
      return;
    }
    setIsInviting(true);
    try {
      await axios.post("/api/collaborators", { projectId, email: inviteEmail.trim(), role: inviteRole });
      setCollaborators((prev) => [...prev, { userEmail: inviteEmail.trim(), role: inviteRole }]);
      setInviteEmail("");
      toast.add({ type: "success", title: "Invite sent" });
    } catch (error: any) {
      toast.add({
        type: "error",
        title: "Couldn't send invite",
        description: error?.response?.data?.error || "Something went wrong",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (email: string) => {
    setCollaborators((prev) => prev.filter((c) => c.userEmail !== email));
    try {
      await axios.delete(`/api/collaborators?projectId=${projectId}&email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.add({ type: "error", title: "Failed to remove collaborator" });
      loadShareData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-md">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] px-6 pb-5 pt-6">
          <div className="pointer-events-none absolute -right-16 -top-10 h-32 w-32 rounded-full bg-[#818CF8]/15 blur-2xl" />

          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-gray-400 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-gray-700"
          >
            <X size={16} />
          </button>

          <DialogHeader className="relative z-10">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_8px_20px_rgba(67,56,202,0.3)]">
              <Share2 size={20} className="text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">Share whiteboard</DialogTitle>
            <p className="text-sm text-gray-500">Invite people or share a public link.</p>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              {/* Public link */}
              <div className="rounded-xl border border-gray-100 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4338CA]">
                      <Globe size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Public link</p>
                      <p className="mt-0.5 text-xs text-gray-400">Anyone with the link can access</p>
                    </div>
                  </div>
                  <Toggle checked={isPublic} onChange={handleTogglePublic} />
                </div>

                {isPublic && (
                  <div className="mt-3 space-y-2.5" style={{ animation: "fadeInUp 0.2s ease-out both" }}>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
                      <input
                        readOnly
                        value={shareUrl}
                        className="h-8 flex-1 truncate bg-transparent px-2 text-xs text-gray-600 outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md bg-white px-2.5 text-xs font-medium text-gray-600 shadow-sm transition hover:text-[#4338CA]"
                      >
                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRoleChange("view")}
                        className={`flex-1 cursor-pointer rounded-lg border-2 py-1.5 text-xs font-medium transition ${
                          publicRole === "view" ? "border-[#4338CA] bg-[#EEF2FF] text-[#4338CA]" : "border-gray-100 text-gray-500"
                        }`}
                      >
                        Can view
                      </button>
                      <button
                        onClick={() => handleRoleChange("edit")}
                        className={`flex-1 cursor-pointer rounded-lg border-2 py-1.5 text-xs font-medium transition ${
                          publicRole === "edit" ? "border-[#4338CA] bg-[#EEF2FF] text-[#4338CA]" : "border-gray-100 text-gray-500"
                        }`}
                      >
                        Can edit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Invite by email */}
              <div className="mt-5">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Mail size={12} />
                  Invite people
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    className="h-9 flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <Button
                    onClick={handleInvite}
                    disabled={isInviting}
                    className="h-9 cursor-pointer border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] px-3 text-xs hover:brightness-105 disabled:opacity-50"
                  >
                    {isInviting ? <Loader2 size={14} className="animate-spin" /> : "Invite"}
                  </Button>
                </div>
              </div>

              {/* Collaborator list */}
              {collaborators.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {collaborators.map((c) => (
                    <div key={c.userEmail} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#818CF8] to-[#4338CA] text-[10px] font-semibold text-white">
                          {c.userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-700">{c.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">{c.role}</span>
                        <button
                          onClick={() => handleRemoveCollaborator(c.userEmail)}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;