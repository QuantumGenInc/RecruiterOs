import { EmailClassification } from "@prisma/client";

interface Email {
  id: string;
  subject: string | null;
  fromEmail: string | null;
  fromName: string | null;
  receivedAt: Date | null;
  classification: EmailClassification;
}

interface Props {
  emails: Email[];
}

function ClassificationBadge({ c }: { c: EmailClassification }) {
  const styles: Record<EmailClassification, { bg: string; color: string }> = {
    GENUINE: { bg: "#14532d", color: "#86efac" },
    PHISHING: { bg: "#7f1d1d", color: "#fca5a5" },
    PENDING: { bg: "#1e3a5f", color: "#00e5ff" },
  };
  const s = styles[c];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {c}
    </span>
  );
}

export default function EmailFeed({ emails }: Props) {
  return (
    <div
      className="rounded-xl border border-white/5 overflow-hidden"
      style={{ background: "#1a1a2e" }}
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white">
          Recent Emails ({emails.length})
        </h2>
      </div>
      <ul>
        {emails.map((email) => (
          <li
            key={email.id}
            className="px-6 py-4 border-b border-white/5 last:border-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {email.subject ?? "(no subject)"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {email.fromName
                    ? `${email.fromName} <${email.fromEmail}>`
                    : (email.fromEmail ?? "Unknown sender")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ClassificationBadge c={email.classification} />
                {email.receivedAt && (
                  <span className="text-xs text-gray-600">
                    {new Date(email.receivedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
