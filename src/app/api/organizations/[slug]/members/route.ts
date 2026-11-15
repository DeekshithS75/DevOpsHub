import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await syncAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organization: { slug } },
      select: { organizationId: true, role: true },
    });
    if (!membership) return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: membership.organizationId },
      select: { id: true, role: true, joinedAt: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: "asc" },
    });
    return NextResponse.json({ success: true, members, currentUserRole: membership.role });
  } catch (error) {
    console.error("Organization members retrieval error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve organization members" }, { status: 500 });
  }
}
