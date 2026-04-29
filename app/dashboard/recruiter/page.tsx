import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GmailConnect from "@/components/GmailConnect";
import EmailFeed from "@/components/EmailFeed";

export default async function RecruiterDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "CANDIDATE") redirect("/dashboard/candidate");

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      rawEmails: {
        orderBy: { receivedAt: "desc" },
        take: 20,
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Email Feed</h1>
      <p className="text-sm text-gray-400 mb-8">
        Processed recruiter emails and AI classifications
      </p>

      <div className="mb-6">
        <GmailConnect
          connected={profile?.gmailConnected ?? false}
          gmailEmail={profile?.gmailEmail ?? null}
        />
      </div>

      {profile?.rawEmails && profile.rawEmails.length > 0 && (
        <EmailFeed emails={profile.rawEmails} />
      )}
    </div>
  );
}
