import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, User, Sparkles, Check, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Utility function to strip markdown symbols from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.+?)\*/g, '$1') // Remove *italic*
    .replace(/__(.+?)__/g, '$1') // Remove __underline__
    .replace(/_(.+?)_/g, '$1') // Remove _italic_
    .replace(/###\s+/g, '') // Remove ### headings
    .replace(/##\s+/g, '') // Remove ## headings
    .replace(/#\s+/g, '') // Remove # headings
    .replace(/\|/g, '') // Remove | pipes
    .replace(/---+/g, '') // Remove --- horizontal rules
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove [links](url)
    .replace(/`(.+?)`/g, '$1'); // Remove `code`
}

interface Message {
  role: "assistant" | "user";
  content: string;
  titleSuggestions?: string[];
  titleReasonings?: string[]; // Reasoning for each title suggestion
  subtitleSuggestions?: string[];
  subtitleReasonings?: string[]; // Reasoning for each subtitle suggestion
}

interface PublisherChatWithSelectionProps {
  manuscript: string;
  initialAnalysis: {
    suggestedTitles: string[];
    suggestedSubtitles: string[];
    bookDescription: string;
    detectedGenre: string;
    targetAudience: string;
    themes: string[];
    keyBenefits: string[];
  };
  selectedTitle: string;
  selectedSubtitle: string;
  onTitleSelect: (title: string) => void;
  onSubtitleSelect: (subtitle: string) => void;
  onComplete: () => void;
}

export function PublisherChatWithSelection({
  manuscript,
  initialAnalysis,
  selectedTitle,
  selectedSubtitle,
  onTitleSelect,
  onSubtitleSelect,
  onComplete,
}: PublisherChatWithSelectionProps) {
  const chatMutation = trpc.manuscriptAnalysis.chatWithPublisher.useMutation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI publishing consultant with 20+ years of experience at the New York Times. I've analyzed your manuscript and I'm excited to help you transform it into a bestseller.

**Initial Analysis:**
- Genre: ${initialAnalysis.detectedGenre}
- Target Audience: ${initialAnalysis.targetAudience}

Let's start with the most important decision: your book title. A great title can make or break your book's success. Based on my analysis of your manuscript, I've crafted several title options that will resonate with your target audience and stand out in the marketplace.

Here are my recommended titles with the strategic reasoning behind each:`,
      titleSuggestions: initialAnalysis.suggestedTitles,
      titleReasonings: [
        "This title uses the contrarian 'ignore the noise' angle that resonates strongly with your target audience of anxious investors. It positions you as the calm, rational voice in a chaotic market. The word 'Quiet' creates intrigue and differentiates from loud, aggressive investment books.",
        "Clear, benefit-driven title that immediately communicates the transformation (complicated → simplified). 'Disciplined Path' appeals to readers seeking structure and reliability. Strong keyword optimization for Amazon search.",
        "The '50-Cent Dollar' metaphor is memorable and instantly communicates value investing's core concept. 'Beginner's Guide' removes intimidation and expands your addressable market. Perfect for first-time investors.",
        "Action-oriented verbs ('Stop,' 'Start,' 'Mastering') create urgency and transformation. The gambling vs. owning contrast is powerful for your audience who've lost money chasing trends. Addresses both psychology and strategy."
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomTitleInput, setShowCustomTitleInput] = useState(false);
  const [customTitleValue, setCustomTitleValue] = useState("");
  const [showCustomSubtitleInput, setShowCustomSubtitleInput] = useState(false);
  const [customSubtitleValue, setCustomSubtitleValue] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingSubtitle, setEditingSubtitle] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show subtitle suggestions if title is already selected on mount
  useEffect(() => {
    if (selectedTitle && !selectedSubtitle && messages.length === 1) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I see you've already selected "${selectedTitle}" as your title. Excellent choice!

Now let's choose the perfect subtitle to complement it. A well-crafted subtitle clarifies your book's value proposition and helps readers understand exactly what they'll gain. Here are my recommendations:`,
            subtitleSuggestions: initialAnalysis.suggestedSubtitles,
          },
        ]);
      }, 500);
    }
  }, [selectedTitle, selectedSubtitle, initialAnalysis.suggestedSubtitles, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Call real AI chat mutation
    chatMutation.mutate(
      {
        manuscript,
        analysis: initialAnalysis,
        messageHistory: messages,
        userMessage: input,
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: "assistant", content: String(data.message || "") }]);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error("Chat error:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I apologize, but I'm having trouble responding right now. Please try again.",
            },
          ]);
          setIsLoading(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTitleSelect = (title: string) => {
    onTitleSelect(title);
    toast.success("Title selected!");
    
    // Add subtitle suggestions message after title is selected
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Excellent choice! "${title}" is a strong title that will capture attention.

Now let's choose the perfect subtitle to complement it. A well-crafted subtitle clarifies your book's value proposition and helps readers understand exactly what they'll gain. Here are my recommendations:`,
          subtitleSuggestions: initialAnalysis.suggestedSubtitles,
          subtitleReasonings: [
            "This comprehensive subtitle clearly communicates the book's scope and benefits. The step-by-step promise reduces intimidation, while listing specific topics (intrinsic value, behavioral finance, financial future) helps with Amazon keyword discovery and sets clear expectations.",
            "The transformation narrative ('Gambler to Disciplined Owner') is emotionally compelling and speaks directly to your audience's pain point. 'Proven Framework' adds credibility, and 'Compounding Wealth' is a powerful value investing keyword that attracts serious investors.",
            "Practical and benefit-focused subtitle that addresses the reader's skepticism ('Ignore the Hype'). 'Bargain Prices' is a core value investing concept that will resonate with your target audience. The roadmap metaphor suggests a clear, actionable path."
          ],
        },
      ]);
    }, 500);
  };

  const handleSubtitleSelect = (subtitle: string) => {
    onSubtitleSelect(subtitle);
    toast.success("Subtitle selected!");
    
    // Add completion message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Perfect! Your book title is now complete:

**"${selectedTitle}: ${subtitle}"**

This combination effectively communicates your book's value and will attract your target readers. 

What would you like to discuss next?

1. Cover design strategy
2. Market positioning and categories
3. Pricing and royalty optimization
4. Book description and marketing copy

Or feel free to ask me anything about your publishing strategy!`,
        },
      ]);
    }, 500);
  };

  const handleCustomTitleSubmit = () => {
    if (customTitleValue.trim()) {
      onTitleSelect(customTitleValue.trim());
      toast.success("Custom title set!");
      setShowCustomTitleInput(false);
      setCustomTitleValue("");
      
      // Add subtitle suggestions message
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Great! You've chosen "${customTitleValue.trim()}" as your title.

Now let's select a subtitle to complement it. Here are my recommendations:`,
            subtitleSuggestions: initialAnalysis.suggestedSubtitles,
          },
        ]);
      }, 500);
    }
  };

  const handleCustomSubtitleSubmit = () => {
    if (customSubtitleValue.trim()) {
      onSubtitleSelect(customSubtitleValue.trim());
      toast.success("Custom subtitle set!");
      setShowCustomSubtitleInput(false);
      setCustomSubtitleValue("");
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

        <div className="h-[600px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
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
                  <p className="text-sm whitespace-pre-wrap">{stripMarkdown(message.content)}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Title Suggestions Inline */}
              {message.titleSuggestions && message.titleSuggestions.length > 0 && (
                <div className="ml-11 mt-3 space-y-2">
                  {message.titleSuggestions.map((title, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        selectedTitle === title
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {editingTitle === title ? (
                            <div className="flex gap-2">
                              <Input
                                value={title}
                                onChange={(e) => {
                                  const newTitles = [...message.titleSuggestions!];
                                  newTitles[idx] = e.target.value;
                                  const updatedMessages = [...messages];
                                  updatedMessages[index].titleSuggestions = newTitles;
                                  setMessages(updatedMessages);
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingTitle(null);
                                  toast.success("Title updated!");
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                {idx === 0 && (
                                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">TOP PICK</span>
                                )}
                                {idx === 1 && (
                                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">#2 CHOICE</span>
                                )}
                                {idx === 2 && (
                                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">#3 CHOICE</span>
                                )}
                                {idx === 3 && (
                                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">#4 CHOICE</span>
                                )}
                              </div>
                              <p className="font-semibold text-base mb-2">{title}</p>
                              {message.titleReasonings && message.titleReasonings[idx] && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {message.titleReasonings[idx]}
                                </p>
                              )}
                              {selectedTitle === title && (
                                <p className="text-xs text-primary mt-2 flex items-center gap-1 font-medium">
                                  <Check className="w-3 h-3" /> Currently selected
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {selectedTitle === title && !editingTitle && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTitle(title)}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {selectedTitle !== title && (
                            <Button
                              size="sm"
                              onClick={() => handleTitleSelect(title)}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Write My Own Option for Titles */}
                  {!showCustomTitleInput && !selectedTitle && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCustomTitleInput(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Write My Own Title
                    </Button>
                  )}
                  
                  {showCustomTitleInput && (
                    <div className="p-3 border-2 border-dashed border-primary rounded-lg space-y-2">
                      <p className="text-sm font-medium">Write Your Own Title:</p>
                      <div className="flex gap-2">
                        <Input
                          value={customTitleValue}
                          onChange={(e) => setCustomTitleValue(e.target.value)}
                          placeholder="Enter your custom title..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleCustomTitleSubmit();
                            }
                          }}
                          autoFocus
                        />
                        <Button onClick={handleCustomTitleSubmit} disabled={!customTitleValue.trim()}>
                          Set Title
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCustomTitleInput(false);
                            setCustomTitleValue("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subtitle Suggestions Inline */}
              {message.subtitleSuggestions && message.subtitleSuggestions.length > 0 && (
                <div className="ml-11 mt-3 space-y-2">
                  {message.subtitleSuggestions.map((subtitle, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        selectedSubtitle === subtitle
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {editingSubtitle === subtitle ? (
                            <div className="flex gap-2">
                              <Input
                                value={subtitle}
                                onChange={(e) => {
                                  const newSubtitles = [...message.subtitleSuggestions!];
                                  newSubtitles[idx] = e.target.value;
                                  const updatedMessages = [...messages];
                                  updatedMessages[index].subtitleSuggestions = newSubtitles;
                                  setMessages(updatedMessages);
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingSubtitle(null);
                                  toast.success("Subtitle updated!");
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                {idx === 0 && (
                                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">TOP PICK</span>
                                )}
                                {idx === 1 && (
                                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">#2 CHOICE</span>
                                )}
                                {idx === 2 && (
                                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">#3 CHOICE</span>
                                )}
                              </div>
                              <p className="font-medium text-sm mb-2">{subtitle}</p>
                              {message.subtitleReasonings && message.subtitleReasonings[idx] && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {message.subtitleReasonings[idx]}
                                </p>
                              )}
                              {selectedSubtitle === subtitle && (
                                <p className="text-xs text-primary mt-2 flex items-center gap-1 font-medium">
                                  <Check className="w-3 h-3" /> Currently selected
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {selectedSubtitle === subtitle && !editingSubtitle && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSubtitle(subtitle)}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {selectedSubtitle !== subtitle && (
                            <Button
                              size="sm"
                              onClick={() => handleSubtitleSelect(subtitle)}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Write My Own Option for Subtitles */}
                  {!showCustomSubtitleInput && !selectedSubtitle && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCustomSubtitleInput(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Write My Own Subtitle
                    </Button>
                  )}
                  
                  {showCustomSubtitleInput && (
                    <div className="p-3 border-2 border-dashed border-primary rounded-lg space-y-2">
                      <p className="text-sm font-medium">Write Your Own Subtitle:</p>
                      <div className="flex gap-2">
                        <Input
                          value={customSubtitleValue}
                          onChange={(e) => setCustomSubtitleValue(e.target.value)}
                          placeholder="Enter your custom subtitle..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleCustomSubtitleSubmit();
                            }
                          }}
                          autoFocus
                        />
                        <Button onClick={handleCustomSubtitleSubmit} disabled={!customSubtitleValue.trim()}>
                          Set Subtitle
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCustomSubtitleInput(false);
                            setCustomSubtitleValue("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
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

      {/* Selected Title/Subtitle Summary */}
      {(selectedTitle || selectedSubtitle) && (
        <Card className="border-primary/30 bg-primary/5">
          <div className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Your Book Title:</p>
            <div className="space-y-1">
              {selectedTitle && (
                <p className="text-lg font-bold text-foreground">{selectedTitle}</p>
              )}
              {selectedSubtitle && (
                <p className="text-base text-muted-foreground">{selectedSubtitle}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ✓ Automatically synced to your book and blueprint
            </p>
          </div>
        </Card>
      )}

      {selectedTitle && selectedSubtitle && (
        <Button onClick={onComplete} size="lg" className="w-full">
          Continue to Author Profile Check
        </Button>
      )}
    </div>
  );
}
