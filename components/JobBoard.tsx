import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string | null;
  pay: string | null;
  location: string | null;
  workType: string | null;
  createdAt: Date;
}

interface Props {
  jobs: Job[];
}

export default function JobBoard({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No opportunities yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/dashboard/candidate/jobs/${job.id}`}
          className="block rounded-xl p-6 border border-white/5 hover:border-white/20 transition-colors"
          style={{ background: "#1a1a2e" }}
        >
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-semibold text-sm leading-snug">
                {job.title}
              </h3>
              {job.workType && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                  style={{ background: "#1e3a5f", color: "#93c5fd" }}
                >
                  {job.workType}
                </span>
              )}
            </div>
            {job.company && (
              <p className="text-xs text-gray-400">{job.company}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-auto pt-2">
              {job.location && (
                <span className="text-xs text-gray-500">📍 {job.location}</span>
              )}
              {job.pay && (
                <span className="text-xs" style={{ color: "#86efac" }}>
                  💵 {job.pay}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
