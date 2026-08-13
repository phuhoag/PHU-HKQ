import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  MdChat,
  MdClose,
  MdSend,
  MdSmartToy,
  MdOutlineHelpOutline,
} from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace("/api", "");

export default function ChatWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      withCredentials: true,
    });

    // Listen for bot responses
    socketRef.current.on("botReply", (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "bot", text: data.text },
      ]);
    });

    // Listen for typing state
    socketRef.current.on("typing", (state) => {
      setIsTyping(state);
    });

    // Initial greeting message
    setMessages([
      {
        id: "greeting",
        sender: "bot",
        text:
          language === "vi"
            ? "Xin chào! Tôi là trợ lý ảo TechStore. Tôi có thể giúp gì cho bạn hôm nay?"
            : "Hello! I am the TechStore assistant. How can I help you today?",
      },
    ]);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [language]);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message locally
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: trimmed },
    ]);

    if (textToSend === input) {
      setInput("");
    }

    // Emit message to backend socket
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    socketRef.current.emit("userMessage", {
      text: trimmed,
      user: user
        ? {
            id: user._id,
            email: user.email,
            phone: user.phone,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          }
        : null,
    });
  };

  const handleQuickQuestion = (text) => {
    handleSend(text);
  };

  const quickQuestions =
    language === "vi"
      ? [
          { text: "Tìm kiếm sản phẩm hot", label: "🔍 Tìm sản phẩm" },
          { text: "Có chương trình khuyến mãi hay mã giảm giá nào không?", label: "🎁 Khuyến mãi hot" },
          { text: "Tôi muốn tra cứu lịch sử đơn hàng của mình", label: "📦 Tra cứu đơn hàng" },
        ]
      : [
          { text: "Search for trending products", label: "🔍 Search products" },
          { text: "Are there any active coupons or promotions?", label: "🎁 Promotions" },
          { text: "Check my latest order status", label: "📦 Track orders" },
        ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Collapsed Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-surface rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition duration-300"
          title="Chat với trợ lý ảo"
        >
          <MdChat size={28} />
        </button>
      )}

      {/* Expanded Chatbox */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-surface border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-5 py-4 bg-primary text-surface flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center">
                <MdSmartToy size={24} />
              </div>
              <div>
                <h4 className="font-bold text-body-md leading-tight">
                  {language === "vi" ? "Trợ lý ảo TechStore" : "TechStore Assistant"}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></span>
                  <span className="text-[11px] opacity-80">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-surface/20 rounded-full transition"
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MdSmartToy size={18} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed shadow-sm font-medium ${
                    msg.sender === "user"
                      ? "bg-primary text-surface rounded-tr-none"
                      : "bg-surface border border-outline-variant text-on-surface rounded-tl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Bouncing Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MdSmartToy size={18} />
                </div>
                <div className="bg-surface border border-outline-variant text-on-surface rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestions */}
          <div className="px-4 py-2.5 border-t border-outline-variant bg-surface flex flex-wrap gap-2 overflow-x-auto select-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q.text)}
                className="px-3 py-1.5 border border-outline hover:border-primary hover:text-primary rounded-full text-xs font-semibold text-on-surface-variant transition active:scale-95 bg-surface-container-low"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-outline-variant bg-surface-container-low flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === "vi"
                  ? "Nhập câu hỏi của bạn..."
                  : "Type your question..."
              }
              className="flex-grow border border-outline-variant rounded-xl px-4 py-2.5 bg-surface text-body-sm font-medium focus:border-primary outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-primary text-surface rounded-xl hover:bg-primary/95 disabled:opacity-40 transition flex-shrink-0 active:scale-95"
            >
              <MdSend size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
