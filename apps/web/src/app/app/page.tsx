"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  Eye,
  MessageSquare,
  FileText,
  Settings,
  X,
  Minimize,
  Download,
  Mail,
  Copy,
  MicOff,
  EyeOff,
  Globe,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { Button, Toggle } from "@angel/ui";
import { Panel, Badge } from "@angel/ui";
import type {
  SessionStatus,
  TranscriptSegment,
  VisionAnalysis,
  Question,
  Note,
  AppSettings,
} from "@angel/types";
import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Tab = "listen" | "vision" | "ask" | "notes" | "settings" | "activity";

const DEFAULT_MODEL_BY_PROVIDER: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  google: "gemini-1.5-flash",
  local: "llama-3.1-8b-instruct",
  custom: "",
  openrouter: "openrouter/auto",
  lmstudio: "llama-3.1-8b-instruct",
};

const defaultSettings: AppSettings = {
  provider: "openai",
  apiKey: "",
  baseUrl: "",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "",
  language: "en",
  realtimeTranslation: false,
  autoHighlight: true,
  killSwitchEnabled: false,
  hideFromTaskbar: false,
  globalShortcut: "CmdOrCtrl+Shift+S",
  captureIntervalMs: 5000,
  localStorageEnabled: true,
  exportDefaultFormat: "markdown",
};

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export default function OverlayPage() {
  const [tab, setTab] = useState<Tab>("listen");
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [vision, setVision] = useState<VisionAnalysis | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newNote, setNewNote] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isMinimized, setIsMinimized] = useState(false);
  const [license, setLicenseState] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const wsRef = useRef<any>(null);
  const settingsRef = useRef(settings);
  const targetLangRef = useRef(targetLanguage);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    targetLangRef.current = targetLanguage;
  }, [targetLanguage]);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const api = (window as any).angelApi;
    if (api?.getLicense) {
      api.getLicense().then((l: string | null) => setLicenseState(l));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const health = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2500) });
        if (!health.ok) throw new Error("offline");
        if (cancelled) return;
        setApiOnline(true);
        setDemoMode(false);
        const r = await fetch(`${API_BASE}/api/settings`);
        const data = await r.json();
        if (data && !data.error) setSettings({ ...defaultSettings, ...data });
      } catch {
        if (cancelled) return;
        setApiOnline(false);
        setDemoMode(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!apiOnline) return;
    const socket = io(API_BASE, { transports: ["websocket", "polling"] });
    wsRef.current = socket as any;
    socket.on("connect", () => {
      socket.emit("join", { app: "browser" });
    });
    socket.on("session.created", (data: any) => {
      sessionRef.current = data.sessionId;
      setSessionId(data.sessionId);
      setStatus("listening");
    });
    socket.on("transcript", (seg: any) => {
      setTranscript((prev) => {
        if (seg?.id && prev.some((p) => p.id === seg.id)) return prev;
        return [...prev, seg];
      });
      const s = settingsRef.current;
      if (s.realtimeTranslation && seg.text) {
        fetch(`${API_BASE}/api/translate`, {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({
            sessionId: seg.sessionId || sessionRef.current,
            sourceSegmentId: seg.id,
            sourceText: seg.text,
            sourceLanguage: s.language,
            targetLanguage: targetLangRef.current,
          }),
        })
          .then((r) => r.json())
          .then((t) => setTranslations((prev) => [t, ...prev].slice(0, 50)))
          .catch(() => {});
      }
    });
    socket.on("vision", (v: any) => setVision(v));
    socket.on("question.answered", (q: any) =>
      setQuestions((prev) => {
        const idx = prev.findIndex((e) => e.id === q.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...q };
          return next;
        }
        return [...prev, q];
      }),
    );
    socket.on("note.created", (n: any) => setNotes((prev) => [n, ...prev]));
    socket.on("status", (d: any) => setStatus(d.status));
    socket.on("kill-switch", (d: any) => setSettings((s) => ({ ...s, killSwitchEnabled: d.enabled })));
    return () => {
      socket.disconnect();
    };
  }, [apiOnline]);

  useEffect(() => {
    if (status !== "listening" || !sessionRef.current || demoMode) return;
    const api = (window as any).angelApi;
    if (!api?.captureScreen) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.captureScreen();
        if (res?.png) {
          const r = await fetch(`${API_BASE}/api/vision`, {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({ sessionId: sessionRef.current, imageBase64: res.png }),
          });
          if (!r.ok) console.error("[vision] API error:", r.status);
        }
      } catch (e) {
        console.error("[vision] capture error:", e);
      }
    }, settings.captureIntervalMs || 5000);
    return () => clearInterval(interval);
  }, [status, settings.captureIntervalMs, demoMode]);

  useEffect(() => {
    if (!sessionRef.current || demoMode) return;
    const sid = sessionRef.current;
    fetch(`${API_BASE}/api/activity?sessionId=${sid}&limit=50`)
      .then((r) => r.json())
      .then((data) => setActivity(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${API_BASE}/api/sessions/${sid}/translations`)
      .then((r) => r.json())
      .then((data) => setTranslations(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${API_BASE}/api/sessions/${sid}/transcript`)
      .then((r) => r.json())
      .then((data) => setTranscript(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${API_BASE}/api/sessions/${sid}/notes`)
      .then((r) => r.json())
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${API_BASE}/api/sessions/${sid}/vision`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setVision(data[data.length - 1]);
      })
      .catch(() => {});
  }, [sessionId, demoMode]);

  const startRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      showToast("Speech recognition not supported. Use Chrome or Edge.", "error");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = settings.language || "en-US";
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (!last?.isFinal) return;
      const text = last[0].transcript.trim();
      if (!text) return;
      if (demoMode || !wsRef.current) {
        const seg: TranscriptSegment = {
          id: crypto.randomUUID(),
          sessionId: sessionRef.current || "demo",
          speaker: "other",
          text,
          startTime: Date.now(),
          endTime: Date.now(),
          isHighlighted: false,
          timestamp: new Date().toISOString(),
        };
        setTranscript((prev) => [...prev, seg]);
        return;
      }
      if (sessionRef.current) {
        (wsRef.current as any).emit("transcript.inject", {
          sessionId: sessionRef.current,
          speaker: "other",
          text,
        });
      }
    };
    rec.onerror = () => {};
    rec.start();
    (window as any).__angelRec = rec;
  }, [settings.language, demoMode, showToast]);

  const toggleListen = useCallback(async () => {
    if (status === "idle" || status === "stopped") {
      if (demoMode || !apiOnline) {
        const id = `demo-${Date.now()}`;
        sessionRef.current = id;
        setSessionId(id);
        setStatus("listening");
        startRecognition();
        showToast("Demo mode — transcript stays in this browser", "success");
        return;
      }
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ app: "browser" }),
      });
      const data = await res.json();
      if (!data?.id) {
        showToast(data?.error ? JSON.stringify(data.error) : "Failed to start session", "error");
        return;
      }
      sessionRef.current = data.id;
      setSessionId(data.id);
      setStatus("listening");
      startRecognition();
    } else if (status === "listening") {
      try {
        (window as any).__angelRec?.stop();
      } catch {}
      setStatus("paused");
    } else {
      startRecognition();
      setStatus("listening");
    }
  }, [status, demoMode, apiOnline, startRecognition, showToast]);

  const askQuestion = useCallback(async () => {
    if (!newQuestion.trim() || !sessionRef.current) return;
    const text = newQuestion;
    const q: Question = {
      id: crypto.randomUUID(),
      sessionId: sessionRef.current,
      text,
      provider: settings.provider,
      model: settings.model,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    setQuestions((prev) => [...prev, q]);
    setNewQuestion("");
    if (demoMode || !apiOnline) {
      const context = transcript
        .slice(-8)
        .map((t) => `[${t.speaker}] ${t.text}`)
        .join("\n");
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id
            ? {
                ...item,
                status: "answered",
                answer: context
                  ? `Demo answer (no API): Based on the recent transcript — ${context.slice(0, 280)}${context.length > 280 ? "…" : ""}`
                  : "Demo mode: start listening first, or run the AngelAi server locally for real AI answers.",
              }
            : item,
        ),
      );
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          sessionId: sessionRef.current,
          question: text,
          provider: settings.provider,
          model: settings.model,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Ask failed — check API key in Settings", "error");
        setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, status: "error" } : item)));
      }
    } catch {
      showToast("Ask failed — is the AngelAi server running?", "error");
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, status: "error" } : item)));
    }
  }, [newQuestion, settings, demoMode, apiOnline, transcript, showToast]);

  const addNote = useCallback(async () => {
    if (!newNote.trim() || !sessionRef.current) return;
    if (demoMode || !apiOnline) {
      const now = new Date().toISOString();
      setNotes((prev) => [
        {
          id: crypto.randomUUID(),
          sessionId: sessionRef.current!,
          content: newNote,
          type: "manual" as const,
          tags: [],
          pinned: false,
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
      setNewNote("");
      return;
    }
    await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ sessionId: sessionRef.current, content: newNote, type: "manual" }),
    });
    setNewNote("");
  }, [newNote, demoMode, apiOnline]);

  const saveSettings = useCallback(async () => {
    if (demoMode || !apiOnline) {
      showToast("Settings saved locally (demo mode)", "success");
      return;
    }
    await fetch(`${API_BASE}/api/settings`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(settings),
    });
    showToast("Settings saved", "success");
  }, [settings, demoMode, apiOnline, showToast]);

  const exportSession = useCallback(
    async (format: string) => {
      if (!sessionRef.current) return;
      if (demoMode || !apiOnline) {
        const blob = new Blob(
          [transcript.map((t) => `[${t.speaker}] ${t.text}`).join("\n")],
          { type: "text/plain" },
        );
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `angelai-export.${format === "markdown" ? "md" : "txt"}`;
        a.click();
        return;
      }
      const res = await fetch(`${API_BASE}/api/export`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ sessionId: sessionRef.current, format }),
      });
      const job = await res.json();
      setTimeout(() => {
        fetch(`${API_BASE}/api/export/${job.id}`)
          .then((r) => r.json())
          .then((j) => {
            if (j.status === "completed" && j.url) {
              const a = document.createElement("a");
              a.href = `${API_BASE}${j.url}`;
              a.download = `angelai-export.${format === "markdown" ? "md" : format}`;
              a.click();
            }
          });
      }, 1500);
    },
    [sessionId, demoMode, apiOnline, transcript],
  );

  const emailExport = useCallback(async () => {
    if (!sessionRef.current) return;
    if (demoMode || !apiOnline) {
      showToast("Email export requires the AngelAi server + SMTP", "error");
      return;
    }
    const to = window.prompt("Enter recipient email address:");
    if (!to) return;
    await fetch(`${API_BASE}/api/export/email`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ sessionId: sessionRef.current, to, format: settings.exportDefaultFormat }),
    });
  }, [settings.exportDefaultFormat, demoMode, apiOnline, showToast]);

  const toggleKillSwitch = useCallback(async () => {
    const next = !settings.killSwitchEnabled;
    if (!demoMode && apiOnline) {
      await fetch(`${API_BASE}/api/kill-switch`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ enabled: next }),
      });
    }
    setSettings((s) => ({ ...s, killSwitchEnabled: next }));
    if (next) setIsMinimized(true);
  }, [settings.killSwitchEnabled, demoMode, apiOnline]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "listen", label: "Listen", icon: Mic },
    { id: "vision", label: "Vision", icon: Eye },
    { id: "ask", label: "Ask", icon: MessageSquare },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-[99999] flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2"
        onClick={() => setIsMinimized(false)}
      >
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)}>
          Open AngelAi
        </Button>
        <Badge variant={settings.killSwitchEnabled ? "destructive" : "success"}>
          {settings.killSwitchEnabled ? "KILLSWITCH" : status}
        </Badge>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--ground)]">
      <header
        className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4 py-2.5"
        style={{ WebkitAppRegion: "drag" } as any}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button, input, select, textarea, [data-no-drag]")) return;
          const startX = e.screenX;
          const startY = e.screenY;
          (window as any).angelApi?.dragStart?.(startX, startY);
          const onMove = (ev: MouseEvent) => (window as any).angelApi?.dragMove?.(ev.screenX, ev.screenY);
          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: "drag" } as any}>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] font-display text-xs font-bold text-[var(--ground)]">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xs font-semibold leading-tight text-[var(--text)]">AngelAi</span>
            <span className="text-[10px] leading-tight text-[var(--muted)]">{status.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5" style={{ WebkitAppRegion: "no-drag" } as any}>
          {demoMode && (
            <Badge variant="secondary" className="text-[10px]">
              DEMO
            </Badge>
          )}
          <Badge variant={status === "listening" ? "success" : "secondary"} className="text-[10px]">
            {status === "listening" ? "LIVE" : status.toUpperCase()}
          </Badge>
          <button
            onClick={toggleListen}
            className={`rounded-md p-1.5 transition-colors ${status === "listening" ? "bg-[var(--negative)] text-white" : "bg-[var(--primary)] text-[var(--ground)]"}`}
            aria-label={status === "listening" ? "Pause listening" : "Start listening"}
          >
            {status === "listening" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--raised)]"
            aria-label="Minimize"
          >
            <Minimize className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => window.close()}
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--raised)]"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {apiOnline === false && (
        <div className="border-b border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-1.5 text-[11px] text-[var(--warning)]">
          API offline — browser demo active. Run `apps/server` locally or use the desktop app for full features.{" "}
          <Link href="/" className="underline">
            Home
          </Link>
        </div>
      )}

      <nav className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--ground)] px-3 py-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-[var(--primary)] text-[var(--ground)]"
                : "text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {tab === "listen" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Badge variant={status === "listening" ? "success" : "secondary"}>
                  {status === "listening" ? "LISTENING" : status.toUpperCase()}
                </Badge>
                <span className="text-xs text-[var(--muted)]">{transcript.length} segments</span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleListen}>
                {status === "idle" || status === "stopped" ? "Start" : status === "listening" ? "Pause" : "Resume"}
              </Button>
            </div>

            {settings.realtimeTranslation && (
              <div className="flex items-center gap-2 px-1">
                <Globe className="h-3.5 w-3.5 text-[var(--muted)]" />
                <span className="text-xs text-[var(--muted)]">Translating to {targetLanguage.toUpperCase()}</span>
              </div>
            )}

            <div
              className="max-h-[60vh] space-y-2 overflow-y-auto"
              ref={(el) => {
                if (el) el.scrollTop = el.scrollHeight;
              }}
            >
              {transcript.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mic className="mb-2 h-8 w-8 text-[var(--faint)]" />
                  <p className="text-sm text-[var(--muted)]">No transcript yet</p>
                  <p className="mt-1 text-xs text-[var(--faint)]">Start listening to capture speech</p>
                </div>
              ) : (
                transcript.map((seg) => {
                  const trans = translations.find((t: any) => t.sourceSegmentId === seg.id);
                  return (
                    <div
                      key={seg.id}
                      className={`flex gap-2.5 rounded-lg p-2.5 ${seg.isHighlighted ? "border border-[var(--primary)]/20 bg-[var(--primary)]/10" : "bg-[var(--raised)]"}`}
                    >
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-bold text-[var(--text)]">
                        {(seg.speaker || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-[var(--faint)]">
                          {new Date(seg.timestamp).toLocaleTimeString()}
                        </div>
                        <div
                          className={`text-sm ${seg.isHighlighted ? "font-medium text-[var(--accent)]" : "text-[var(--body)]"}`}
                        >
                          {seg.text}
                        </div>
                        {trans && (
                          <div className="mt-1 font-mono text-xs italic text-[var(--muted)]">{`→ ${trans.translatedText}`}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {tab === "vision" && (
          <section className="space-y-4">
            <Panel title="Screen Analysis" headerClassName="flex items-center justify-between">
              <Badge variant={vision ? "success" : "secondary"}>{vision ? "ANALYZED" : "IDLE"}</Badge>
            </Panel>
            {vision ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-[var(--raised)] p-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--faint)]">Summary</div>
                  <p className="text-sm text-[var(--body)]">{vision.summary}</p>
                </div>
                <div className="rounded-lg bg-[var(--raised)] p-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--faint)]">Action Items</div>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[var(--body)]">
                    {(vision.actionItems || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-[var(--raised)] p-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--faint)]">Key Points</div>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[var(--body)]">
                    {(vision.keyPoints || []).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                {vision.detectedText && (
                  <div className="rounded-lg bg-[var(--raised)] p-3">
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--faint)]">Detected Text</div>
                    <p className="truncate font-mono text-sm text-[var(--muted)]">{vision.detectedText}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--raised)] text-center">
                <EyeOff className="mb-3 h-12 w-12 text-[var(--faint)]" />
                <p className="px-4 text-sm text-[var(--muted)]">
                  {demoMode
                    ? "Vision needs the desktop app (screen capture)."
                    : "No screen analysis yet. Analysis runs automatically while listening in the desktop app."}
                </p>
              </div>
            )}
          </section>
        )}

        {tab === "ask" && (
          <section className="space-y-4">
            <Panel title="Ask AI" headerClassName="flex items-center justify-between">
              <Badge variant="default">Multi-provider Q&amp;A</Badge>
            </Panel>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Ask a question about the meeting..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                />
                <Button size="sm" onClick={askQuestion} disabled={!newQuestion.trim() || !sessionRef.current}>
                  Ask
                </Button>
              </div>
              <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-2">
                {questions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[var(--faint)]">
                    Ask questions about the conversation in real time.
                  </p>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className={`animate-fade-in rounded-lg border border-[var(--border)] p-3 ${
                        q.status === "answered"
                          ? "bg-[var(--primary)]/10"
                          : q.status === "error"
                            ? "bg-rose-500/10"
                            : "bg-[var(--raised)]"
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-xs font-medium text-[var(--text)]">You</span>
                        <span className="text-xs text-[var(--faint)]">
                          {new Date(q.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mb-2 text-sm text-[var(--body)]">{q.text}</div>
                      {q.answer && (
                        <div className="mt-2 border-l-2 border-[var(--primary)] pl-3 text-sm text-[var(--muted)]">
                          {q.answer}
                        </div>
                      )}
                      {q.status === "error" && <span className="text-xs text-rose-400">Failed to get answer</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {tab === "notes" && (
          <section className="space-y-4">
            <Panel title="Notes" headerClassName="flex items-center justify-between">
              <Badge variant="default">{notes.length} notes</Badge>
            </Panel>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  className="min-w-[12rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--raised)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Add a manual note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                />
                <Button size="sm" onClick={addNote} disabled={!newNote.trim() || !sessionRef.current}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (!sessionRef.current) return;
                    if (demoMode || !apiOnline) {
                      showToast("Auto-notes need the AngelAi server + AI key", "error");
                      return;
                    }
                    await fetch(`${API_BASE}/api/notes/auto`, {
                      method: "POST",
                      headers: jsonHeaders(),
                      body: JSON.stringify({ sessionId: sessionRef.current }),
                    });
                  }}
                  disabled={!sessionRef.current}
                >
                  Auto
                </Button>
              </div>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
                {notes.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[var(--faint)]">
                    No notes yet. Notes are captured automatically and manually.
                  </p>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n.id}
                      className={`animate-fade-in rounded-lg border border-[var(--border)] bg-[var(--raised)] p-3 ${n.pinned ? "border-[var(--primary)]/40" : ""}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-[var(--text)]">
                          {n.type === "auto" ? "Auto" : "Manual"}
                        </span>
                        <span className="text-xs text-[var(--faint)]">
                          {new Date(n.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-[var(--body)]">{n.content}</div>
                      {(n.tags || []).length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {n.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {tab === "activity" && (
          <section className="space-y-4">
            <Panel title="Activity Log" headerClassName="flex items-center justify-between">
              <Badge variant="default">{activity.length} events</Badge>
            </Panel>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-2">
              {activity.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--faint)]">No activity yet.</p>
              ) : (
                activity.map((ev: any) => (
                  <div key={ev.id} className="rounded-lg border border-[var(--border)] bg-[var(--raised)] p-3">
                    <div className="mb-1 flex items-start justify-between">
                      <span className="text-xs font-medium text-[var(--muted)]">{ev.type}</span>
                      <span className="text-xs text-[var(--faint)]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--body)]">{ev.message}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {tab === "settings" && (
          <section className="space-y-4">
            <Panel title="Settings" headerClassName="flex items-center justify-between">
              <Badge variant="default">Configure AngelAi</Badge>
            </Panel>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">AI Provider</label>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  value={settings.provider}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    setSettings({ ...settings, provider: p, model: DEFAULT_MODEL_BY_PROVIDER[p] || settings.model });
                  }}
                >
                  {["openai", "anthropic", "google", "local", "custom", "openrouter", "lmstudio"].map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">Model</label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">API Key</label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  type="password"
                  value={settings.apiKey || ""}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">Base URL</label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  value={settings.baseUrl || ""}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">System Prompt</label>
                <textarea
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  rows={3}
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                  placeholder="Custom instructions for the AI..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">Language</label>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">Translation Target Language</label>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                >
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  label="Real-time Translation"
                  checked={settings.realtimeTranslation}
                  onCheckedChange={(v) => setSettings({ ...settings, realtimeTranslation: v })}
                />
                <Toggle
                  label="Auto Highlight"
                  checked={settings.autoHighlight}
                  onCheckedChange={(v) => setSettings({ ...settings, autoHighlight: v })}
                />
                <Toggle label="Kill Switch" checked={settings.killSwitchEnabled} onCheckedChange={toggleKillSwitch} />
                <Toggle
                  label="Hide from Taskbar"
                  checked={settings.hideFromTaskbar}
                  onCheckedChange={(v) => setSettings({ ...settings, hideFromTaskbar: v })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">Global Shortcut</label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  value={settings.globalShortcut}
                  onChange={(e) => setSettings({ ...settings, globalShortcut: e.target.value })}
                />
              </div>
              <div className="space-y-2 border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted)]">License</span>
                  <span className={`text-xs ${license ? "text-[var(--primary)]" : "text-[var(--faint)]"}`}>
                    {license ? "Activated" : "Free tier"}
                  </span>
                </div>
                {!license && (
                  <button
                    className="w-full rounded-lg bg-[var(--primary)] py-2 font-semibold text-[var(--ground)] hover:bg-[var(--primary-hover)]"
                    onClick={async () => {
                      if (demoMode || !apiOnline) {
                        setLicenseState(btoa(`demo:${Date.now()}`));
                        showToast("Demo license activated locally", "success");
                        return;
                      }
                      const api = (window as any).angelApi;
                      const sid = `dev-${Date.now()}`;
                      const res = await fetch(`${API_BASE}/api/activate`, {
                        method: "POST",
                        headers: jsonHeaders(),
                        body: JSON.stringify({ sessionId: sid }),
                      });
                      const data = await res.json();
                      if (data.license) {
                        if (api?.setLicense) await api.setLicense(data.license);
                        setLicenseState(data.license);
                        showToast("Activated!", "success");
                      } else {
                        showToast(data.error || "Activation failed", "error");
                      }
                    }}
                  >
                    Activate (dev)
                  </button>
                )}
                {license && (
                  <button
                    className="w-full rounded-lg bg-[var(--raised)] py-2 text-sm text-[var(--text)] hover:bg-[var(--active)]"
                    onClick={async () => {
                      const api = (window as any).angelApi;
                      if (api?.clearLicense) await api.clearLicense();
                      setLicenseState(null);
                    }}
                  >
                    Deactivate
                  </button>
                )}
              </div>
              <div className="flex gap-2 border-t border-[var(--border)] pt-4">
                <Button variant="danger" size="sm" onClick={() => setSettings(defaultSettings)}>
                  Reset Settings
                </Button>
                <Button variant="primary" size="sm" onClick={saveSettings}>
                  Save Settings
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="flex justify-between border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[10px] text-[var(--faint)]">
        <div>AngelAi v2.1.6 · Invisible Assistant</div>
        <div className="flex gap-3">
          <button className="text-[var(--muted)] hover:text-[var(--text)]" title="Export PDF" onClick={() => exportSession("pdf")}>
            <Download className="h-3 w-3" />
          </button>
          <button className="text-[var(--muted)] hover:text-[var(--text)]" title="Export MD" onClick={() => exportSession("markdown")}>
            <Download className="h-3 w-3" />
          </button>
          <button className="text-[var(--muted)] hover:text-[var(--text)]" title="Email Export" onClick={emailExport}>
            <Mail className="h-3 w-3" />
          </button>
          <button
            className="text-[var(--muted)] hover:text-[var(--text)]"
            title="Copy"
            onClick={() => {
              const text = transcript.map((t: any) => `[${t.speaker}] ${t.text}`).join("\n");
              navigator.clipboard?.writeText(text);
              showToast("Copied transcript", "success");
            }}
          >
            <Copy className="h-3 w-3" />
          </button>
          {settings.killSwitchEnabled && (
            <span className="flex items-center gap-1 text-xs text-rose-400">
              <ShieldAlert className="h-3 w-3" /> KILLSWITCH ARMED
            </span>
          )}
        </div>
      </footer>
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all ${
            toast.type === "error" ? "bg-rose-500/90 text-white" : "bg-emerald-500/90 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
