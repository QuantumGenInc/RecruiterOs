import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobBoard from "@/components/JobBoard";

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "RECRUITER") redirect("/dashboard/recruiter");

  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      company: true,
      pay: true,
      location: true,
      workType: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Latest Opportunities</h1>
      <p className="text-sm text-gray-400 mb-8">
        Jobs matched from verified recruiter inboxes
      </p>
      <JobBoard jobs={jobs} />
    </div>
  );
}
