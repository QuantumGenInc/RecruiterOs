import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FlaggedList from "@/components/FlaggedList";

export default async function FlaggedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "RECRUITER") redirect("/dashboard/candidate");

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  });

  const flagged = profile
    ? await prisma.flaggedEmail.findMany({
        where: { rawEmail: { recruiterId: profile.id } },
        include: { rawEmail: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Flagged Emails</h1>
      <p className="text-sm text-gray-400 mb-6">
        Phishing and suspicious emails blocked by AI
      </p>
      <FlaggedList items={flagged} />
    </div>
  );
}
