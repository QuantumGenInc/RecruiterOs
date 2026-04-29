"use client";
import { useState } from "react";

interface Props {
  connected: boolean;
  gmailEmail: string | null;
}

export default function GmailConnect({ connected, gmailEmail }: Props) {
  const [polling, setPolling] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function handlePoll() {
    setPolling(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/gmail/poll", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setLastResult(data.error ?? "Poll failed");
      } else {
        setLastResult(`Fetched ${data.stored} new email(s)`);
      }
    } catch {
      setLastResult("Network error");
    } finally {
      setPolling(false);
    }
  }

  if (!connected) {
    return (
      <div
        className="rounded-xl border border-white/5 p-6"
        style={{ background: "#1a1a2e" }}
      >
        <p className="text-sm text-gray-400 mb-4">
          Connect your Gmail to start ingesting recruiter emails.
        </p>
        <a
          href="/api/gmail/connect"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "#00e5ff", color: "#0a0a0f" }}
        >
          Connect Gmail
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-white/5 p-6"
      style={{ background: "#1a1a2e" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "#86efac" }}>
            Gmail Connected
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{gmailEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePoll}
            disabled={polling}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-300 hover:border-white/30 disabled:opacity-50 transition-colors"
          >
            {polling ? "Polling…" : "Poll Now"}
          </button>
          <a
            href="/api/gmail/disconnect"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:border-red-500/60 transition-colors"
          >
            Disconnect
          </a>
        </div>
      </div>
      {lastResult && (
        <p className="text-xs text-gray-400 mt-3">{lastResult}</p>
      )}
    </div>
  );
}
