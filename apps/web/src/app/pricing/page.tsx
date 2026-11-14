"use client";

import Link from "next/link";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  async function checkout(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.message || "Checkout unavailable — set STRIPE_SECRET_KEY on the server.");
    } catch {
      alert("Checkout unavailable — start the AngelAi server or configure Stripe.");
    }
    setLoading(null);
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For occasional use",
      features: ["5 sessions/month", "Basic transcription", "Manual notes", "Community support"],
      popular: false,
    },
    {
      name: "Pro",
      price: "$12/mo",
      desc: "For power users",
      features: ["Unlimited sessions", "Unlimited transcription", "Vision analysis", "Auto notes", "PDF/MD export", "Priority support"],
      popular: true,
    },
    {
      name: "Lifetime",
      price: "$149",
      desc: "One-time payment",
      features: ["Everything in Pro", "Lifetime access", "All future updates", "Bring your own key", "Team sync", "Dedicated support"],
      popular: false,
    },
  ];

  return (
    <main className="mesh-bg min-h-screen px-6 py-12 text-[var(--text)]">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">AngelAi</p>
        <h1 className="font-display mb-8 text-4xl font-bold">Pricing</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${plan.popular ? "border-[var(--primary)] bg-[var(--panel)]" : "border-[var(--border)] bg-[var(--panel)]/60"}`}
            >
              <h2 className={`font-display text-xl font-semibold ${plan.popular ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>
                {plan.name}
              </h2>
              <div className="my-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-2 text-sm text-[var(--muted)]">{plan.desc}</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-[var(--body)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-[var(--primary)]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => checkout(plan.name.toLowerCase())}
                disabled={loading === plan.name.toLowerCase()}
                className={`w-full rounded-lg py-2 font-semibold transition-colors ${
                  plan.popular
                    ? "bg-[var(--primary)] text-[var(--ground)] hover:bg-[var(--primary-hover)]"
                    : "bg-[var(--raised)] text-[var(--text)] hover:bg-[var(--active)]"
                }`}
              >
                {loading === plan.name.toLowerCase() ? "Loading..." : plan.popular ? "Most Popular" : "Choose"}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--primary)]">
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
