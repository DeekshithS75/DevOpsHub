import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; invitationId: string }> },
) {
  try {
    const user = await syncAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { slug, invitationId } = await params;

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organization: { slug } },
      select: { organizationId: true, role: true },
    });
    if (!membership) return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json({ success: false, message: "You do not have permission to revoke invitations" }, { status: 403 });
    }

    const result = await prisma.organizationInvitation.updateMany({
      where: { id: invitationId, organizationId: membership.organizationId, status: "PENDING", expiresAt: { gt: new Date() } },
      data: { status: "REVOKED" },
    });
    if (!result.count) return NextResponse.json({ success: false, message: "Pending invitation not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Invitation revoked successfully" });
  } catch (error) {
    console.error("Organization invitation revocation error:", error);
    return NextResponse.json({ success: false, message: "Failed to revoke invitation" }, { status: 500 });
  }
}
