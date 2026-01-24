import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles, User, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface WritingStudioChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
  isLoading: boolean;
  conversationMode: "initial_questions" | "blueprint_generation" | "refinement";
  blueprintGenerated: boolean;
  onBack?: () => void;
  onSkip?: () => void;
}

export function WritingStudioChat({
  messages,
  onSendMessage,
  onSelectSuggestion,
  isLoading,
  conversationMode,
  blueprintGenerated,
  onBack,
  onSkip,
}: WritingStudioChatProps) {
  const [input, setInput] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus textarea
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  // Clear selected suggestions when new messages arrive
  useEffect(() => {
    setSelectedSuggestions([]);
  }, [messages.length]);

  const handleSend = () => {
    // Combine input with selected suggestions
    let finalMessage = input.trim();
    
    if (selectedSuggestions.length > 0) {
      const suggestionsText = selectedSuggestions.join(", ");
      if (finalMessage) {
        finalMessage = `${suggestionsText}. ${finalMessage}`;
      } else {
        finalMessage = suggestionsText;
      }
    }
    
    if (finalMessage && !isLoading) {
      onSendMessage(finalMessage);
      setInput("");
      setSelectedSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionToggle = (suggestion: string) => {
    setSelectedSuggestions((prev) => {
      if (prev.includes(suggestion)) {
        return prev.filter((s) => s !== suggestion);
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const getModeLabel = () => {
    if (blueprintGenerated) return "Blueprint Complete - Refinement Mode";
    if (conversationMode === "blueprint_generation") return "Generating Your Blueprint...";
    return "Initial Questions";
  };

  const getModeDescription = () => {
    if (blueprintGenerated) return "Chat to refine any section of your blueprint";
    if (conversationMode === "blueprint_generation") return "AI is creating your complete story blueprint";
    return "Tell us about your book idea";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">{getModeLabel()}</h3>
              <p className="text-sm text-muted-foreground">{getModeDescription()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-4",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* AI Suggestions - Multiple Selection */}
              {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && index === messages.length - 1 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">Select one or more options (click to toggle):</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => {
                      const isSelected = selectedSuggestions.includes(suggestion);
                      return (
                        <Button
                          key={idx}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSuggestionToggle(suggestion)}
                          disabled={isLoading}
                          className={cn(
                            "text-xs transition-all",
                            isSelected && "ring-2 ring-primary ring-offset-1"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {suggestion}
                        </Button>
                      );
                    })}
                  </div>
                  {selectedSuggestions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {selectedSuggestions.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-lg p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2 mb-2">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {onSkip && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              disabled={isLoading}
            >
              Skip
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
        
        {/* Show selected suggestions indicator */}
        {selectedSuggestions.length > 0 && (
          <div className="mb-2 p-2 bg-primary/10 rounded-md text-sm">
            <span className="font-medium">Will send: </span>
            {selectedSuggestions.join(", ")}
            {input.trim() && ` + "${input.trim()}"`}
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedSuggestions.length > 0 
              ? "Add more details (optional) or press Enter to send selected options..."
              : "Type your response... (Shift+Enter for new line)"}
            disabled={isLoading}
            className="min-h-[100px] max-h-[250px] resize-y"
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && selectedSuggestions.length === 0) || isLoading}
            size="icon"
            className="h-[100px] w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
