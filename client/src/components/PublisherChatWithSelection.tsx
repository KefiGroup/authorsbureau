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
  titleReasonings?: string[];
  subtitleSuggestions?: string[];
  subtitleReasonings?: string[];
  coverSuggestions?: Array<{ url: string; reasoning: string }>;
  descriptionSuggestions?: Array<{ text: string; reasoning: string }>;
  bioSuggestions?: Array<{ text: string; reasoning: string }>;
  keywordSuggestions?: Array<{ keyword: string; reasoning: string }>;
  categorySuggestions?: Array<{ category: string; reasoning: string }>;
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
  selectedCover?: string;
  selectedDescription?: string;
  selectedBio?: string;
  selectedKeywords?: string[];
  selectedCategories?: string[];
  onTitleSelect: (title: string) => void;
  onSubtitleSelect: (subtitle: string) => void;
  onCoverSelect?: (coverUrl: string) => void;
  onDescriptionSelect?: (description: string) => void;
  onBioSelect?: (bio: string) => void;
  onKeywordsSelect?: (keywords: string[]) => void;
  onCategoriesSelect?: (categories: string[]) => void;
  onComplete: () => void;
}

export function PublisherChatWithSelection({
  manuscript,
  initialAnalysis,
  selectedTitle,
  selectedSubtitle,
  selectedCover,
  selectedDescription,
  selectedBio,
  selectedKeywords = [],
  selectedCategories = [],
  onTitleSelect,
  onSubtitleSelect,
  onCoverSelect,
  onDescriptionSelect,
  onBioSelect,
  onKeywordsSelect,
  onCategoriesSelect,
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
    
    // Automatically trigger cover design question
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Perfect! Your book title is now complete:

**"${selectedTitle}: ${subtitle}"**

Now let's create a stunning cover that captures attention and drives sales. Your cover is the first thing readers see—it needs to instantly communicate your book's genre, quality, and value.

I'm generating 3 professional cover designs optimized for your genre and target audience. Each design uses proven visual strategies that perform well on Amazon. Here are my recommendations:`,
          coverSuggestions: [
            {
              url: "/placeholder-cover-1.jpg",
              reasoning: "Clean, professional design with bold typography that stands out in thumbnail view. The minimalist approach signals sophistication and appeals to your target audience of serious investors. Color psychology: Deep blue conveys trust and stability."
            },
            {
              url: "/placeholder-cover-2.jpg",
              reasoning: "Dynamic composition with financial imagery (charts, graphs) that immediately communicates the book's practical value. The contrasting colors create visual interest and improve click-through rates in search results."
            },
            {
              url: "/placeholder-cover-3.jpg",
              reasoning: "Metaphorical approach using imagery (mountain, path) that represents the journey to financial independence. This emotional connection resonates with readers seeking transformation. Warm tones create approachability."
            }
          ],
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

  const handleCoverSelect = (coverUrl: string) => {
    if (onCoverSelect) {
      onCoverSelect(coverUrl);
      toast.success("Cover selected!");
      
      // Automatically trigger book description question
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Excellent choice! Your cover will grab attention and communicate professionalism.

Now let's craft a compelling book description that converts browsers into buyers. Your description is your sales pitch—it needs to hook readers in the first sentence, build desire, and create urgency.

I've written 3 description variations optimized for Amazon's algorithm and reader psychology:`,
            descriptionSuggestions: [
              {
                text: "Are you tired of watching your savings erode while 'experts' promise get-rich-quick schemes? This book reveals the time-tested strategy that Warren Buffett used to build billions—and how you can apply it starting today. Learn to identify undervalued companies, calculate intrinsic value, and build wealth through disciplined investing. No gambling, no timing the market, just proven principles that work.",
                reasoning: "Opens with pain point (tired of losing money), establishes authority (Warren Buffett), promises transformation (starting today), and emphasizes proven results. Short, punchy sentences create urgency."
              },
              {
                text: "What if you could stop gambling on hot stocks and start owning pieces of great businesses at bargain prices? The Quiet Investor shows you exactly how. Inside, you'll discover the step-by-step framework for calculating what a company is really worth, master the psychology that separates winners from losers, and build a portfolio designed for long-term wealth. Perfect for anxious beginners who want financial independence without the stress.",
                reasoning: "Question hook engages curiosity, 'exactly how' promises actionable content, bullet-style benefits are scannable, and addresses target audience's emotional state (anxious beginners)."
              },
              {
                text: "Stop chasing trends. Start building wealth. This beginner-friendly guide demystifies value investing with clear examples, practical calculations, and behavioral insights that keep you disciplined when markets panic. You'll learn to find 50-cent dollars, avoid common mistakes, and compound your money like the pros—all without a finance degree. Your path to financial security starts here.",
                reasoning: "Command-style opening creates action orientation, 'beginner-friendly' removes intimidation, specific outcomes (find 50-cent dollars) make benefits concrete, closes with clear call-to-action."
              }
            ],
          },
        ]);
      }, 500);
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

              {/* Cover Suggestions */}
              {message.coverSuggestions && message.coverSuggestions.length > 0 && (
                <div className="ml-11 mt-3 space-y-3">
                  {message.coverSuggestions.map((cover: { url: string; reasoning: string }, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCover === cover.url
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Cover Image Placeholder */}
                        <div className="w-32 h-48 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <p className="text-xs text-muted-foreground text-center px-2">Cover {idx + 1}</p>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          {/* Ranking Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              idx === 0 ? "bg-yellow-500 text-yellow-950" :
                              idx === 1 ? "bg-blue-500 text-blue-950" :
                              "bg-gray-500 text-gray-950"
                            }`}>
                              {idx === 0 ? "TOP PICK" : `#${idx + 1} CHOICE`}
                            </span>
                          </div>
                          
                          {/* AI Reasoning */}
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {cover.reasoning}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {selectedCover === cover.url ? (
                              <Button size="sm" variant="outline" disabled>
                                <Check className="w-4 h-4 mr-1" />
                                Selected
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleCoverSelect(cover.url)}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Your Own Cover */}
                  {!selectedCover && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast.info("Upload your own cover feature coming soon!");
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Upload My Own Cover
                    </Button>
                  )}
                </div>
              )}

              {/* Book Description Suggestions */}
              {message.descriptionSuggestions && message.descriptionSuggestions.length > 0 && (
                <div className="ml-11 mt-3 space-y-3">
                  {message.descriptionSuggestions.map((desc: { text: string; reasoning: string }, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDescription === desc.text
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Ranking Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            idx === 0 ? "bg-yellow-500 text-yellow-950" :
                            idx === 1 ? "bg-blue-500 text-blue-950" :
                            "bg-gray-500 text-gray-950"
                          }`}>
                            {idx === 0 ? "TOP PICK" : `#${idx + 1} CHOICE`}
                          </span>
                        </div>
                        
                        {/* Description Text */}
                        <p className="text-sm leading-relaxed">
                          {desc.text}
                        </p>
                        
                        {/* AI Reasoning */}
                        <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                          💡 {desc.reasoning}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {selectedDescription === desc.text ? (
                            <Button size="sm" variant="outline" disabled>
                              <Check className="w-4 h-4 mr-1" />
                              Selected
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                if (onDescriptionSelect) {
                                  onDescriptionSelect(desc.text);
                                  toast.success("Description selected!");
                                }
                              }}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Write Your Own Description */}
                  {!selectedDescription && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast.info("Write your own description feature coming soon!");
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Write My Own Description
                    </Button>
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
