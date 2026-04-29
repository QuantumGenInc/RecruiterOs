import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  await prisma.recruiterProfile.updateMany({
    where: { userId: session.user.id },
    data: {
      gmailConnected: false,
      gmailEmail: null,
      gmailTokenJson: null,
    },
  });

  return NextResponse.redirect(
    new URL("/dashboard/recruiter?disconnected=true", req.url)
  );
}
