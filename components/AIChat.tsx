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
  isLoggedIn: boolean;
}

function formatAIResponse(content: string): string {
  let html = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[-•]\s+(.+)/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)/gm, "<li>$1</li>");

  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul class='list-disc pl-4 my-2'>$1</ul>");
  html = html.replace(/\n\n/g, "</p><p class='mb-2'>");
  html = html.replace(/\n/g, "<br/>");
  html = `<p class="mb-2">${html}</p>`;

  return html;
}

export default function AIChat({ symbol, commodityName, factors, isLoggedIn }: AIChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHistoryLoaded(true);
      return;
    }
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/ai/chat/history?symbol=${symbol}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setMessages(data.messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })));
          }
        }
      } catch {
        // Silent fail — just start with empty chat
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [symbol, isLoggedIn]);

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
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-base-content/60 mb-4">{t("chat.loginToAsk")}</p>
          <a href="/signin" className="btn btn-primary btn-sm">
            {t("chat.loginButton")}
          </a>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {!historyLoaded ? (
              <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="ml-2 text-sm text-base-content/60">{t("chat.loadingHistory")}</span>
              </div>
            ) : messages.length === 0 ? (
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
                  {msg.role === "user" ? (
                    <div className="chat-bubble chat-bubble-primary">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm max-w-[90%]">
                      <div
                        className="prose prose-sm prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatAIResponse(msg.content) }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="chat chat-start">
                <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
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
        </>
      )}
    </div>
  );
}
