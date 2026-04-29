import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classifyEmailContent } from "@/services/classifier";
import { sendPhishingAlert } from "@/services/notifier";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { rawEmailId } = body as { rawEmailId?: string };
  if (!rawEmailId) {
    return NextResponse.json({ error: "rawEmailId required" }, { status: 400 });
  }

  const rawEmail = await prisma.rawEmail.findFirst({
    where: { id: rawEmailId, recruiter: { userId: session.user.id } },
    include: { recruiter: true },
  });
  if (!rawEmail) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }
  if (rawEmail.classification !== "PENDING") {
    return NextResponse.json({ classification: rawEmail.classification });
  }

  try {
    const result = await classifyEmailContent({
      subject: rawEmail.subject,
      fromEmail: rawEmail.fromEmail,
      fromName: rawEmail.fromName,
      bodyText: rawEmail.bodyText,
      bodyHtml: rawEmail.bodyHtml,
    });

    await prisma.rawEmail.update({
      where: { id: rawEmailId },
      data: { classification: result.classification, classifiedAt: new Date() },
    });

    if (result.classification === "GENUINE" && result.extracted) {
      const e = result.extracted;
      await prisma.job.create({
        data: {
          recruiterId: rawEmail.recruiterId,
          rawEmailId,
          title: e.title ?? "Untitled Position",
          company: e.company,
          pay: e.pay,
          location: e.location,
          workType: e.workType,
          description: e.description,
          contactEmail: e.contactEmail,
          contactPhone: e.contactPhone,
          linkedinUrl: e.linkedinUrl,
          applyLinks: e.applyLinks ?? [],
          status: "PUBLISHED",
        },
      });
    } else if (result.classification === "PHISHING") {
      await prisma.flaggedEmail.create({
        data: { rawEmailId, reason: result.reason },
      });

      try {
        await sendPhishingAlert({
          to: session.user.email!,
          subject: rawEmail.subject,
          fromEmail: rawEmail.fromEmail,
          fromName: rawEmail.fromName,
          reason: result.reason,
        });
        await prisma.flaggedEmail.updateMany({
          where: { rawEmailId },
          data: { notifiedAt: new Date() },
        });
      } catch {
        // notification failure doesn't break classification
      }
    }

    return NextResponse.json({ classification: result.classification });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Classification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
