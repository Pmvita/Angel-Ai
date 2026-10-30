"use client";

export default function ErrorPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold">Overlay Error</h1>
      <button className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  );
}

