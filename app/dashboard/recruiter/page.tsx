import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RecruiterDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "CANDIDATE") redirect("/dashboard/candidate");

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Email Feed</h1>
      <p className="text-sm text-gray-400 mb-8">
        Processed recruiter emails and AI classifications
      </p>

      <div
        className="rounded-xl border border-white/5 p-6"
        style={{ background: "#1a1a2e" }}
      >
        <p className="text-sm text-gray-400">
          Connect your Gmail account to start ingesting emails.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Feature 3 — Gmail OAuth + ingestion coming next.
        </p>
      </div>
    </div>
  );
}
