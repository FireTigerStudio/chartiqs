"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/libs/i18n";

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
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      if (res.status === 429) {
        setLimitReached(true);
        throw new Error(data.error || "Daily question limit reached");
      }

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : t("chat.error"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    t("chat.suggestedQ1", { commodity: commodityName }),
    t("chat.suggestedQ2"),
    t("chat.suggestedQ3"),
  ];

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/60 mb-4">
              {t("chat.askAI", { commodity: commodityName })}
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
          placeholder={limitReached ? t("chat.limitReached") : t("chat.placeholder")}
          className="input input-bordered flex-1"
          disabled={loading || limitReached}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim() || limitReached}
        >
          {loading ? <span className="loading loading-spinner loading-sm"></span> : t("chat.send")}
        </button>
      </form>

      {limitReached && (
        <p className="text-xs text-error mt-2 text-center">
          {t("chat.freeLimitHit")}
        </p>
      )}
    </div>
  );
}
