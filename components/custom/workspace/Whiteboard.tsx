import { toast } from "@/components/ui/toast";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

function Whiteboard() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const saveTimeRef = useRef<any>(null);
  const { projectid } = useParams();

  const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
    // Canvas Prev Timer
    if (saveTimeRef) {
      clearTimeout(saveTimeRef.current);
    }

    // Strat New 10 Second Timer
    saveTimeRef.current = setTimeout(() => {
      SaveCanvasChanges(elements, appState, files);
      toast.add({
        type: "success",
        title: "Changes Saved"
      })
    }, 10000);
  };

  const SaveCanvasChanges = async(elements: readonly any[], appState: any, files: any) => {
    const result = await axios.post('/api/whiteboard', {
      projectId: projectid,
      elements: elements,
      appState: appState,
      files: files
    })
  }

  return (
    <div style={{ height: "90vh" }}>
      <Excalidraw
        // @ts-ignore
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleCanvasChange}
      />
    </div>
  );
}

export default Whiteboard;
