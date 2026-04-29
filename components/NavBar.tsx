"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5"
      style={{ background: "#1a1a2e" }}
    >
      <Link href="/dashboard/candidate" className="text-lg font-bold" style={{ color: "#00e5ff" }}>
        RecruiterOs
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/dashboard/candidate" className="text-sm text-gray-300 hover:text-white transition">
          Opportunities
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-400 hover:text-red-400 transition"
        >
          Logout
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-gray-400"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-16 left-0 right-0 z-50 flex flex-col gap-4 p-6 border-b border-white/5"
          style={{ background: "#1a1a2e" }}
        >
          <Link href="/dashboard/candidate" className="text-sm text-gray-300" onClick={() => setMenuOpen(false)}>
            Opportunities
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-left text-gray-400"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
