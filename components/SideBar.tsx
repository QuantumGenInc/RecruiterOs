"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/recruiter", label: "Home", icon: "⌂" },
  { href: "/dashboard/recruiter/email-feed", label: "Email Feed", icon: "✉" },
  { href: "/dashboard/recruiter/flagged", label: "Flagged", icon: "⚑" },
  { href: "/dashboard/recruiter/jobs", label: "Jobs", icon: "💼" },
];

export default function SideBar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 min-h-screen flex flex-col border-r border-white/5 py-6 px-4"
      style={{ background: "#1a1a2e" }}
    >
      <span className="text-lg font-bold mb-8 px-2" style={{ color: "#00e5ff" }}>
        RecruiterOs
      </span>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition"
              style={{
                background: active ? "rgba(0,229,255,0.08)" : "transparent",
                color: active ? "#00e5ff" : "#9ca3af",
              }}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 transition mt-4"
      >
        <span>⏻</span> Logout
      </button>
    </aside>
  );
}
