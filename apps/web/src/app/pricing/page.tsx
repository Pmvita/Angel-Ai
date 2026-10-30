export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Pricing</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {[
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
        ].map((plan) => (
          <div key={plan.name} className={`rounded-2xl border p-6 ${plan.popular ? "border-emerald-500 bg-black/40" : "border-white/10"}`}>
            <h2 className={plan.popular ? "text-emerald-400 text-xl font-semibold" : "text-white text-xl font-semibold"}>{plan.name}</h2>
            <div className="my-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-white/50 text-sm">{plan.desc}</span>
            </div>
            <ul className="space-y-2 text-sm text-white/70 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-2 rounded-lg font-semibold transition-colors ${plan.popular ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-white/10 text-white hover:bg-white/20"}`}>
              {plan.popular ? "Most Popular" : "Choose"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

