import React, { useState } from "react";
import PropTypes from "prop-types";
import { geminiChat } from "../../services/geminiApi";
import { trackEvent } from "../../services/analytics";

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
    trackEvent("chat_message_sent");
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
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Election Assistant chat" : "Open Election Assistant chat"}
        aria-expanded={open}
        aria-controls="chat-dialog"
      >
        💬
      </button>
      {open && (
        <div
          id="chat-dialog"
          className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Election Assistant Chat"
          >
          <div className="p-3 border-b font-semibold text-blue-800 flex items-center justify-between">
            <h2>Election Assistant</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded p-1"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 320 }} aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === "user" ? "text-right" : "text-left"}>
                <span
                  className={
                    msg.from === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-slate-100 text-slate-800"
                  }
                  style={{
                    borderRadius: 12,
                    padding: "6px 12px",
                    display: "inline-block",
                    marginBottom: 2
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-slate-600 text-sm font-medium" aria-label="Assistant is typing">
                Typing…
              </div>
            )}
          </div>
          <form
            onSubmit={sendMessage}
            className="flex border-t"
            aria-label="Send a message to the assistant"
          >
            <label htmlFor="chat-input" className="sr-only">Type your message</label>
            <input
              id="chat-input"
              className="flex-1 p-2 rounded-bl-xl outline-none focus:bg-slate-50 text-slate-900"
              placeholder="Ask about voting..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              className="px-4 text-blue-700 font-bold focus:outline-none focus:bg-blue-50 hover:bg-blue-100 rounded-br-xl"
              disabled={loading || !input.trim()}
              type="submit"
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

ChatBox.propTypes = {
  userContext: PropTypes.object,
  guidance: PropTypes.object
};
