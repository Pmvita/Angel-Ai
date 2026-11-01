"use client";
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
    const body: any = { email, password };
    if (mode === "register") body.name = name;
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("angel_token", data.token);
      setMsg(`Welcome, ${data.user.name}`);
      router.push("/");
    } else {
      setMsg(data.error || "Failed");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold text-center">Angel-Ai</h1>
        <p className="text-white/60 text-center text-sm">{mode === "login" ? "Sign in" : "Create account"}</p>
        {mode === "register" && (
          <input className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={submit} className="w-full py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400">Continue</button>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="w-full text-sm text-white/60 hover:text-white">
          {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
        </button>
        {msg && <p className="text-center text-sm text-white/70">{msg}</p>}
      </div>
    </main>
  );
}