import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOAuth2Client } from "@/services/gmail";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/recruiter?error=no_code", req.url)
    );
  }

  try {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const { data: userInfo } = await oauth2.userinfo.get();

    await prisma.recruiterProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        gmailConnected: true,
        gmailEmail: userInfo.email,
        gmailTokenJson: JSON.stringify(tokens),
      },
      update: {
        gmailConnected: true,
        gmailEmail: userInfo.email,
        gmailTokenJson: JSON.stringify(tokens),
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/recruiter?connected=true", req.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/recruiter?error=oauth_failed", req.url)
    );
  }
}
