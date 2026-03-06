import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI market assistant. Ask me about stock predictions, news sentiment, or market trends." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", content: data.response }]);
      } else {
        throw new Error();
      }
    } catch {
      // Mock response
      const mockResponses = [
        "Based on current market analysis, the stock shows strong momentum with positive sentiment from institutional investors.",
        "The AI model indicates a bullish trend driven by strong earnings and positive social media sentiment.",
        "Looking at the technical indicators and news sentiment, I'd recommend monitoring the support levels closely.",
        "Social sentiment analysis shows increasing positive mentions, which historically correlates with upward price movement.",
      ];
      setTimeout(() => {
        setMessages((m) => [...m, { role: "assistant", content: mockResponses[Math.floor(Math.random() * mockResponses.length)] }]);
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform glow-green"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] glass-card flex flex-col animate-slide-up shadow-2xl">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">AI Market Assistant</span>
            <div className="w-2 h-2 rounded-full bg-bullish pulse-dot ml-1" />
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-accent" : "bg-primary/20"}`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className={`max-w-[75%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about markets..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-primary text-primary-foreground rounded-lg p-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
