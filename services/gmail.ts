import { google, gmail_v1 } from "googleapis";

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXTAUTH_URL}/api/gmail/callback`
  );
}

export function getAuthUrl(): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });
}

export function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

export function extractBody(
  payload: gmail_v1.Schema$MessagePart | null | undefined
): { text: string | null; html: string | null } {
  if (!payload) return { text: null, html: null };

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return { text: decodeBase64(payload.body.data), html: null };
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    return { text: null, html: decodeBase64(payload.body.data) };
  }

  if (payload.parts) {
    let text: string | null = null;
    let html: string | null = null;
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result.text) text = result.text;
      if (result.html) html = result.html;
    }
    return { text, html };
  }

  return { text: null, html: null };
}

export function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[],
  name: string
): string | null {
  return (
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null
  );
}

export function parseFromHeader(from: string | null): {
  email: string | null;
  name: string | null;
} {
  if (!from) return { email: null, name: null };
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { email: from.trim(), name: null };
}
