"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Loader2, Plus, Sparkles, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  fullWidth?: boolean;
};

const NAME_LIMIT = 30;

function CreateNewBoardDialog({ fullWidth }: Props) {
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const route = useRouter();

  const handleCreateBoard = async () => {
    if (workspaceName.trim() === "" || workspaceName.length > NAME_LIMIT) {
      toast.add({
        type: "error",
        title: "Invalid Workspace Name",
        description: "Please enter a valid workspace name (1-30 characters).",
      });
      return;
    }

    setLoading(true);
    const projectId = crypto.randomUUID();
    const result = await axios.post("/api/projects", {
      projectName: workspaceName,
      projectId: projectId,
    });
    toast.add({
      type: "success",
      title: "New Workspace Created",
    });
    setLoading(false);
    setDialog(false);
    route.push("/workspace/" + projectId);
  };

  const nearLimit = workspaceName.length > NAME_LIMIT - 8;
  const overLimit = workspaceName.length > NAME_LIMIT;

  return (
    <Dialog open={dialog} onOpenChange={setDialog}>
      <DialogTrigger
        className={buttonVariants({
          className: cn(
            "cursor-pointer border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] shadow-[0_6px_16px_rgba(67,56,202,0.25)] transition-all hover:shadow-[0_8px_20px_rgba(67,56,202,0.35)] hover:brightness-105",
            fullWidth && "w-full",
          ),
        })}
      >
        <Plus size={16} /> Create New Board
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="relative bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] px-6 pb-5 pt-6">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#818CF8]/15 blur-2xl" />
          <DialogHeader className="relative z-10">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_8px_20px_rgba(67,56,202,0.3)]">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Create a new whiteboard
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Give your workspace a name to get started.
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Workspace name</span>
            <span className={overLimit ? "text-red-500" : nearLimit ? "text-amber-500" : "text-gray-300"}>
              {workspaceName.length}/{NAME_LIMIT}
            </span>
          </label>
          <Input
            autoFocus
            placeholder="e.g. Product Roadmap"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && workspaceName.trim() && !overLimit && !loading) {
                handleCreateBoard();
              }
            }}
            className={cn(
              "h-11 transition-shadow focus-visible:ring-2",
              overLimit
                ? "border-red-300 focus-visible:ring-red-100"
                : "focus-visible:border-[#4338CA]/40 focus-visible:ring-[#4338CA]/10",
            )}
          />
          {overLimit && (
            <p className="mt-1.5 text-xs text-red-500">Keep it under {NAME_LIMIT} characters.</p>
          )}
        </div>

        <DialogFooter className="gap-2 border-t bg-gray-50/60 px-6 py-4">
          <DialogClose className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
            Cancel
          </DialogClose>
          <Button
            disabled={workspaceName.trim().length === 0 || overLimit || loading}
            onClick={handleCreateBoard}
            className="cursor-pointer gap-1.5 border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] shadow-[0_6px_16px_rgba(67,56,202,0.25)] transition-all hover:brightness-105 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Create Board</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewBoardDialog;