import React, { useState } from "react";
import { geminiChat } from "../../services/geminiApi";

function compactText(text, maxWords = 95) {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "";
  const words = normalized.split(" ");
  if (words.length <= maxWords) return normalized;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export default function ChatBox({ userContext = {}, guidance = {} }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    try {
      const reply = await geminiChat(input, { userContext, guidance });
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: compactText(reply || "Sorry, I couldn't answer that right now.") }
      ]);
    } catch {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Sorry, I couldn't answer that." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
      >
        ✦
      </button>
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[20rem] max-w-[92vw] glass-card rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-white/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Assistant</p>
                <h3 className="font-semibold text-slate-900">Election Help</h3>
              </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Close chat"
              type="button"
            >
              ✕
            </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-white/40" style={{ maxHeight: 300 }}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === "user" ? "text-right" : "text-left"}>
                <span
                  className={
                    msg.from === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }
                  style={{
                    borderRadius: 14,
                    padding: "7px 12px",
                    display: "inline-block",
                    marginBottom: 2,
                    maxWidth: "88%"
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-slate-400 text-sm">Typing…</div>}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-200 px-2 py-2 bg-white/70">
            <input
              className="flex-1 p-2 rounded-xl outline-none border border-slate-200 text-sm bg-white"
              placeholder="Ask about voting..."
              aria-label="Type your voting question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn-primary px-3 py-2 text-sm"
              disabled={loading || !input.trim()}
              type="submit"
              aria-label="Send chat message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
