import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobsList from "@/components/JobsList";

export default async function JobsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "RECRUITER") redirect("/dashboard/candidate");

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      jobs: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">My Jobs</h1>
      <p className="text-sm text-gray-400 mb-6">
        Job listings auto-published from genuine recruiter emails
      </p>
      <JobsList jobs={profile?.jobs ?? []} />
    </div>
  );
}
