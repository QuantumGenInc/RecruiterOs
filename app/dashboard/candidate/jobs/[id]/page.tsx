import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "RECRUITER") redirect("/dashboard/recruiter");

  const job = await prisma.job.findFirst({
    where: { id: params.id, status: "PUBLISHED" },
  });
  if (!job) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/candidate"
        className="text-xs text-gray-500 hover:text-gray-300 mb-6 inline-block transition-colors"
      >
        ← Back to opportunities
      </Link>

      <div
        className="rounded-xl border border-white/5 p-8"
        style={{ background: "#1a1a2e" }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{job.title}</h1>
            {job.company && (
              <p className="text-sm text-gray-400 mt-1">{job.company}</p>
            )}
          </div>
          {job.workType && (
            <span
              className="text-xs px-3 py-1 rounded-full shrink-0 font-medium"
              style={{ background: "#1e3a5f", color: "#93c5fd" }}
            >
              {job.workType}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-8 text-sm">
          {job.location && (
            <span className="text-gray-400">📍 {job.location}</span>
          )}
          {job.pay && (
            <span style={{ color: "#86efac" }}>💵 {job.pay}</span>
          )}
        </div>

        {job.description && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white mb-3">
              About the Role
            </h2>
            <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        )}

        <div className="border-t border-white/5 pt-6">
          <h2 className="text-sm font-semibold text-white mb-4">Contact</h2>
          <div className="flex flex-col gap-3">
            {job.contactEmail && (
              <a
                href={`mailto:${job.contactEmail}`}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ✉ {job.contactEmail}
              </a>
            )}
            {job.contactPhone && (
              <a
                href={`tel:${job.contactPhone}`}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                📞 {job.contactPhone}
              </a>
            )}
            {job.linkedinUrl && (
              <a
                href={job.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                🔗 LinkedIn Profile
              </a>
            )}
            {job.applyLinks.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Apply →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
