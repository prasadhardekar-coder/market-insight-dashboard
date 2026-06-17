import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, Volume2, VolumeX, Sparkles, RotateCcw } from "lucide-react";
import { answerQuestion, suggestedStarters } from "../lib/chatbotEngine";
import { TOPICS, entriesByTopic } from "../lib/chatbotKnowledge";
import { speak } from "../lib/speak";

interface Msg {
  id: number;
  from: "bot" | "user";
  text: string;
  topic?: string;
  followUps?: string[];
  confidence?: number;
  timestamp: number;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [audioOn, setAudioOn] = useState(false);
  const [typing, setTyping] = useState(false);
  const [view, setView] = useState<"chat" | "topics">("chat");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 1,
      from: "bot",
      text: "Hi! I'm AeroBot 🤖 — your AI assistant for airport environmental monitoring. Ask me anything about noise, predictions, aircraft, health, or any AeroSense feature!",
      topic: "Introduction",
      followUps: ["What airports do you monitor?", "Explain the heatmap", "What is safe noise?"],
      confidence: 1,
      timestamp: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const addBotMessage = (text: string, topic?: string, followUps?: string[], confidence?: number) => {
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        { id: Date.now() + Math.random(), from: "bot", text, topic, followUps, confidence, timestamp: Date.now() },
      ]);
      setTyping(false);
      if (audioOn) speak(text);
    }, 600 + Math.random() * 400);
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;

    // Quick commands
    if (q.toLowerCase() === "/topics" || q.toLowerCase() === "topics") {
      setView("topics");
      setInput("");
      return;
    }
    if (q.toLowerCase() === "/mute" || q.toLowerCase() === "mute") {
      setAudioOn(false);
      setMsgs((m) => [...m, { id: Date.now(), from: "bot", text: "🔇 Audio muted.", timestamp: Date.now() }]);
      setInput("");
      return;
    }
    if (q.toLowerCase() === "/speak" || q.toLowerCase() === "speak") {
      setAudioOn(true);
      setMsgs((m) => [...m, { id: Date.now(), from: "bot", text: "🔊 Audio enabled — I'll speak my replies!", timestamp: Date.now() }]);
      setInput("");
      return;
    }

    setMsgs((m) => [...m, { id: Date.now(), from: "user", text: q, timestamp: Date.now() }]);
    setInput("");
    const result = answerQuestion(q);
    addBotMessage(result.answer, result.topic, result.followUps, result.confidence);
  };

  const reset = () => {
    setMsgs([{
      id: 1,
      from: "bot",
      text: "Conversation reset. What would you like to know?",
      topic: "Introduction",
      followUps: suggestedStarters(),
      confidence: 1,
      timestamp: Date.now(),
    }]);
  };

  const pickTopic = (topicId: string) => {
    const entries = entriesByTopic(topicId);
    if (entries.length === 0) return;
    const entry = entries[0];
    setMsgs((m) => [
      ...m,
      { id: Date.now(), from: "user", text: `Tell me about ${entry.topic}`, timestamp: Date.now() },
    ]);
    setView("chat");
    addBotMessage(entry.answer, entry.topic, entry.followUps, 0.95);
  };

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[55] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-2xl shadow-sky-500/40 transition-transform hover:scale-110"
        aria-label="Open chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[55] flex h-[32rem] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl fade-slide-in">
          {/* Header */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#202A36] to-[#2c3a4d] px-4 py-3 text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500">
              <Bot className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">AeroBot</p>
              <p className="flex items-center gap-1 text-[10px] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AI assistant
              </p>
            </div>
            <button
              onClick={() => setView(view === "chat" ? "topics" : "chat")}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Browse topics"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => setAudioOn((a) => !a)}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${audioOn ? "bg-sky-500/30 text-sky-200" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              title={audioOn ? "Mute audio" : "Enable audio"}
            >
              {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={reset}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {view === "chat" ? (
            <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4">
              <div className="space-y-3">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${m.from === "user" ? "" : ""}`}>
                      {m.from === "bot" && m.topic && (
                        <div className="mb-1 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">{m.topic}</span>
                          {typeof m.confidence === "number" && m.confidence < 0.7 && (
                            <span className="text-amber-500">· best guess</span>
                          )}
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.from === "user"
                            ? "bg-gradient-to-br from-sky-500 to-violet-600 text-white rounded-br-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm rounded-bl-sm border border-slate-100 dark:border-slate-700"
                        }`}
                      >
                        {m.text}
                      </div>
                      {m.from === "bot" && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button
                            onClick={() => speak(m.text)}
                            className="flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 transition-colors hover:bg-sky-100 dark:hover:bg-sky-950 hover:text-sky-600 dark:hover:text-sky-400"
                            title="Read aloud"
                          >
                            <Volume2 className="h-2.5 w-2.5" /> Listen
                          </button>
                        </div>
                      )}
                      {m.followUps && m.from === "bot" && m.followUps.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.followUps.map((f) => (
                            <button
                              key={f}
                              onClick={() => send(f)}
                              className="rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300 transition-colors hover:bg-sky-100 dark:hover:bg-sky-900"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex gap-1">
                        <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {msgs.length === 1 && !typing && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Try asking</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedStarters().slice(0, 4).map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:border-sky-300 hover:text-sky-600 dark:hover:text-sky-400"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Topics view */
            <div className="scrollbar-thin flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4">
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Browse by topic — tap any to dive in.</p>
              <div className="grid grid-cols-2 gap-2">
                {TOPICS.map((t) => {
                  const count = entriesByTopic(t.id).length;
                  return (
                    <button
                      key={t.id}
                      onClick={() => pickTopic(t.id)}
                      className="group flex flex-col items-start rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-left transition-all hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950"
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{t.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{count} answer{count === 1 ? "" : "s"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={view === "chat" ? "Ask anything about AeroSense…" : "Type a question…"}
              onFocus={() => setView("chat")}
              className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-400 dark:focus:border-sky-500"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-white transition-all hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-[9px] text-slate-400 dark:text-slate-500">
            {audioOn ? "🔊 Audio replies enabled" : "🔇 Click the speaker icon to hear replies"} · /topics to browse · /speak or /mute
          </div>
        </div>
      )}
    </>
  );
}
