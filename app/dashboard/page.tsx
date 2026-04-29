import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role === "RECRUITER" || session.user.role === "ADMIN") {
    redirect("/dashboard/recruiter");
  }

  redirect("/dashboard/candidate");
}
