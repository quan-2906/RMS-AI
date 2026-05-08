"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useAiChatMutation } from "@/queries/useAi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/components/ui/app-provider";
import { useTranslations } from "next-intl";

export default function AiChatbot() {
  const t = useTranslations("AiChatbot");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; content: string }[]
  >([
    {
      role: "ai",
      content: t("welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiChatMutation = useAiChatMutation();
  const socket = useAppStore((state) => state.socket);

  useEffect(() => {
    function onPayment(data: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: t("paymentSuccess"),
        },
      ]);
      setIsOpen(true);
    }
    socket?.on("payment", onPayment);
    return () => {
      socket?.off("payment", onPayment);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || aiChatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    try {
      const result = await aiChatMutation.mutateAsync({
        message: userMessage,
        history: messages,
      });
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: result.payload.data },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: t("error") },
      ]);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-secondary text-secondary-foreground rounded-full shadow-2xl shadow-secondary/40 flex items-center justify-center group hover:scale-110 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">
            smart_toy
          </span>
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
          </div>
        </button>
      )}

      {isOpen && (
        <Card className="w-[380px] sm:w-[420px] h-[600px] flex flex-col glass-card border-border shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-border bg-secondary/10">
            <CardTitle className="text-sm font-bold flex items-center gap-3 text-secondary tracking-widest uppercase">
              <span className="material-symbols-outlined text-xl">
                smart_toy
              </span>
              {t("title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-6 bg-transparent">
            <ScrollArea className="h-full pr-4" viewportRef={scrollRef}>
              <div className="flex flex-col gap-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "ai"
                          ? "bg-muted/50 text-foreground border border-border"
                          : "bg-secondary text-secondary-foreground font-medium"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-2 ${msg.role === "ai" ? "text-secondary" : "opacity-80"}`}
                      >
                        {msg.role === "ai" ? (
                          <span className="material-symbols-outlined text-[14px]">
                            smart_toy
                          </span>
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {msg.role === "ai" ? "RMS-AI" : t("you")}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {msg.content.split(/(\[IMG:.*?\])/).map((part, i) => {
                          if (part.startsWith("[IMG:") && part.endsWith("]")) {
                            const url = part
                              .substring(5, part.length - 1)
                              .trim();
                            return (
                              <img
                                key={i}
                                src={url}
                                alt="QR Code"
                                className="w-full rounded-xl shadow-lg border border-white/10 mt-2"
                              />
                            );
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {aiChatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 text-secondary rounded-2xl px-4 py-3 border border-border">
                      <div className="flex gap-1.5 items-center h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 bg-muted/20 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center space-x-3"
            >
              <Input
                placeholder={t("placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={aiChatMutation.isPending}
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-secondary transition-all rounded-full px-4 h-11"
              />
              <Button
                type="submit"
                size="icon"
                disabled={aiChatMutation.isPending || !input.trim()}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full h-11 w-11 shadow-lg shadow-secondary/20"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
