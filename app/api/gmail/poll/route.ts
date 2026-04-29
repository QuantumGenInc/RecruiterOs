import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pollRecruiterEmails } from "@/services/poller";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.gmailConnected) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  try {
    const stored = await pollRecruiterEmails(profile.id);
    return NextResponse.json({ stored, polledAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Poll failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
