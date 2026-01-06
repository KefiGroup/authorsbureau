import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, User, Sparkles } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface PublisherChatProps {
  initialAnalysis: {
    suggestedTitles: string[];
    suggestedSubtitles: string[];
    bookDescription: string;
    detectedGenre: string;
    targetAudience: string;
  };
  onComplete: () => void;
}

export function PublisherChat({ initialAnalysis, onComplete }: PublisherChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI publishing consultant with 20+ years of experience at the New York Times. I've analyzed your manuscript and I'm excited to help you transform it into a bestseller.

**Initial Analysis:**
- **Genre**: ${initialAnalysis.detectedGenre}
- **Target Audience**: ${initialAnalysis.targetAudience}

I've prepared several title options and marketing strategies for you. What would you like to discuss first?

1. **Book titles** - I have ${initialAnalysis.suggestedTitles.length} compelling options
2. **Cover design** - Visual strategy to attract your audience
3. **Market positioning** - How to stand out in your category
4. **Pricing strategy** - Maximize sales and royalties

Just type your question or let me know what you'd like to explore!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in real implementation, call tRPC mutation)
    setTimeout(() => {
      const responses = [
        `Great question! Based on your manuscript, I recommend focusing on ${initialAnalysis.detectedGenre} readers who are ${initialAnalysis.targetAudience}. This audience is actively searching for books like yours on Amazon.`,
        `Let me share the title options I've prepared:\n\n${initialAnalysis.suggestedTitles.map((t, i) => `${i + 1}. **${t}**`).join("\n")}\n\nWhich one resonates with you? Or would you like me to generate more options?`,
        `Excellent choice! Now let's talk about your book description. I've crafted one that highlights your unique value proposition:\n\n"${initialAnalysis.bookDescription.substring(0, 200)}..."\n\nWould you like to refine this, or shall we move on to cover design?`,
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">NY Times Publisher AI</p>
              <p className="text-xs text-muted-foreground">Your personal publishing consultant</p>
            </div>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your book..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onComplete} size="lg">
          Continue to Cover Design
        </Button>
      </div>
    </div>
  );
}
