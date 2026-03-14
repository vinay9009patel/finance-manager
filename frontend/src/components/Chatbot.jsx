import { useEffect, useRef, useState } from "react";
import { getChatHistory, sendMessage } from "../services/chatService";
import { addNotification } from "../utils/notificationStore";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const suggestions = [
    "How can I save money?",
    "Give me budgeting tips",
    "How to reduce expenses?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getChatHistory();
        const mapped = data.flatMap((item) => ([
          {
            sender: "user",
            text: item.userMessage,
            time: new Date(item.createdAt).toLocaleTimeString()
          },
          {
            sender: "ai",
            text: item.aiReply,
            time: new Date(item.createdAt).toLocaleTimeString()
          }
        ]));
        setMessages(mapped);
      } catch {
        setMessages([]);
      }
    };

    loadHistory();
  }, []);

  const typeMessage = (text) => {
    let index = 0;

    const typingInterval = setInterval(() => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];

        if (lastMsg?.sender === "ai") {
          lastMsg.text = text.slice(0, index + 1);
          return [...prev.slice(0, -1), lastMsg];
        }

        return prev;
      });

      index++;

      if (index === text.length) {
        clearInterval(typingInterval);
      }
    }, 25);
  };

  const handleSend = async (customText) => {
    const text = customText || message;
    if (!text.trim()) return;

    const userMsg = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await sendMessage(text);
      const aiText = res.aiReply || "AI could not respond";

      addNotification({
        title: "AI suggestion",
        message: aiText.slice(0, 80),
        type: "ai"
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "",
          time: new Date().toLocaleTimeString()
        }
      ]);

      setLoading(false);
      typeMessage(aiText);
    } catch {
      const errorMsg = {
        sender: "ai",
        text: "Something went wrong. Please try again.",
        time: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, errorMsg]);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-xl text-white shadow-[0_18px_35px_rgba(34,197,94,0.34)] transition hover:-translate-y-1 hover:bg-green-400 active:scale-[0.98]"
      >
        AI
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(15,23,42,0.92))] text-white shadow-[0_24px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="border-b border-white/6 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
                  Finance Copilot
                </p>
                <h3 className="mt-1 font-semibold text-white">
                  AI Assistant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] min-h-[24rem] overflow-y-auto p-4 text-sm">
            {messages.length === 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left text-sm text-gray-200 transition hover:border-green-400/15 hover:bg-white/[0.06]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-3 ${
                    msg.sender === "user"
                      ? "bg-green-500 text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]"
                      : "border border-white/8 bg-white/[0.04] text-gray-200"
                  }`}
                >
                  {msg.text}
                  <p className="mt-2 text-[10px] text-gray-300/80">
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-gray-400">
                AI is typing...
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          <div className="border-t border-white/6 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Ask about budget, expenses, savings..."
                className="flex-1 rounded-2xl border border-white/8 bg-gray-800/90 px-4 py-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10"
              />

              <button
                onClick={() => handleSend()}
                className="rounded-2xl bg-green-500 px-4 py-3 font-medium text-white transition hover:bg-green-400 active:scale-[0.98]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
