import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      status: "healthy",
      services: {
        api: "operational",
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        services: {
          api: "operational",
          database: "disconnected",
        },
      },
      { status: 503 }
    );
  }
}
