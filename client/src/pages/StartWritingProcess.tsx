import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { WritingStudioChat } from "@/components/WritingStudioChat";
import { BlueprintPreview } from "@/components/BlueprintPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function StartWritingProcess() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/start-writing/:blueprintId");
  const blueprintId = params?.blueprintId ? parseInt(params.blueprintId) : null;

  const [messages, setMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    suggestions?: string[];
  }>>([]);
  
  const [conversationMode, setConversationMode] = useState<"initial_questions" | "blueprint_generation" | "refinement">("initial_questions");
  const [blueprintGenerated, setBlueprintGenerated] = useState(false);
  const [generatedBlueprintData, setGeneratedBlueprintData] = useState<any>(null);

  // Queries
  const { data: blueprint, isLoading: loadingBlueprint } = trpc.blueprint.get.useQuery(
    { blueprintId: blueprintId! },
    { enabled: !!blueprintId }
  );

  // Mutations
  const startConversation = trpc.blueprint.startConversation.useMutation({
    onSuccess: (data) => {
      setMessages([{
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        suggestions: data.suggestions,
      }]);
      setConversationMode(data.conversationMode as "initial_questions" | "blueprint_generation" | "refinement");
    },
    onError: (error) => {
      toast.error("Failed to start conversation: " + error.message);
    },
  });

  const sendMessage = trpc.blueprint.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
          suggestions: data.suggestions,
        },
      ]);
      setConversationMode(data.conversationMode as "initial_questions" | "blueprint_generation" | "refinement");
      
      if (data.blueprintGenerated && data.blueprintData) {
        setBlueprintGenerated(true);
        setGeneratedBlueprintData(data.blueprintData);
        toast.success("🎉 Blueprint generated! Review and refine below.");
      }
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const generateBlueprint = trpc.blueprint.generateFromConversation.useMutation({
    onSuccess: () => {
      toast.success("Blueprint generated successfully!");
      // Redirect to blueprint view or next step
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to generate blueprint: " + error.message);
    },
  });

  const updateBlueprint = trpc.blueprint.update.useMutation();
  
  const createBook = trpc.book.create.useMutation({
    onSuccess: (data) => {
      toast.success("Book created! Redirecting to publishing workflow...");
      // Link blueprint to book (note: bookId field doesn't exist in schema yet, skip for now)
      // if (blueprintId && data.bookId) {
      //   updateBlueprint.mutate({
      //     blueprintId,
      //     data: { bookId: data.bookId },
      //   });
      // }
      // Redirect to ReadyToPublish with bookId
      setLocation(`/ready-to-publish?bookId=${data.bookId}`);
    },
    onError: (error) => {
      toast.error("Failed to create book: " + error.message);
    },
  });

  // Load conversation history on mount
  useEffect(() => {
    if (!blueprint || !blueprintId || loadingBlueprint) return;
    
    const history = blueprint.conversationHistory as any;
    const mode = (blueprint.conversationMode as any) || "initial_questions";
    const isGenerated = blueprint.blueprintGenerated || false;
    
    // Set conversation mode and blueprint state
    setConversationMode(mode);
    setBlueprintGenerated(isGenerated);
    
    if (isGenerated) {
      // Load generated blueprint data
      setGeneratedBlueprintData({
        projectType: blueprint.projectType,
        workingTitle: blueprint.workingTitle,
        targetLength: blueprint.targetLength,
        primaryGenre: blueprint.primaryGenre,
        secondaryGenre: blueprint.secondaryGenre,
        corePremise: blueprint.corePremise,
        protagonistData: blueprint.protagonistData,
        supportingCharacters: blueprint.supportingCharacters,
        timePeriod: blueprint.timePeriod,
        location: blueprint.location,
        settingData: blueprint.settingData,
        plotStructure: blueprint.plotStructure,
        audienceData: blueprint.audienceData,
        thematicElements: blueprint.thematicElements,
      });
    }
    
    if (history && Array.isArray(history) && history.length > 0) {
      // Load existing conversation
      setMessages(history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        suggestions: msg.suggestions,
      })));
    } else {
      // Start new conversation (no history exists)
      startConversation.mutate({ blueprintId });
    }
  }, [blueprint, blueprintId, loadingBlueprint]);

  const handleSendMessage = (message: string) => {
    if (!blueprintId) return;
    
    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Send to backend
    sendMessage.mutate({
      blueprintId,
      message,
    });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleGenerateBlueprint = () => {
    if (!blueprintId) return;
    generateBlueprint.mutate({ blueprintId });
  };

  // Build blueprint preview sections from collected data
  const blueprintSections = [
    {
      id: "project_type",
      title: "Project Overview",
      content: blueprint?.projectType ? `**Project Type:** ${blueprint.projectType}\n**Working Title:** ${blueprint.workingTitle || "Untitled"}\n**Target Length:** ${blueprint.targetLength || "Not specified"}` : "",
      isComplete: !!blueprint?.projectType,
    },
    {
      id: "genre",
      title: "Genre Classification",
      content: blueprint?.primaryGenre ? `**Primary Genre:** ${blueprint.primaryGenre}\n**Secondary Genre:** ${blueprint.secondaryGenre || "None"}` : "",
      isComplete: !!blueprint?.primaryGenre,
    },
    {
      id: "premise",
      title: "Core Premise",
      content: blueprint?.corePremise || "",
      isComplete: !!blueprint?.corePremise,
    },
    {
      id: "protagonist",
      title: "Protagonist",
      content: blueprint?.protagonistData ? JSON.stringify(blueprint.protagonistData, null, 2) : "",
      isComplete: !!blueprint?.protagonistData,
    },
    {
      id: "characters",
      title: "Supporting Characters",
      content: blueprint?.supportingCharacters ? JSON.stringify(blueprint.supportingCharacters, null, 2) : "",
      isComplete: !!blueprint?.supportingCharacters,
    },
    {
      id: "setting",
      title: "Setting",
      content: blueprint?.location || blueprint?.timePeriod ? `**Time Period:** ${blueprint.timePeriod || "Not specified"}\n**Location:** ${blueprint.location || "Not specified"}` : "",
      isComplete: !!(blueprint?.location || blueprint?.timePeriod),
    },
    {
      id: "plot",
      title: "Plot Structure",
      content: blueprint?.plotStructure ? JSON.stringify(blueprint.plotStructure, null, 2) : "",
      isComplete: !!blueprint?.plotStructure,
    },
    {
      id: "audience",
      title: "Target Audience",
      content: blueprint?.audienceData ? JSON.stringify(blueprint.audienceData, null, 2) : "",
      isComplete: !!blueprint?.audienceData,
    },
    {
      id: "themes",
      title: "Thematic Elements",
      content: blueprint?.thematicElements ? JSON.stringify(blueprint.thematicElements, null, 2) : "",
      isComplete: !!blueprint?.thematicElements,
    },
  ];

  if (loadingBlueprint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your writing studio...</p>
        </div>
      </div>
    );
  }

  if (!blueprintId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Blueprint</h2>
          <p className="text-muted-foreground mb-4">
            The blueprint ID is missing or invalid.
          </p>
          <Button onClick={() => setLocation("/")}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Start Your Writing Process</h1>
              <p className="text-sm text-muted-foreground">
                Let's develop your story together, step by step
              </p>
            </div>
          </div>

          {blueprintGenerated && (
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (!blueprint?.workingTitle) {
                    toast.error("Please complete the blueprint first");
                    return;
                  }
                  createBook.mutate({
                    title: blueprint.workingTitle,
                  });
                }}
                disabled={createBook.isPending}
                size="lg"
              >
                {createBook.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Continue to Publishing
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Chat Interface */}
        <div className="border-r">
          <WritingStudioChat
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectSuggestion={handleSelectSuggestion}
            isLoading={sendMessage.isPending || startConversation.isPending}
            conversationMode={conversationMode}
            blueprintGenerated={blueprintGenerated}
          />
        </div>

        {/* Right: Blueprint Preview */}
        <div className="bg-muted/30">
          <BlueprintPreview
            sections={blueprintSections}
            isGenerating={generateBlueprint.isPending}
            className="border-0 rounded-none h-full"
          />
        </div>
      </div>
    </div>
  );
}
