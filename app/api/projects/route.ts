import { db, projects } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { projectId, projectName } = await request.json();
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
  }

  if (!projectId || !projectName) {
    return NextResponse.json({ error: "Project Information missing!" }, { status: 400})
  }

  const result = await db.insert(projects).values({
    projectId: projectId,
    projectName: projectName ?? '',
    userEmail: user?.primaryEmailAddress?.emailAddress ?? ''
  }).returning();

  return NextResponse.json(result[0]);
}