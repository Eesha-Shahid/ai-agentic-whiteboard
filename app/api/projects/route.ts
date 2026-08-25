import { db, projects, WhiteboardData, users } from "@/db";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { projectId, projectName } = await request.json();
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId || !projectName) {
    return NextResponse.json(
      { error: "Project Information missing!" },
      { status: 400 },
    );
  }

  const userCredit = await db
    .select({
      credits: users.credits,
    })
    .from(users)
    .where(eq(users.email, userEmail));

  if (userCredit[0].credits && userCredit[0].credits <= 0) {
    return NextResponse.json({ error: "Insufficient Credits", status: 400 });
  }

  const result = await db
    .insert(projects)
    .values({
      projectId: projectId,
      projectName: projectName ?? "",
      userEmail: user?.primaryEmailAddress?.emailAddress ?? "",
    })
    .returning();

  const updateUserCredit = await db
    .update(users)
    .set({
      credits: Number(userCredit[0].credits) - 1,
    })
    .where(eq(users.email, userEmail));

  return NextResponse.json(result[0]);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    const projectList = await db
      .select({
        id: projects.id,
        projectId: projects.projectId,
        projectName: projects.projectName,
        userEmail: projects.userEmail,
        createdAt: projects.createdAt,
        archived: projects.archived,
        previewImage: WhiteboardData.previewImage,
        updatedAt: WhiteboardData.updatedAt,
      })
      .from(projects)
      .leftJoin(
        WhiteboardData,
        eq(projects.projectId, WhiteboardData.projectId),
      )
      .where(eq(projects.userEmail, userEmail));

    return NextResponse.json(projectList);
  }

  const userProject = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.projectId, projectId), eq(projects.userEmail, userEmail)),
    );

  if (userProject.length === 0) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(WhiteboardData)
    .where(eq(WhiteboardData.projectId, projectId));

  return NextResponse.json({
    ...result[0],
    projectName: userProject[0].projectName,
  });
}

export async function PATCH(req: NextRequest) {
  const { projectId, archived, isPublic, publicRole } = await req.json();
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }
  if (!projectId) {
    return NextResponse.json(
      { error: "Project Information missing!" },
      { status: 400 },
    );
  }

  // Only touch fields that were actually sent, so a call to toggle
  // archived doesn't accidentally reset isPublic/publicRole, and vice versa
  const updates: Record<string, any> = {};
  if (typeof archived === "boolean") updates.archived = archived;
  if (typeof isPublic === "boolean") updates.isPublic = isPublic;
  if (typeof publicRole === "string") updates.publicRole = publicRole;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const result = await db
    .update(projects)
    .set(updates)
    .where(
      and(eq(projects.projectId, projectId), eq(projects.userEmail, userEmail)),
    )
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }
  if (!projectId) {
    return NextResponse.json(
      { error: "Project Information missing!" },
      { status: 400 },
    );
  }

  // Delete whiteboard data first — it references projectId
  await db
    .delete(WhiteboardData)
    .where(eq(WhiteboardData.projectId, projectId));

  const result = await db
    .delete(projects)
    .where(
      and(eq(projects.projectId, projectId), eq(projects.userEmail, userEmail)),
    )
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
