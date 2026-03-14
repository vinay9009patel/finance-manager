import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getChatHistory, sendMessage } from "../services/chatService";
import { addNotification } from "../utils/notificationStore";

const Advisor = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const outgoing = message;
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: outgoing,
        time: new Date().toLocaleTimeString()
      }
    ]);
    setMessage("");
    setLoading(true);

    try {
      const res = await sendMessage(outgoing);
      const aiText = res.aiReply || "AI could not respond";
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiText,
          time: new Date().toLocaleTimeString()
        }
      ]);
      addNotification({
        title: "AI suggestion",
        message: aiText.slice(0, 80),
        type: "ai"
      });
    } catch {
      toast.error("AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        AI Advisor
      </h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto text-sm flex flex-col gap-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-md ${
                  msg.sender === "user"
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {msg.text}
                <p className="text-[10px] text-gray-400 mt-1">
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 text-sm">
              AI is typing...
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <div className="pt-4 border-t border-gray-700 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your finance question..."
            className="flex-1 bg-gray-700 rounded px-3 py-2 outline-none"
          />

          <button
            type="button"
            onClick={handleSend}
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advisor;
