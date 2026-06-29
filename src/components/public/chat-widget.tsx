"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Send, X } from "lucide-react";
import type { Locale } from "@/i18n/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget({ locale }: { locale: Locale }) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, locale }),
      });
      if (!res.ok) throw new Error("chat failed");
      const data = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: locale === "az" ? "Xəta baş verdi. Yenidən cəhd edin." : "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-bold">{t("title")}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-white"
                    : "mr-auto max-w-[85%] rounded-2xl bg-surface px-3 py-2"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="mr-auto max-w-[85%] rounded-2xl bg-surface px-3 py-2 text-muted">...</div>}
          </div>
          <p className="px-4 pb-2 text-xs text-muted">{t("disclaimer")}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent"
            />
            <button
              type="submit"
              aria-label={t("send")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white disabled:opacity-50"
              disabled={loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("title")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
