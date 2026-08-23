import { Button } from "@/components/ui/button";
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
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function CreateNewBoardDialog() {
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const route = useRouter();

  const handleCreateBoard = async() => {
    if (workspaceName.trim() === "" || workspaceName.length > 30) {
      toast.add({
        type: "error",
        title: "Invalid Workspace Name",
        description: "Please enter a valid workspace name (1-30 characters).",
      });
      return;
    }

    setLoading(true);
    const projectId = crypto.randomUUID();
    const result = await axios.post('/api/projects', {
      projectName: workspaceName,
      projectId: projectId
    })
    console.log(result.data);
    toast.add({
      type: "success",
      title: "New Workspace Created"
    })
    setLoading(false);
    setDialog(false);
    route.push('/workspace/'+projectId)
  };

  return (
    <Dialog open={dialog} onOpenChange={setDialog}>
      <DialogTrigger>
        <Button className="w-full">
          <Plus /> Create New Board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Whiteboard Workspace Name
          </DialogTitle>
          <div>
            <label className="text-gray-500">
              Enter Whiteboard Workspace Team
            </label>
            <Input
              className="mt-1"
              placeholder="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
        </DialogHeader>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={workspaceName.length === 0}
            onClick={handleCreateBoard}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Creating..</span>
              </>
            ) : (
              <span>Create</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewBoardDialog;
