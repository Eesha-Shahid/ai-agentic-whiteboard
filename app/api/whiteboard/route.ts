import { db, WhiteboardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectId, elements, files, appState, base64ImagePreview } = await req.json();
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
  }

  if (projectId) {
    try {
      const result = await db.insert(WhiteboardData).values({
        projectId: projectId,
        elements: elements,
        appState: appState,
        files: files,
        previewImage: base64ImagePreview
      }).onConflictDoUpdate({
        target: WhiteboardData.projectId,
        set: {
          elements: elements,
          appState: appState,
          files: files,
          previewImage: base64ImagePreview,
          updatedAt: new Date()
        }
      });
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" });
    }
  }

  return NextResponse.json({ error: "Project Information missing!" }, { status: 400 })
}