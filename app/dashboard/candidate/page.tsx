import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "RECRUITER") redirect("/dashboard/recruiter");

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Latest Opportunities</h1>
      <p className="text-sm text-gray-400 mb-8">
        Jobs matched from verified recruiter inboxes
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-6 border border-white/5 flex flex-col gap-3"
          style={{ background: "#1a1a2e" }}
        >
          <span className="text-xs px-2 py-0.5 rounded-full self-start font-medium text-black" style={{ background: "#00e5ff" }}>
            New
          </span>
          <p className="text-white font-semibold">Jobs will appear here</p>
          <p className="text-xs text-gray-400">
            Once recruiters connect Gmail and emails are classified, opportunities show up here.
          </p>
        </div>
      </div>
    </div>
  );
}
