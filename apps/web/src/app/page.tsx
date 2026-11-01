"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Mic, Eye, MessageSquare, FileText, Settings, X, Minimize, Download, Mail, Copy, MicOff, EyeOff, Globe, ShieldAlert, Activity } from "lucide-react";
import { Button, Card, Toggle } from "@angel/ui";
import { Panel, Badge } from "@angel/ui";
import type { SessionStatus, TranscriptSegment, VisionAnalysis, Question, Note, AppSettings } from "@angel/types";
import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Tab = "listen" | "vision" | "ask" | "notes" | "settings" | "activity";

export default function OverlayPage() {
  const [tab, setTab] = useState<Tab>("listen");
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [vision, setVision] = useState<VisionAnalysis | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const DEFAULT_MODEL_BY_PROVIDER: Record<string, string> = {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-haiku-20240307",
    google: "gemini-1.5-flash",
    local: "llama-3.1-8b-instruct",
    custom: "",
    openrouter: "openrouter/auto",
    lmstudio: "llama-3.1-8b-instruct",
  };
  const [activity, setActivity] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newNote, setNewNote] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [settings, setSettings] = useState<AppSettings>({
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
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [license, setLicenseState] = useState<string | null>(null);

  useEffect(() => {
    const api = (window as any).angelApi;
    if (api?.getLicense) {
      api.getLicense().then((l: string | null) => setLicenseState(l));
    }
  }, []);
  const sessionRef = useRef<string | null>(null);
  const wsRef = useRef<any>(null);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket", "polling"] });
    wsRef.current = socket as any;
    socket.on("connect", () => {
      socket.emit("join", { app: "browser" });
    });
    socket.on("session.created", (data: any) => {
      sessionRef.current = data.sessionId;
      setStatus("listening");
    });
    socket.on("transcript", (seg: any) => {
      setTranscript((prev) => [...prev, seg]);
      if (settings.realtimeTranslation && seg.text) {
        fetch(`${API_BASE}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: seg.sessionId || sessionRef.current,
            sourceSegmentId: seg.id,
            sourceText: seg.text,
            sourceLanguage: settings.language,
            targetLanguage: targetLanguage,
          }),
        }).then((r) => r.json()).then((t) => {
          setTranslations((prev) => [t, ...prev].slice(0, 50));
        });
      }
    });
    socket.on("vision", (v: any) => setVision(v));
    socket.on("question.answered", (q: any) => setQuestions((prev) => [...prev, q]));
    socket.on("note.created", (n: any) => setNotes((prev) => [n, ...prev]));
    socket.on("status", (d: any) => setStatus(d.status));
    socket.on("kill-switch", (d: any) => setSettings((s) => ({ ...s, killSwitchEnabled: d.enabled })));
    return () => { socket.disconnect(); };
  }, [settings.realtimeTranslation, settings.language, targetLanguage]);

  useEffect(() => {
    if (status !== "listening" || !sessionRef.current) return;
    const api = (window as any).angelApi;
    if (!api?.captureScreen) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.captureScreen();
        if (res?.png) {
          await fetch(`${API_BASE}/api/vision`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sessionRef.current, imageBase64: res.png }),
          });
        }
      } catch {}
    }, settings.captureIntervalMs || 5000);
    return () => clearInterval(interval);
  }, [status, settings.captureIntervalMs]);

  useEffect(() => {
    if (sessionRef.current) {
      fetch(`${API_BASE}/api/activity?sessionId=${sessionRef.current}&limit=50`)
        .then((r) => r.json())
        .then((data) => setActivity(data));
      fetch(`${API_BASE}/api/sessions/${sessionRef.current}/translations`)
        .then((r) => r.json())
        .then((data) => setTranslations(data));
    }
  }, [sessionRef.current]);

  const toggleListen = useCallback(async () => {
    if (status === "idle" || status === "stopped") {
      const res = await fetch(`${API_BASE}/api/sessions`, { method: "POST", body: JSON.stringify({ app: "browser" }) });
      const data = await res.json();
      sessionRef.current = data.id;
      setStatus("listening");
      // Client-side speech capture (Web Speech API) -> inject into server pipeline
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = settings.language || "en-US";
        rec.onresult = (e: any) => {
          const last = e.results[e.results.length - 1];
          if (last && last.isFinal) {
            const text = last[0].transcript.trim();
            if (text && sessionRef.current && wsRef.current) {
              (wsRef.current as any).emit("transcript.inject", { sessionId: sessionRef.current, speaker: "other", text });
            }
          }
        };
        rec.onerror = () => {};
        rec.start();
        (window as any).__angelRec = rec;
      }
    } else if (status === "listening") {
      await fetch(`${API_BASE}/api/sessions/${sessionRef.current}/stop`, { method: "POST" });
      try { (window as any).__angelRec?.stop(); } catch {}
      setStatus("paused");
    } else {
      setStatus("listening");
    }
  }, [status, settings.language]);

  const askQuestion = useCallback(async () => {
    if (!newQuestion.trim() || !sessionRef.current) return;
    const text = newQuestion;
    const q: Question = { id: crypto.randomUUID(), sessionId: sessionRef.current, text, provider: settings.provider, model: settings.model, status: "pending", timestamp: new Date().toISOString() };
    setQuestions((prev) => [...prev, q]);
    setNewQuestion("");
    await fetch(`${API_BASE}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionRef.current, question: text, provider: settings.provider, model: settings.model }),
    });
  }, [newQuestion, sessionRef.current, settings]);

  const addNote = useCallback(async () => {
    if (!newNote.trim() || !sessionRef.current) return;
    await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      body: JSON.stringify({ sessionId: sessionRef.current, content: newNote, type: "manual" }),
    });
    setNewNote("");
  }, [newNote, sessionRef.current]);

  const saveSettings = useCallback(async () => {
    await fetch(`${API_BASE}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  }, [settings]);

  const exportSession = useCallback(async (format: string) => {
    if (!sessionRef.current) return;
    const res = await fetch(`${API_BASE}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionRef.current, format }),
    });
    const job = await res.json();
    setTimeout(() => {
      fetch(`${API_BASE}/api/export/${job.id}`).then((r) => r.json()).then((j) => {
        if (j.status === "completed" && j.url) {
          const a = document.createElement("a");
          a.href = `${API_BASE}${j.url}`;
          a.download = `angel-export.${format === "markdown" ? "md" : format}`;
          a.click();
        }
      });
    }, 1500);
  }, [sessionRef.current]);

  const emailExport = useCallback(async () => {
    if (!sessionRef.current) return;
    const to = window.prompt("Enter recipient email address:");
    if (!to) return;
    await fetch(`${API_BASE}/api/export/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionRef.current, to, format: settings.exportDefaultFormat }),
    });
  }, [sessionRef.current, settings.exportDefaultFormat]);

  const toggleKillSwitch = useCallback(async () => {
    const next = !settings.killSwitchEnabled;
    await fetch(`${API_BASE}/api/kill-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setSettings((s) => ({ ...s, killSwitchEnabled: next }));
  }, [settings.killSwitchEnabled]);

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
      <div className="fixed bottom-6 right-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 z-[99999] flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)}>Open angel</Button>
        <Badge variant={settings.killSwitchEnabled ? "destructive" : "success"}>
          {settings.killSwitchEnabled ? "KILLSWITCH" : status}
        </Badge>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--ground)]">
      {/* Header status bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--primary)] flex items-center justify-center text-white font-semibold text-xs">A</div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--text)] leading-tight">Angel-Ai</span>
            <span className="text-[10px] text-[var(--muted)] leading-tight">{status.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={status === "listening" ? "success" : "secondary"} className="text-[10px]">
            {status === "listening" ? "LIVE" : status.toUpperCase()}
          </Badge>
          <button onClick={toggleListen} className={`p-1.5 rounded-md transition-colors ${status === "listening" ? "bg-[var(--negative)] text-white" : "bg-[var(--primary)] text-white"}`}>
            {status === "listening" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--raised)]">
            <Minimize className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => window.close()} className="p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--raised)]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--ground)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {tab === "listen" && (
            <section className="space-y-4">
              <Panel title="Live Transcript" headerClassName="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={status === "listening" ? "success" : "secondary"}>
                    {status === "listening" ? "LISTENING" : "IDLE"}
                  </Badge>
                  <span className="text-xs text-white/60 ml-2">{transcript.length} segments</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={toggleListen} disabled={status === "idle"}>
                    {status === "idle" ? "Start" : status === "listening" ? "Pause" : "Resume"}
                  </Button>
                </div>
              </Panel>

              {settings.realtimeTranslation && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--muted)]" />
                  <span className="text-xs text-[var(--muted)]">Real-time translation to {targetLanguage.toUpperCase()}</span>
                </div>
              )}

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {transcript.length === 0 ? (
                  <p className="text-center text-white/40 text-sm py-8">No transcript yet. Start listening to capture speech.</p>
                ) : (
                  transcript.map((seg) => {
                    const trans = translations.find((t: any) => t.sourceSegmentId === seg.id);
                    return (
                      <div key={seg.id} className={`flex gap-3 animate-fade-in ${seg.isHighlighted ? "bg-[var(--primary)]/10" : ""}`}>
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border border-white/20 bg-[var(--surface)]/10">
                          {seg.speaker.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-white/50">{new Date(seg.timestamp).toLocaleTimeString()}</div>
                          <div className={`text-sm ${seg.isHighlighted ? "text-[var(--muted)] font-semibold" : "text-white/90"}`}>{seg.text}</div>
                          {trans && (
                            <div className="text-xs text-white/40 font-mono mt-1 italic">{`→ ${trans.translatedText}`}</div>
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
                <Card className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-white/10 bg-[var(--raised)]">
                      <div className="text-xs text-white/50 uppercase tracking-wider">Summary</div>
                      <p className="text-sm text-white/90 mt-1">{vision.summary}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-white/10 bg-[var(--raised)]">
                      <div className="text-xs text-white/50 uppercase tracking-wider">Action Items</div>
                      <ul className="text-sm text-white/90 mt-1 space-y-1 list-disc list-inside">
                        {vision.actionItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[var(--raised)]">
                    <div className="text-xs text-white/50 uppercase tracking-wider">Key Points</div>
                    <ul className="text-sm text-white/90 mt-1 space-y-1 list-disc list-inside">
                      {vision.keyPoints.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  {vision.detectedText && (
                    <div className="p-3 rounded-lg border border-white/10 bg-[var(--raised)]">
                      <div className="text-xs text-white/50 uppercase tracking-wider">Detected Text</div>
                      <p className="text-sm text-white/70 font-mono mt-1 truncate">{vision.detectedText}</p>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-[var(--raised)] text-center">
                  <EyeOff className="w-12 h-12 text-white/20 mb-3" />
                  <p className="text-white/60 text-sm">No screen analysis yet. Analysis runs automatically while listening.</p>
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
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    placeholder="Ask a question about the meeting..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                  />
                  <Button size="sm" onClick={askQuestion} disabled={!newQuestion.trim() || !sessionRef.current}>
                    Ask
                  </Button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                  {questions.length === 0 ? (
                    <p className="text-center text-white/40 text-sm py-8">Ask questions about the conversation in real time.</p>
                  ) : (
                    questions.map((q) => (
                      <div key={q.id} className={`p-3 rounded-lg border border-white/10 animate-fade-in ${q.status === "answered" ? "bg-[var(--primary)]/10" : q.status === "error" ? "bg-rose-500/10" : "bg-[var(--raised)]"}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-white/90">You</span>
                          <span className="text-xs text-white/50">{new Date(q.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-sm text-white/80 mb-2">{q.text}</div>
                        {q.answer && (
                          <div className="text-sm text-[var(--muted)] border-l-2 border-[var(--primary)] pl-3 mt-2">{q.answer}</div>
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
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    placeholder="Add a manual note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNote()}
                  />
                  <Button size="sm" onClick={addNote} disabled={!newNote.trim() || !sessionRef.current}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!sessionRef.current) return;
                    await fetch(`${API_BASE}/api/notes/auto`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: sessionRef.current }) });
                  }} disabled={!sessionRef.current}>
                    Auto
                  </Button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-center text-white/40 text-sm py-8">No notes yet. Notes are captured automatically and manually.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className={`p-3 rounded-lg border border-white/10 bg-[var(--raised)] animate-fade-in ${n.pinned ? "border-[var(--primary)]/40" : ""}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-white/90">{n.type === "auto" ? "Auto" : "Manual"}</span>
                          <span className="text-xs text-white/50">{new Date(n.updatedAt).toLocaleTimeString()}</span>
                          <Badge variant={n.pinned ? "success" : "outline"}>{n.pinned ? "Pinned" : ""}</Badge>
                        </div>
                        <div className="text-sm text-white/90 whitespace-pre-wrap">{n.content}</div>
                        {n.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {n.tags.map((tag) => (
                              <Badge key={tag} variant="outline">#{tag}</Badge>
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

              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-2">
                {activity.length === 0 ? (
                  <p className="text-center text-white/40 text-sm py-8">No activity yet.</p>
                ) : (
                  activity.map((ev: any) => (
                    <div key={ev.id} className="p-3 rounded-lg border border-white/10 bg-[var(--raised)]">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-white/70">{ev.type}</span>
                        <span className="text-xs text-white/40">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm text-white/80">{ev.message}</div>
                      {ev.metadata && (
                        <div className="text-xs text-white/50 font-mono mt-1">{JSON.stringify(ev.metadata)}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {tab === "settings" && (
            <section className="space-y-4">
              <Panel title="Settings" headerClassName="flex items-center justify-between">
                <Badge variant="default">Configure angel</Badge>
              </Panel>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">AI Provider</label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    value={settings.provider}
                    onChange={(e) => {
                      const p = e.target.value as any;
                      setSettings({ ...settings, provider: p, model: DEFAULT_MODEL_BY_PROVIDER[p] || settings.model });
                    }}
                  >
                    {["openai", "anthropic", "google", "local", "custom", "openrouter", "lmstudio"].map((p) => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Model</label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    value={settings.model}
                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">API Key</label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    type="password"
                    value={settings.apiKey || ""}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Base URL</label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    value={settings.baseUrl || ""}
                    onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">System Prompt</label>
                  <textarea
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    rows={3}
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                    placeholder="Custom instructions for the AI..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Language</label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
                  <label className="text-xs font-medium text-white/70">Translation Target Language</label>
                  <select
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
                  <Toggle label="Real-time Translation" checked={settings.realtimeTranslation} onCheckedChange={(v) => setSettings({ ...settings, realtimeTranslation: v })} />
                  <Toggle label="Auto Highlight" checked={settings.autoHighlight} onCheckedChange={(v) => setSettings({ ...settings, autoHighlight: v })} />
                  <Toggle label="Kill Switch" checked={settings.killSwitchEnabled} onCheckedChange={toggleKillSwitch} />
                  <Toggle label="Hide from Taskbar" checked={settings.hideFromTaskbar} onCheckedChange={(v) => setSettings({ ...settings, hideFromTaskbar: v })} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Global Shortcut</label>
                  <input
                    className="w-full rounded-lg border border-white/20 bg-[var(--raised)] px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    value={settings.globalShortcut}
                    onChange={(e) => setSettings({ ...settings, globalShortcut: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/70">License</span>
                    <span className={`text-xs ${license ? "text-[var(--muted)]" : "text-white/40"}`}>{license ? "Activated" : "Free tier"}</span>
                  </div>
                  {!license && (
                    <button
                      className="w-full py-2 rounded-lg bg-[var(--primary)] text-[var(--text)] font-semibold hover:bg-[var(--muted)]"
                      onClick={async () => {
                        const api = (window as any).angelApi;
                        const sid = `dev-${Date.now()}`;
                        const res = await fetch(`${API_BASE}/api/activate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: sid }) });
                        const data = await res.json();
                        if (data.license) {
                          if (api?.setLicense) await api.setLicense(data.license);
                          setLicenseState(data.license);
                          alert("Activated!");
                        } else {
                          alert(data.error || "Activation failed");
                        }
                      }}
                    >
                      Activate (dev)
                    </button>
                  )}
                  {license && (
                    <button
                      className="w-full py-2 rounded-lg bg-[var(--surface)]/10 text-white hover:bg-[var(--surface)]/20 text-sm"
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
                <div className="pt-4 border-t border-white/10 flex gap-2">
                  <Button variant="danger" size="sm" onClick={() => setSettings({
                    provider: "openai",
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
                  })}>Reset Settings</Button>
                  <Button variant="primary" size="sm" onClick={saveSettings}>Save Settings</Button>
                </div>
              </div>
            </section>
          )}
        </div>

      <footer className="px-4 py-2 border-t border-white/10 bg-[var(--surface)] text-[10px] text-white/40 flex justify-between">
        <div>Angel-Ai v2.0.3 · Invisible Assistant</div>
        <div className="flex gap-3">
          <button className="text-white/60 hover:text-white" title="Export PDF" onClick={() => exportSession("pdf")}>
            <Download className="w-3 h-3" />
          </button>
          <button className="text-white/60 hover:text-white" title="Export MD" onClick={() => exportSession("markdown")}>
            <Download className="w-3 h-3" />
          </button>
          <button className="text-white/60 hover:text-white" title="Email Export" onClick={emailExport}>
            <Mail className="w-3 h-3" />
          </button>
          <button className="text-white/60 hover:text-white" title="Copy" onClick={() => {}}>
            <Copy className="w-3 h-3" />
          </button>
          {settings.killSwitchEnabled && (
            <span className="text-xs text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> KILLSWITCH ARMED
            </span>
          )}
        </div>
      </footer>
    </main>
  );
}

