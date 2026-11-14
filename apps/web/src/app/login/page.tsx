"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit() {
    const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body: Record<string, string> = { email, password };
    if (mode === "register") body.name = name;
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("angel_token", data.token);
        setMsg(`Welcome, ${data.user.name}`);
        router.push("/app/");
      } else {
        setMsg(data.error || "Failed");
      }
    } catch {
      setMsg("Server offline — start apps/server or use the desk in demo mode.");
    }
  }

  return (
    <main className="mesh-bg flex min-h-screen items-center justify-center px-6 text-[var(--text)]">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-center text-3xl font-bold">AngelAi</h1>
        <p className="text-center text-sm text-[var(--muted)]">{mode === "login" ? "Sign in" : "Create account"}</p>
        {mode === "register" && (
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={submit}
          className="w-full rounded-lg bg-[var(--primary)] py-2 font-semibold text-[var(--ground)] hover:bg-[var(--primary-hover)]"
        >
          Continue
        </button>
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
        </button>
        {msg && <p className="text-center text-sm text-[var(--body)]">{msg}</p>}
        <Link href="/" className="block text-center text-sm text-[var(--primary)] hover:underline">
          ← Home
        </Link>
      </div>
    </main>
  );
}
