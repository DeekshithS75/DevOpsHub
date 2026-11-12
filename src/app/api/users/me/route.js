import { NextResponse } from "next/server";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export async function GET() {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User synchronized successfully",
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "User synchronization failed" },
      { status: 500 },
    );
  }
}
