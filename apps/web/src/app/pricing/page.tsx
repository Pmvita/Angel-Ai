"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  async function checkout(plan: string) {
    setLoading(plan);
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.message || "Checkout unavailable");
    setLoading(null);
  }
  const plans = [
    { name: "Free", price: "$0", desc: "For occasional use", features: ["5 sessions/month", "Basic transcription", "Manual notes", "Community support"], popular: false },
    { name: "Pro", price: "$12/mo", desc: "For power users", features: ["Unlimited sessions", "Unlimited transcription", "Vision analysis", "Auto notes", "PDF/MD export", "Priority support"], popular: true },
    { name: "Lifetime", price: "$149", desc: "One-time payment", features: ["Everything in Pro", "Lifetime access", "All future updates", "Bring your own key", "Team sync", "Dedicated support"], popular: false },
  ].map((plan) => (
    <div key={plan.name} className={`rounded-2xl border p-6 ${plan.popular ? "border-emerald-500 bg-black/40" : "border-white/10"}`}>
      <h2 className={plan.popular ? "text-emerald-400 text-xl font-semibold" : "text-white text-xl font-semibold"}>{plan.name}</h2>
      <div className="my-4">
        <span className="text-3xl font-bold">{plan.price}</span>
        <span className="text-white/50 text-sm ml-2">{plan.desc}</span>
      </div>
      <ul className="space-y-2 text-sm text-white/70 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => checkout(plan.name.toLowerCase())}
        disabled={loading === plan.name.toLowerCase()}
        className={`w-full py-2 rounded-lg font-semibold transition-colors ${plan.popular ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-white/10 text-white hover:bg-white/20"}`}
      >
        {loading === plan.name.toLowerCase() ? "Loading..." : plan.popular ? "Most Popular" : "Choose"}
      </button>
    </div>
  ));

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Pricing</h1>
      <div className="grid md:grid-cols-3 gap-6">{plans}</div>
    </main>
  );
}
