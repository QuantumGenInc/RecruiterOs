"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "CANDIDATE" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#0a0a0f" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 border border-white/5"
        style={{ background: "#1a1a2e" }}
      >
        <h2 className="text-xl font-semibold text-white mb-1">Create account</h2>
        <p className="text-xs text-gray-400 mb-6">Find your next opportunity</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-cyan-400 transition"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg px-3 py-2 text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-cyan-400 transition"
              placeholder="Min 8 characters"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-black transition disabled:opacity-50"
            style={{ background: "#00e5ff" }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="underline" style={{ color: "#00e5ff" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
