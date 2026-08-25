import { db, projects, WhiteboardData } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const project = await db.select().from(projects).where(eq(projects.projectId, projectId));

  if (project.length === 0 || !project[0].isPublic) {
    return NextResponse.json({ error: "This board is not publicly shared" }, { status: 404 });
  }

  const result = await db.select().from(WhiteboardData).where(eq(WhiteboardData.projectId, projectId));

  return NextResponse.json({
    ...result[0],
    projectName: project[0].projectName,
    publicRole: project[0].publicRole,
  });
}