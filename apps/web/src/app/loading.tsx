import React from "react";

export default function LoadingPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-white/70 text-sm">Starting angel overlay...</p>
    </div>
  );
}

