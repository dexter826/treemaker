'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, UIMessage } from '@ai-sdk/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// Chatbot hỗ trợ tra cứu gia phả
export function TreeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);
  const currentTree = useStore((state) => state.currentTree);

  // Memoize danh sách thành viên rút gọn
  const minimalPersons = useMemo(() => {
    return persons.map((p) => ({
      id: p.id,
      name: p.full_name,
      gen: p.gender === 'male' ? 'M' : 'F',
      fid: p.father_id,
      mid: p.mother_id,
      birth: p.birth_date,
    }));
  }, [persons]);

  // Memoize quan hệ vợ chồng
  const spouseRelationships = useMemo(() => {
    return relationships.filter((r) => r.relationship_type === 'spouse');
  }, [relationships]);

  // Khởi tạo useChat
  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    messages: [],
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');

    // Gửi tin nhắn kèm theo context gia phả
    sendMessage(
      { text: userMessage },
      {
        body: {
          dataContext: {
            tree: currentTree,
            persons: minimalPersons,
            relationships: spouseRelationships,
          },
        },
      }
    );
  };

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-background border-foreground shadow-brutal-lg mb-4 flex h-[500px] w-80 flex-col overflow-hidden border-2 sm:w-96"
          >
            <div className="border-foreground bg-primary text-primary-foreground flex items-center justify-between border-b-2 p-4">
              <div className="flex items-center gap-2 text-white">
                <Bot className="size-5" />
                <span className="font-serif text-sm font-black tracking-widest uppercase">
                  Trợ Lý Gia Phả
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer text-white/80 transition-colors hover:text-white"
                aria-label="Đóng trợ lý"
              >
                <X className="size-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="bg-muted/5 scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4"
            >
              {messages.length === 0 && !isLoading && (
                <div className="py-8 text-center">
                  <Bot className="mx-auto mb-3 size-12 opacity-20" />
                  <p className="text-muted-foreground px-4 text-xs font-bold tracking-wider uppercase">
                    Chào bạn! Tôi có thể giúp gì cho bạn về cây gia phả này?
                  </p>
                </div>
              )}

              {messages.map((m: UIMessage) => {
                const messageContent = (m.parts ?? [])
                  .filter(
                    (part): part is { type: 'text'; text: string } =>
                      part.type === 'text'
                  )
                  .map((part) => part.text)
                  .join('');

                if (!messageContent && m.role === 'assistant') return null;

                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex gap-3',
                      m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div
                      className={cn(
                        'border-foreground flex size-8 shrink-0 items-center justify-center border-2',
                        m.role === 'user' ? 'bg-secondary' : 'bg-primary'
                      )}
                    >
                      {m.role === 'user' ? (
                        <User className="size-4" />
                      ) : (
                        <Bot className="size-4 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'border-foreground max-w-[80%] border-2 p-3 text-sm leading-relaxed font-medium',
                        m.role === 'user'
                          ? 'bg-background shadow-brutal-sm'
                          : 'bg-muted shadow-brutal-sm'
                      )}
                    >
                      <div className="prose prose-sm prose-neutral dark:prose-invert prose-p:leading-relaxed max-w-none">
                        <ReactMarkdown>{messageContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading khi gửi và chưa có chữ */}
              {isLoading &&
                messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3">
                    <div className="border-foreground bg-primary flex size-8 shrink-0 items-center justify-center border-2">
                      <Bot className="size-4 text-white" />
                    </div>
                    <div className="border-foreground bg-muted shadow-brutal-sm border-2 p-3">
                      <div className="flex items-center gap-1">
                        <span className="animate-pulse text-xs font-bold tracking-wider uppercase">
                          Đang suy nghĩ
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {error && (
                <div className="bg-destructive/10 border-destructive text-destructive border-2 p-2 text-center text-[10px] font-bold uppercase">
                  Lỗi kết nối API. Vui lòng thử lại.
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-foreground bg-background border-t-2 p-4"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi về quan hệ, thành viên..."
                  className="bg-background border-foreground focus:bg-muted placeholder:text-muted-foreground/50 flex-1 border-2 p-2 text-sm font-bold transition-colors focus:outline-none"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant={isOpen ? 'destructive' : 'outline'}
        size="icon"
        effect="raised"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12"
      >
        {isOpen ? (
          <X className="size-4 md:size-5" />
        ) : (
          <MessageCircle className="size-4 md:size-5" />
        )}
      </Button>
    </div>
  );
}
