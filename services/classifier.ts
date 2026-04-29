import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ExtractedJob {
  title?: string;
  company?: string;
  pay?: string;
  location?: string;
  workType?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  linkedinUrl?: string;
  applyLinks?: string[];
}

export interface ClassificationResult {
  classification: "GENUINE" | "PHISHING";
  reason: string;
  extracted?: ExtractedJob;
}

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fence ? fence[1].trim() : text.trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function classifyEmailContent(params: {
  subject: string | null;
  fromEmail: string | null;
  fromName: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
}): Promise<ClassificationResult> {
  const body = params.bodyText ?? (stripHtml(params.bodyHtml ?? "") || "(no body)");
  const emailContent = [
    params.subject ? `Subject: ${params.subject}` : "",
    params.fromEmail
      ? `From: ${params.fromName ? `${params.fromName} <${params.fromEmail}>` : params.fromEmail}`
      : "",
    "",
    body,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 3000);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Classify this email as a genuine recruiter job opportunity or phishing/spam. Return JSON only, no other text.

Email:
${emailContent}

JSON format:
{
  "classification": "GENUINE" | "PHISHING",
  "reason": "brief explanation",
  "extracted": {
    "title": "job title",
    "company": "company name",
    "pay": "salary/rate or null",
    "location": "city/remote/hybrid or null",
    "workType": "full-time/part-time/contract/remote or null",
    "description": "full job description, expand if thin (minimum 3 sentences)",
    "contactEmail": "reply-to email or null",
    "contactPhone": "phone number or null",
    "linkedinUrl": "linkedin URL or null",
    "applyLinks": ["application URLs"]
  }
}
Include "extracted" only when classification is GENUINE.`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(extractJson(raw)) as ClassificationResult;
}
