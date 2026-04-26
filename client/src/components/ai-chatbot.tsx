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

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; content: string }[]
  >([
    {
      role: "ai",
      content: "Xin chào! Tôi là trợ lý ảo RMS-AI. Tôi có thể giúp gì cho bạn?",
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
          content: "Cảm ơn bạn đã thanh toán thành công! Hệ thống đã ghi nhận. Hẹn gặp lại bạn lần sau!",
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
        { role: "ai", content: "Rất tiếc, đã có lỗi xảy ra. Hãy thử lại nhé!" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary text-primary-foreground rounded-t-xl">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Trợ lý ảo RMS-AI
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full pr-4" viewportRef={scrollRef}>
              <div className="flex flex-col gap-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "ai"
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === "ai" ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="text-[10px] uppercase font-bold">
                          {msg.role === "ai" ? "RMS-AI" : "Bạn"}
                        </span>
                      </div>
                      {msg.content.split(/(\[IMG:.*?\])/).map((part, i) => {
                        if (part.startsWith('[IMG:') && part.endsWith(']')) {
                          const url = part.substring(5, part.length - 1).trim();
                          return <img key={i} src={url} alt="QR Code" className="w-full mt-2 rounded-md" />;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                  </div>
                ))}
                {aiChatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-75">.</span>
                        <span className="animate-bounce delay-150">.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={aiChatMutation.isPending}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={aiChatMutation.isPending || !input.trim()}
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
