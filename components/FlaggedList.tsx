interface FlaggedItem {
  id: string;
  reason: string | null;
  notifiedAt: Date | null;
  createdAt: Date;
  rawEmail: {
    subject: string | null;
    fromEmail: string | null;
    fromName: string | null;
    receivedAt: Date | null;
  };
}

interface Props {
  items: FlaggedItem[];
}

export default function FlaggedList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No flagged emails. You&apos;re all clear!
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-white/5 overflow-hidden"
      style={{ background: "#1a1a2e" }}
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white">
          Flagged ({items.length})
        </h2>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="px-6 py-4 border-b border-white/5 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {item.rawEmail.subject ?? "(no subject)"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.rawEmail.fromName
                    ? `${item.rawEmail.fromName} <${item.rawEmail.fromEmail}>`
                    : (item.rawEmail.fromEmail ?? "Unknown sender")}
                </p>
                {item.reason && (
                  <p className="text-xs mt-1" style={{ color: "#fca5a5" }}>
                    Reason: {item.reason}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: "#7f1d1d", color: "#fca5a5" }}
                >
                  PHISHING
                </span>
                {item.rawEmail.receivedAt && (
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(item.rawEmail.receivedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
