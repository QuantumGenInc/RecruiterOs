"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0f" }}>
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 px-12 gap-8">
        <div className="text-8xl select-none">🤖</div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">RecruiterOs</h1>
          <p className="mt-3 text-sm" style={{ color: "#00e5ff" }}>
            AI-powered recruiter email intelligence
          </p>
        </div>
        <div className="w-px h-24 opacity-20" style={{ background: "#00e5ff" }} />
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Classify inbound opportunities, surface the best leads, and protect your inbox.
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-8">
        <div
          className="w-full max-w-sm rounded-2xl p-8 border border-white/5"
          style={{ background: "#1a1a2e" }}
        >
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-xs text-gray-400 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2 text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-cyan-400 transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2 text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-cyan-400 transition"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-black transition disabled:opacity-50"
              style={{ background: "#00e5ff" }}
            >
              {loading ? "Initializing..." : "Initialize Login"}
            </button>
          </form>

          <p className="mt-5 text-xs text-center text-gray-500">
            New candidate?{" "}
            <Link href="/register" className="underline" style={{ color: "#00e5ff" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
