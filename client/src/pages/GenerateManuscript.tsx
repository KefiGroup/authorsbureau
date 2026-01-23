import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function GenerateManuscript() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [editMessage, setEditMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Get blueprint data
  const { data: blueprint } = trpc.blueprint.get.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Get chapter outline
  const { data: outline } = trpc.manuscript.getChapterOutline.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Get book structure
  const { data: structure } = trpc.manuscript.getBookStructure.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Get progress
  const { data: progress, refetch: refetchProgress } = trpc.manuscript.getProgress.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Build sections list (optional sections + chapters)
  const sections: Array<{
    type: "prologue" | "chapter" | "epilogue" | "dedication" | "acknowledgements" | "authorBio" | "alsoBy" | "newsletter";
    number?: number;
    title: string;
  }> = [];

  if (structure && outline) {
    if (structure.hasPrologue) sections.push({ type: "prologue", title: "Prologue" });
    if (structure.hasDedication) sections.push({ type: "dedication", title: "Dedication" });

    // Add chapters
    const outlineData = outline.outline as { chapters: any[] };
    outlineData.chapters.forEach((ch: any, index: number) => {
      sections.push({ type: "chapter", number: index + 1, title: ch.title });
    });

    if (structure.hasEpilogue) sections.push({ type: "epilogue", title: "Epilogue" });
    if (structure.hasAcknowledgements) sections.push({ type: "acknowledgements", title: "Acknowledgements" });
    if (structure.hasAuthorBio) sections.push({ type: "authorBio", title: "Author Bio" });
    if (structure.hasAlsoBy) sections.push({ type: "alsoBy", title: "Also By This Author" });
    if (structure.hasNewsletter) sections.push({ type: "newsletter", title: "Newsletter Signup" });
  }

  const currentSection = sections[currentSectionIndex];

  // Get current chapter/section
  const { data: currentManuscript, refetch: refetchManuscript } = trpc.manuscript.getChapter.useQuery(
    {
      blueprintId: Number(blueprintId),
      sectionType: currentSection?.type,
      sectionNumber: currentSection?.number,
    },
    { enabled: !!currentSection }
  );

  // Generate chapter mutation
  const generateChapter = trpc.manuscript.generateChapter.useMutation({
    onSuccess: () => {
      refetchManuscript();
      refetchProgress();
      toast.success("Chapter generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate chapter");
    },
  });

  // Approve chapter mutation
  const approveChapter = trpc.manuscript.approveChapter.useMutation({
    onSuccess: () => {
      refetchManuscript();
      refetchProgress();
      toast.success("Chapter approved! Moving to next chapter...");
      // Auto-advance to next chapter
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      } else {
        toast.success("Book complete! All chapters have been generated and approved.");
        // TODO: Navigate to final review page
      }
    },
  });

  // Request edit mutation
  const requestEdit = trpc.manuscript.requestEdit.useMutation({
    onSuccess: async () => {
      // Invalidate to force refetch
      await utils.manuscript.getChapter.invalidate();
      setEditMessage("");
      setShowChat(false);
      toast.success("Edit applied! Your chapter has been updated.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply edit");
    },
  });

  const handleGenerate = () => {
    if (!currentSection) return;
    generateChapter.mutate({
      blueprintId: Number(blueprintId),
      sectionType: currentSection.type,
      sectionNumber: currentSection.number,
      sectionTitle: currentSection.title,
    });
  };

  const handleApprove = () => {
    if (!currentManuscript) return;
    approveChapter.mutate({ manuscriptId: currentManuscript.id });
  };

  const handleRequestEdit = () => {
    if (!currentManuscript || !editMessage.trim()) return;
    requestEdit.mutate({
      manuscriptId: currentManuscript.id,
      userMessage: editMessage,
      currentContent: currentManuscript.content || "",
    });
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  if (!blueprint || !outline || !structure || sections.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const isGenerating = generateChapter.isPending;
  const isEditing = requestEdit.isPending;
  const isApproving = approveChapter.isPending;
  const isApproved = currentManuscript?.status === "approved";
  const isDraft = currentManuscript?.status === "draft";

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/book-structure/${blueprintId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Book Structure
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{blueprint.workingTitle}</h1>
        <p className="text-muted-foreground">
          Progress: {currentSectionIndex + 1} of {sections.length} sections
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {progress?.filter((m) => m.status === "approved").length || 0} / {sections.length} approved
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{
              width: `${((progress?.filter((m) => m.status === "approved").length || 0) / sections.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current Section Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {currentSection.type === "chapter" ? `Chapter ${currentSection.number}` : currentSection.title}
              </CardTitle>
              {currentSection.type === "chapter" && (
                <CardDescription className="mt-1">{currentSection.title}</CardDescription>
              )}
            </div>
            {isApproved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Approved</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!currentManuscript || currentManuscript.status === "pending" ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">This section hasn't been generated yet.</p>
              <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Section"
                )}
              </Button>
            </div>
          ) : (
            <div>
              {/* Content Display */}
              <div className="mb-6 p-6 bg-muted/30 rounded-lg max-h-[600px] overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {currentManuscript.content
                      ?.replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
                      ?.replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
                      ?.replace(/\*(.+?)\*/g, '$1') // Remove italic
                      ?.replace(/^[-*]\s+/gm, '• ') // Convert list markers
                    }
                  </div>
                </div>
              </div>

              {/* Word Count */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">
                  Word Count: {currentManuscript.wordCount?.toLocaleString() || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  Status: {currentManuscript.status === "draft" ? "Draft" : "Approved"}
                </span>
              </div>

              {/* AI Chat Interface */}
              {!isApproved && (
                <div className="mb-6">
                  {!showChat ? (
                    <Button onClick={() => setShowChat(true)} variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Edits from AI
                    </Button>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Request Edits</CardTitle>
                        <CardDescription>
                          Describe what you'd like to change, and AI will revise the chapter for you.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          placeholder="E.g., 'Make the opening more dramatic' or 'Add more dialogue between the characters'"
                          className="mb-4"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleRequestEdit} disabled={isEditing || !editMessage.trim()}>
                            {isEditing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Applying Edit...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Apply Edit
                              </>
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => setShowChat(false)}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Approve Button */}
              {!isApproved && (
                <Button onClick={handleApprove} disabled={isApproving} size="lg" className="w-full mb-4">
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve & Continue to Next Section
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentSectionIndex === 0} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Section
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentSectionIndex === sections.length - 1}
          variant="outline"
        >
          Next Section
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
