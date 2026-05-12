"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

// Chatbot hỗ trợ tra cứu thông tin gia phả
export function TreeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentTree = useStore((state) => state.currentTree);
  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    messages: [],
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage(
      {
        text: input,
      },
      {
        body: {
          dataContext: {
            tree: currentTree,
            persons: persons.map(p => ({
              id: p.id,
              full_name: p.full_name,
              gender: p.gender,
              father_id: p.father_id,
              mother_id: p.mother_id,
              birth_date: p.birth_date
            })),
            relationships: relationships
          }
        }
      }
    );
    
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 sm:w-96 h-[500px] bg-background border-2 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)] flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b-2 border-foreground bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bot className="size-5" />
                <span className="font-serif font-black uppercase tracking-widest text-sm">Trợ Lý Gia Phả</span>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-thin"
            >
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Bot className="size-12 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4">
                    Chào bạn! Tôi có thể giúp gì cho bạn về cây gia phả này?
                  </p>
                </div>
              )}
              {messages.map((m: UIMessage) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "size-8 flex items-center justify-center border-2 border-foreground shrink-0",
                    m.role === "user" ? "bg-secondary" : "bg-primary"
                  )}>
                    {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4 text-white" />}
                  </div>
                  <div className={cn(
                    "p-3 border-2 border-foreground text-sm font-medium leading-relaxed max-w-[80%]",
                    m.role === "user" 
                      ? "bg-background shadow-[4px_4px_0px_0px_var(--color-foreground)]" 
                      : "bg-muted shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                  )}>
                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border-2 prose-pre:border-foreground prose-pre:rounded-none">
                      <ReactMarkdown>
                        {m.parts
                          .filter((part) => part.type === "text")
                          .map((part) => (part as any).text)
                          .join("")}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="size-8 flex items-center justify-center border-2 border-foreground bg-primary shrink-0">
                    <Bot className="size-4 text-white" />
                  </div>
                  <div className="p-3 border-2 border-foreground bg-muted shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold uppercase tracking-wider animate-pulse">Đang suy nghĩ</span>
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 bg-foreground rounded-full animate-bounce"></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-2 bg-destructive/10 border-2 border-destructive text-destructive text-[10px] font-bold uppercase text-center">
                  Lỗi kết nối API.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t-2 border-foreground bg-background">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi về quan hệ, thành viên..."
                  className="flex-1 bg-background border-2 border-foreground p-2 text-sm font-bold focus:outline-none focus:bg-muted transition-colors placeholder:text-muted-foreground/50"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant={isOpen ? "destructive" : "outline"}
        size="icon"
        effect="raised"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 rounded-none shrink-0"
      >
        {isOpen ? <X className="size-4 md:size-5" /> : <MessageCircle className="size-4 md:size-5" />}
      </Button>
    </div>
  );
}
