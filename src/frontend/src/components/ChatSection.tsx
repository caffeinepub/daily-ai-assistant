import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useClearHistory,
  useGetMessages,
  useSendMessage,
} from "@/hooks/useQueries";
import { Bot, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const QUICK_ACTIONS = [
  { label: "Draft a simple NDA", icon: "📝" },
  { label: "What are my tenant rights?", icon: "🏠" },
  { label: "Help me write a complaint letter", icon: "✉️" },
  { label: "What are my employment rights?", icon: "⚖️" },
  { label: "Create a daily schedule", icon: "📅" },
  { label: "Draft a formal email", icon: "📨" },
];

export function ChatSection() {
  const [input, setInput] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{ id: string; role: string; content: string; timestamp: bigint }>
  >([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useGetMessages();
  const sendMessage = useSendMessage();
  const clearHistory = useClearHistory();

  // Merge real messages with optimistic ones
  const allMessages = [
    ...messages.map((m) => ({
      id: m.id.toString(),
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
    ...optimisticMessages.filter(
      (opt) => !messages.some((m) => m.id.toString() === opt.id),
    ),
  ].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  useEffect(() => {
    if (messages.length > 0) setHasInteracted(true);
  }, [messages.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || sendMessage.isPending) return;

    setInput("");
    setHasInteracted(true);

    const optimisticId = `opt-${Date.now()}`;
    const now = BigInt(Date.now());

    setOptimisticMessages((prev) => [
      ...prev,
      { id: optimisticId, role: "user", content: messageText, timestamp: now },
    ]);

    try {
      await sendMessage.mutateAsync(messageText);
      setOptimisticMessages([]);
    } catch {
      setOptimisticMessages([]);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await clearHistory.mutateAsync();
      setOptimisticMessages([]);
      setHasInteracted(false);
      toast.success("Conversation cleared");
    } catch {
      toast.error("Failed to clear conversation");
    }
  };

  const handleQuickAction = (label: string) => {
    handleSend(label);
  };

  const isWaiting =
    sendMessage.isPending &&
    optimisticMessages.some((m) => m.role === "user") &&
    !allMessages.some(
      (m) => m.role === "assistant" && Number(m.timestamp) > Date.now() - 30000,
    );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="font-serif text-xl text-foreground">
            AI Legal Assistant
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            Ask anything — legal guidance, daily tasks, drafting help
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={clearHistory.isPending || allMessages.length === 0}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      <div className="gold-line mx-6" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : allMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-32 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-3">
              <Bot className="w-5 h-5 text-gold" />
            </div>
            <p className="font-serif text-lg text-foreground/80">
              Ready to assist you
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ask a question or choose a suggestion below
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {allMessages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: i === allMessages.length - 1 ? 0 : 0,
                }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-gold" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "msg-user text-foreground ml-auto"
                      : "msg-assistant text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isWaiting && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-gold" />
              </div>
              <div className="msg-assistant rounded-xl px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick action chips */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-3"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="text-xs text-muted-foreground">
                Quick suggestions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  type="button"
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-surface-raised border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-smooth"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-2 items-end bg-surface-raised border border-border rounded-xl p-2 focus-within:border-gold/40 transition-smooth">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — legal questions, drafting help, daily tasks…"
            className="flex-1 min-h-[44px] max-h-32 resize-none bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
            rows={1}
            disabled={sendMessage.isPending}
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || sendMessage.isPending}
            className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex-shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          Press{" "}
          <kbd className="bg-surface-raised border border-border rounded px-1 py-0.5 text-[10px]">
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd className="bg-surface-raised border border-border rounded px-1 py-0.5 text-[10px]">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
