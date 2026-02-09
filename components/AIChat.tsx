"use client";

import React, { useState, useRef, useEffect } from "react";

interface Factor {
  name: string;
  nameEn: string;
  impact: "high" | "medium" | "low";
  timeHorizon: "short" | "medium" | "long";
  weight: number;
  description: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  symbol: string;
  commodityName: string;
  factors: Factor[];
}

export default function AIChat({ symbol, commodityName, factors }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch remaining questions
  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/ai/usage");
      if (res.ok) {
        const data = await res.json();
        setRemainingQuestions(data.remaining);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          question,
          context: JSON.stringify(factors),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      setRemainingQuestions(data.remainingQuestions);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Sorry, an error occurred. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    `What are the main factors affecting ${commodityName}?`,
    "How does inflation affect commodity prices?",
    "How does supply and demand work?",
  ];

  return (
    <div className="flex flex-col h-[500px]">
      {/* Usage Indicator */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-base-content/60">Questions remaining today</span>
        <span className={`font-medium ${remainingQuestions === 0 ? "text-error" : "text-success"}`}>
          {remainingQuestions !== null ? remainingQuestions : "--"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/60 mb-4">
              Have any questions about {commodityName} for AI?
            </p>
            <div className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
            >
              <div
                className={`chat-bubble ${
                  msg.role === "user" ? "chat-bubble-primary" : "chat-bubble-neutral"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-neutral">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={remainingQuestions === 0 ? "Daily question limit reached" : "Type your question..."}
          className="input input-bordered flex-1"
          disabled={loading || remainingQuestions === 0}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim() || remainingQuestions === 0}
        >
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
        </button>
      </form>

      {remainingQuestions === 0 && (
        <p className="text-xs text-error mt-2 text-center">
          Daily free questions exhausted. <a href="/pricing" className="link">Upgrade to Premium</a> for more questions.
        </p>
      )}
    </div>
  );
}
