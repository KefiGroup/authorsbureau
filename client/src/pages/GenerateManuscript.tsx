import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, MessageSquare, Send, Download, Sparkles, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { marked } from "marked";
import { exportToDocx } from "@/lib/exportDocx";
import DashboardLayout from "@/components/DashboardLayout";
import { RewriteVariationsModal } from "@/components/RewriteVariationsModal";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { fixMarkdownTables } from "@/lib/markdown-utils";

// Configure marked with GFM (GitHub Flavored Markdown) for table support
marked.use(gfmHeadingId());
marked.setOptions({
  gfm: true, // Enable GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: true, // Convert \n to <br>
});

export default function GenerateManuscript() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [manualEditContent, setManualEditContent] = useState("");
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [showEmptyBioModal, setShowEmptyBioModal] = useState(false);

  // Get blueprint data
  const { data: blueprint, isLoading: blueprintLoading, error: blueprintError } = trpc.blueprint.get.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Get chapter outline
  const { data: outline, isLoading: outlineLoading, error: outlineError } = trpc.manuscript.getChapterOutline.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Get book structure
  const { data: structure, isLoading: structureLoading, error: structureError } = trpc.manuscript.getBookStructure.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Get progress
  const { data: progress, isLoading: progressLoading, error: progressError, refetch: refetchProgress } = trpc.manuscript.getProgress.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Build sections list (optional sections + chapters)
  const sections: Array<{
    type: "prologue" | "copyright" | "chapter" | "epilogue" | "dedication" | "acknowledgements" | "authorBio" | "alsoBy" | "newsletter";
    number?: number;
    title: string;
  }> = [];

  if (structure && outline) {
    if (structure.hasPrologue) sections.push({ type: "prologue", title: "Prologue" });
    if (structure.hasCopyright) sections.push({ type: "copyright", title: "Copyright" });
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

  // Resume progress: Restore to first ungenerated chapter
  useEffect(() => {
    if (!hasRestoredProgress && progress && sections.length > 0) {
      // Find the first section that hasn't been generated yet
      const firstUngeneratedIndex = sections.findIndex((section) => {
        // Check if this section exists in the manuscripts array
        const manuscript = progress.find(
          (m) => m.sectionType === section.type && 
                 (section.number === undefined || m.sectionNumber === section.number)
        );
        // Section is ungenerated if no manuscript exists or content is null
        return !manuscript || manuscript.content === null;
      });

      if (firstUngeneratedIndex !== -1) {
        // Found an ungenerated chapter, restore to that position
        setCurrentSectionIndex(firstUngeneratedIndex);
      } else {
        // All chapters generated, go to last one
        setCurrentSectionIndex(sections.length - 1);
      }
      setHasRestoredProgress(true);
    }
  }, [progress, sections, hasRestoredProgress]);

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

  // Unapprove chapter mutation
  const unapproveChapter = trpc.manuscript.unapproveChapter.useMutation({
    onSuccess: () => {
      refetchManuscript();
      refetchProgress();
      toast.success("Chapter unapproved! You can now make edits.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unapprove chapter");
    },
  });

  // Sync Author Bio from Profile mutation
  const syncAuthorBio = trpc.manuscript.syncAuthorBioFromProfile.useMutation({
    onSuccess: () => {
      refetchManuscript();
      refetchProgress();
      toast.success("Author Bio synced from profile! Please review and approve.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync from profile");
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

  // Manual edit mutation
  const saveManualEdit = trpc.manuscript.updateChapterContent.useMutation({
    onSuccess: async () => {
      await utils.manuscript.getChapter.invalidate();
      setIsManualEditing(false);
      setManualEditContent("");
      toast.success("Chapter updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save changes");
    },
  });

  // Download manuscript mutation
  const downloadMutation = trpc.manuscript.downloadManuscript.useMutation({
    onSuccess: async (data) => {
      try {
        console.log('[Download Debug] S3 URL:', data.url);
        console.log('[Download Debug] File name:', data.fileName);
        
        // Fetch the file from S3 URL
        const response = await fetch(data.url);
        console.log('[Download Debug] Fetch response status:', response.status);
        console.log('[Download Debug] Fetch response headers:', response.headers);
        
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        
        // Create blob from response
        const blob = await response.blob();
        console.log('[Download Debug] Blob size:', blob.size, 'bytes');
        console.log('[Download Debug] Blob type:', blob.type);
        
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty (0 bytes)');
        }
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = data.fileName || 'manuscript.docx';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success(`Manuscript downloaded! ${data.sectionCount} sections included.`);
      } catch (error) {
        console.error('[Download Error]', error);
        toast.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    onError: (error) => {
      console.error('[Download Mutation Error]', error);
      toast.error(error.message || "Failed to download manuscript");
    },
  });

  // Get author profile to check bio status
  const { data: authorProfile } = trpc.author.getProfile.useQuery();

  const handleGenerate = () => {
    if (!currentSection) return;

    // Check if generating Author Bio section and profile bio is empty
    if (currentSection.type === "authorBio") {
      if (!authorProfile?.bio || authorProfile.bio.trim() === "") {
        setShowEmptyBioModal(true);
        return;
      }
    }

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

  const handleUnapprove = () => {
    if (!currentManuscript) return;
    unapproveChapter.mutate({ manuscriptId: currentManuscript.id });
  };

  const handleSyncAuthorBio = () => {
    if (!currentManuscript) return;
    syncAuthorBio.mutate({ manuscriptId: currentManuscript.id });
  };

  const handleRequestEdit = () => {
    if (!currentManuscript || !editMessage.trim()) return;
    requestEdit.mutate({
      manuscriptId: currentManuscript.id,
      userMessage: editMessage,
      currentContent: currentManuscript.content || "",
    });
  };

  const handleStartManualEdit = () => {
    if (!currentManuscript) return;
    setManualEditContent(currentManuscript.content || "");
    setIsManualEditing(true);
    setShowChat(false);
  };

  const handleSaveManualEdit = () => {
    if (!currentManuscript) return;
    const wordCount = manualEditContent.split(/\s+/).filter(w => w.length > 0).length;
    saveManualEdit.mutate({
      manuscriptId: currentManuscript.id,
      content: manualEditContent,
      wordCount,
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

  const handleDownloadManuscript = () => {
    if (!blueprintId) return;
    downloadMutation.mutate({ blueprintId: Number(blueprintId) });
  };

  // Export manuscript mutation
  const exportManuscript = trpc.manuscript.getManuscriptText.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: false } // Don't auto-fetch, only fetch when explicitly called
  );

  const handleExportToPublishing = async () => {
    if (!blueprintId) return;
    
    try {
      toast.loading("Preparing manuscript for export...");
      
      // Fetch complete manuscript text
      const manuscriptData = await exportManuscript.refetch();
      
      if (!manuscriptData.data) {
        throw new Error("Failed to fetch manuscript data");
      }
      
      // Store manuscript data in localStorage for Publishing Studio to pick up
      localStorage.setItem('exportedManuscript', JSON.stringify({
        manuscriptText: manuscriptData.data.manuscriptText,
        bookTitle: manuscriptData.data.bookTitle,
        wordCount: manuscriptData.data.wordCount,
        blueprintId: blueprintId,
        timestamp: Date.now(),
      }));
      
      toast.dismiss();
      toast.success("Manuscript ready! Redirecting to AI Publishing Studio...");
      
      // Navigate to AI Publishing Studio
      navigate(`/ai-publishing-studio?from=manuscript&blueprintId=${blueprintId}`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to export manuscript");
    }
  };

  // Show detailed loading/error states
  if (blueprintError || outlineError || structureError || progressError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive font-semibold">Error loading manuscript data:</p>
          {blueprintError && <p className="text-sm">Blueprint: {blueprintError.message}</p>}
          {outlineError && <p className="text-sm">Outline: {outlineError.message}</p>}
          {structureError && <p className="text-sm">Structure: {structureError.message}</p>}
          {progressError && <p className="text-sm">Progress: {progressError.message}</p>}
          <Button onClick={() => navigate(`/dashboard`)}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (blueprintLoading || outlineLoading || structureLoading || progressLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            {blueprintLoading && <p>Loading blueprint...</p>}
            {outlineLoading && <p>Loading chapter outline...</p>}
            {structureLoading && <p>Loading book structure...</p>}
            {progressLoading && <p>Loading progress...</p>}
          </div>
        </div>
      </div>
    );
  }

  if (!blueprint || !outline || !structure || sections.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Missing required data</p>
          <p className="text-sm">Blueprint: {blueprint ? '✓' : '✗'}</p>
          <p className="text-sm">Outline: {outline ? '✓' : '✗'}</p>
          <p className="text-sm">Structure: {structure ? '✓' : '✗'}</p>
          <p className="text-sm">Sections: {sections.length}</p>
          <Button onClick={() => navigate(`/dashboard`)}>Return to Dashboard</Button>
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
    <DashboardLayout>
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
          Viewing: {currentSection.type === "chapter" ? `Chapter ${currentSection.number}` : currentSection.title} ({currentSectionIndex + 1} of {sections.length} sections)
        </p>
      </div>

      {/* Progress Bar with Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress?.filter((m) => m.status === "approved").length || 0} / {sections.length} approved
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchProgress()}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadManuscript}
              disabled={downloadMutation.isPending || (progress?.filter((m) => m.status === "approved").length || 0) === 0}
            >
              {downloadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download as DOCX
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleExportToPublishing}
              disabled={(progress?.filter((m) => m.status === "approved").length || 0) < sections.length}
            >
              <Send className="h-4 w-4 mr-2" />
              Export to Publishing Studio
            </Button>
          </div>
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
              {/* Content Display or Edit Mode */}
              {isManualEditing ? (
                <div className="mb-6">
                  <RichTextEditor
                    value={manualEditContent}
                    onChange={setManualEditContent}
                    placeholder="Edit chapter content..."
                  />
                </div>
              ) : (
                <div className="mb-6 p-6 bg-muted/30 rounded-lg max-h-[600px] overflow-y-auto">
                  <div 
                    className="prose prose-slate max-w-none book-content"
                    dangerouslySetInnerHTML={{ 
                      __html: marked.parse(fixMarkdownTables(currentManuscript.content || "")) as string 
                    }}
                  />
                </div>
              )}

              {/* Word Count */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">
                  Word Count: {currentManuscript.wordCount?.toLocaleString() || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  Status: {currentManuscript.status === "draft" ? "Draft" : "Approved"}
                </span>
              </div>

              {/* Export to DOCX Button */}
              {currentManuscript?.content && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      exportToDocx({
                        title: currentSection?.title || `Section ${currentManuscript.sectionNumber || ''}`,
                        content: currentManuscript.content || '',
                        author: 'Authors Bureau',
                      });
                      toast.success('Downloading Word document...');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as DOCX
                  </Button>
                </div>
              )}

              {/* Manual Edit or AI Chat Interface */}
              {!isApproved && (
                <div className="mb-6">
                  {isManualEditing ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveManualEdit} disabled={saveManualEdit.isPending} className="flex-1">
                        {saveManualEdit.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsManualEditing(false);
                          setManualEditContent("");
                        }} 
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : !showChat ? (
                    <div className="flex gap-2">
                      {currentSection?.type === "authorBio" && (
                        <Button 
                          onClick={handleSyncAuthorBio} 
                          variant="default" 
                          className="flex-1"
                          disabled={syncAuthorBio.isPending}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${syncAuthorBio.isPending ? 'animate-spin' : ''}`} />
                          Sync from Profile
                        </Button>
                      )}
                      <Button onClick={handleStartManualEdit} variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Edit Manually
                      </Button>
                      <Button onClick={() => setShowChat(true)} variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Edits from AI
                      </Button>
                      <Button onClick={() => setShowRewriteModal(true)} variant="outline" className="flex-1">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Request 3 Variations
                      </Button>
                    </div>
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

              {/* Approve/Unapprove Button */}
              {!isApproved ? (
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
              ) : (
                <Button 
                  onClick={handleUnapprove} 
                  disabled={unapproveChapter.isPending} 
                  size="lg" 
                  variant="outline"
                  className="w-full mb-4"
                >
                  {unapproveChapter.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Unapproving...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Unapprove to Make Edits
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

      {/* Rewrite Variations Modal */}
      {currentManuscript && (
        <RewriteVariationsModal
          open={showRewriteModal}
          onOpenChange={setShowRewriteModal}
          manuscriptId={currentManuscript.id}
          currentContent={currentManuscript.content || ""}
          chapterTitle={sections[currentSectionIndex]?.title || ""}
          blueprintId={Number(blueprintId)}
          onSelectVariation={(newContent) => {
            setManualEditContent(newContent);
            setIsManualEditing(true);
          }}
        />
      )}

      {/* Empty Bio Modal */}
      <Dialog open={showEmptyBioModal} onOpenChange={setShowEmptyBioModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Author Profile First</DialogTitle>
            <DialogDescription>
              To generate a professional Author Bio section, you need to complete your author profile bio first.
              This ensures your manuscript includes accurate and compelling information about you as an author.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Your author bio will be used to create the Author Bio section of your book. It should include:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
              <li>Your background and expertise</li>
              <li>Your writing experience or credentials</li>
              <li>Personal details that connect with readers</li>
              <li>Your website or social media (optional)</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmptyBioModal(false)}>
              Cancel
            </Button>
            <Link href="/profile">
              <Button>
                Go to Profile
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
