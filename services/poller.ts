import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { createOAuth2Client, extractBody, getHeader, parseFromHeader } from "@/services/gmail";

export async function pollRecruiterEmails(recruiterId: string): Promise<number> {
  const profile = await prisma.recruiterProfile.findUnique({ where: { id: recruiterId } });
  if (!profile?.gmailConnected || !profile.gmailTokenJson) return 0;

  const tokens = JSON.parse(profile.gmailTokenJson);
  const client = createOAuth2Client();
  client.setCredentials(tokens);

  try {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);
    await prisma.recruiterProfile.update({
      where: { id: recruiterId },
      data: { gmailTokenJson: JSON.stringify(credentials) },
    });
  } catch {
    // token may still be valid
  }

  const gmail = google.gmail({ version: "v1", auth: client });

  const afterDate = profile.lastPolledAt
    ? Math.floor(profile.lastPolledAt.getTime() / 1000)
    : Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: `after:${afterDate}`,
    maxResults: 50,
  });

  const messages = listRes.data.messages ?? [];
  let stored = 0;

  for (const msg of messages) {
    if (!msg.id) continue;
    const existing = await prisma.rawEmail.findUnique({
      where: { gmailMessageId: msg.id },
    });
    if (existing) continue;

    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const headers = full.data.payload?.headers ?? [];
    const { text, html } = extractBody(full.data.payload);
    const from = getHeader(headers, "from");
    const { email: fromEmail, name: fromName } = parseFromHeader(from);
    const internalDate = full.data.internalDate
      ? new Date(parseInt(full.data.internalDate))
      : null;

    await prisma.rawEmail.create({
      data: {
        recruiterId,
        gmailMessageId: msg.id,
        subject: getHeader(headers, "subject"),
        fromEmail,
        fromName,
        bodyText: text,
        bodyHtml: html,
        receivedAt: internalDate,
      },
    });
    stored++;
  }

  await prisma.recruiterProfile.update({
    where: { id: recruiterId },
    data: { lastPolledAt: new Date() },
  });

  return stored;
}
