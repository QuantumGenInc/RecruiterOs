import { JobStatus } from "@prisma/client";

interface Job {
  id: string;
  title: string;
  company: string | null;
  pay: string | null;
  location: string | null;
  workType: string | null;
  status: JobStatus;
  createdAt: Date;
}

interface Props {
  jobs: Job[];
}

function StatusBadge({ s }: { s: JobStatus }) {
  const styles: Record<JobStatus, { bg: string; color: string }> = {
    PUBLISHED: { bg: "#14532d", color: "#86efac" },
    DRAFT: { bg: "#1e3a5f", color: "#93c5fd" },
    ARCHIVED: { bg: "#1f2937", color: "#9ca3af" },
  };
  const style = styles[s];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium shrink-0"
      style={{ background: style.bg, color: style.color }}
    >
      {s}
    </span>
  );
}

export default function JobsList({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No jobs yet. Genuine recruiter emails will auto-publish here.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-white/5 overflow-hidden"
      style={{ background: "#1a1a2e" }}
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white">Jobs ({jobs.length})</h2>
      </div>
      <ul>
        {jobs.map((job) => (
          <li key={job.id} className="px-6 py-4 border-b border-white/5 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[job.company, job.location, job.workType].filter(Boolean).join(" · ")}
                </p>
                {job.pay && (
                  <p className="text-xs mt-0.5" style={{ color: "#86efac" }}>
                    {job.pay}
                  </p>
                )}
              </div>
              <StatusBadge s={job.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
