import { db, collaborators, projects } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// List collaborators on a project, or projects shared with the current user
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (projectId) {
    const project = await db.select().from(projects).where(eq(projects.projectId, projectId));
    if (project.length === 0) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    const isOwner = project[0].userEmail === userEmail;

    if (!isOwner) {
      // Not the owner — must at least be a collaborator to view the list
      const selfCheck = await db
        .select()
        .from(collaborators)
        .where(and(eq(collaborators.projectId, projectId), eq(collaborators.userEmail, userEmail)));

      if (selfCheck.length === 0) {
        return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
      }
    }

    const result = await db.select().from(collaborators).where(eq(collaborators.projectId, projectId));
    return NextResponse.json(result);
  }

  // No projectId → return boards shared WITH the current user
  const result = await db
    .select({
      projectId: projects.projectId,
      projectName: projects.projectName,
      role: collaborators.role,
      invitedBy: collaborators.invitedBy,
      invitedAt: collaborators.invitedAt,
    })
    .from(collaborators)
    .innerJoin(projects, eq(collaborators.projectId, projects.projectId))
    .where(eq(collaborators.userEmail, userEmail));

  return NextResponse.json(result);
}

// Invite a collaborator
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { projectId, email, role } = await req.json();
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }
  if (!projectId || !email) {
    return NextResponse.json({ error: "Project and email required" }, { status: 400 });
  }

  const project = await db.select().from(projects).where(eq(projects.projectId, projectId));
  if (project.length === 0 || project[0].userEmail !== userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }
  if (email === userEmail) {
    return NextResponse.json({ error: "You already own this board" }, { status: 400 });
  }

  const result = await db
    .insert(collaborators)
    .values({ projectId, userEmail: email, role: role || "viewer", invitedBy: userEmail })
    .returning();

  // Send the invite email — failure here shouldn't fail the whole request,
  // since the collaborator row is already correctly created
  try {
    const boardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${projectId}`;
    await resend.emails.send({
      from: "WhizBoard <onboarding@resend.dev>", // swap for your verified domain once set up
      to: email,
      subject: `${user.firstName || userEmail} invited you to a WhizBoard`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111827;">${project[0].projectName}</h2>
          <p style="color: #6b7280;">
            ${user.firstName || userEmail} invited you as ${role === "editor" ? "an editor" : "a viewer"} on this whiteboard.
          </p>
          <a href="${boardUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #4338CA; color: white; border-radius: 8px; text-decoration: none;">
            Open board
          </a>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send invite email:", emailError);
  }

  return NextResponse.json(result[0]);
}

// Remove a collaborator
export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const email = searchParams.get("email");
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }
  if (!projectId || !email) {
    return NextResponse.json({ error: "Project and email required" }, { status: 400 });
  }

  const project = await db.select().from(projects).where(eq(projects.projectId, projectId));
  if (project.length === 0 || project[0].userEmail !== userEmail) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  await db.delete(collaborators).where(
    and(eq(collaborators.projectId, projectId), eq(collaborators.userEmail, email))
  );

  return NextResponse.json({ success: true });
}