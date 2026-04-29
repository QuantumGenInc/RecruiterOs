import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPhishingAlert(params: {
  to: string;
  subject: string | null;
  fromEmail: string | null;
  fromName: string | null;
  reason: string;
}): Promise<void> {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: params.to,
    subject: "[RecruiterOS Alert] Phishing email detected",
    html: `
      <div style="font-family:sans-serif;max-width:600px;padding:24px">
        <h2 style="color:#ef4444;margin:0 0 16px">⚠️ Phishing Email Detected</h2>
        <p style="color:#374151">We blocked a suspicious email from your recruiter feed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f9fafb">
            <td style="padding:10px;font-weight:600;width:100px">Subject</td>
            <td style="padding:10px">${params.subject ?? "(no subject)"}</td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:600">From</td>
            <td style="padding:10px">
              ${params.fromName ? params.fromName + " &lt;" : ""
              }${params.fromEmail ?? "unknown"}${params.fromName ? "&gt;" : ""}
            </td>
          </tr>
          <tr style="background:#f9fafb">
            <td style="padding:10px;font-weight:600">Reason</td>
            <td style="padding:10px">${params.reason}</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          RecruiterOS — AI-powered email intelligence
        </p>
      </div>
    `,
  });
}
