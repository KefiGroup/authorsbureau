import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  BookOpen,
  FileText,
  Loader2
} from "lucide-react";

export default function WriteManuscript() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const [, setLocation] = useLocation();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch blueprint
  const { data: blueprint } = trpc.blueprint.get.useQuery({
    blueprintId: parseInt(blueprintId || "0"),
  });

  // Fetch chapters
  const { data: chapters = [], refetch: refetchChapters } = trpc.manuscript.getChapters.useQuery({
    blueprintId: parseInt(blueprintId || "0"),
  });

  // Initialize manuscript if no chapters exist
  const initializeManuscript = trpc.manuscript.initialize.useMutation({
    onSuccess: () => {
      refetchChapters();
      toast.success("Manuscript initialized!");
    },
    onError: (error) => {
      toast.error(`Failed to initialize: ${error.message}`);
    },
  });

  // Save chapter mutation
  const saveChapter = trpc.manuscript.saveChapter.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false);
      refetchChapters();
      toast.success("Chapter saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Mark chapter complete
  const markComplete = trpc.manuscript.markComplete.useMutation({
    onSuccess: () => {
      refetchChapters();
      toast.success("Chapter marked as complete!");
    },
  });

  // Load current chapter data
  useEffect(() => {
    if (chapters[currentChapterIndex]) {
      setChapterTitle(chapters[currentChapterIndex].title || "");
      setChapterContent(chapters[currentChapterIndex].content || "");
      setHasUnsavedChanges(false);
    }
  }, [currentChapterIndex, chapters]);

  // Initialize manuscript on first load
  useEffect(() => {
    if (blueprint && chapters.length === 0 && !initializeManuscript.isPending) {
      // Default to 20 chapters for a novel
      initializeManuscript.mutate({
        blueprintId: parseInt(blueprintId || "0"),
        totalChapters: 20,
      });
    }
  }, [blueprint, chapters]);

  const handleSaveChapter = () => {
    if (!chapters[currentChapterIndex]) return;

    const wordCount = chapterContent.trim().split(/\s+/).filter(w => w.length > 0).length;

    saveChapter.mutate({
      chapterId: chapters[currentChapterIndex].id,
      title: chapterTitle,
      content: chapterContent,
      wordCount,
    });
  };

  const handleMarkComplete = () => {
    if (!chapters[currentChapterIndex]) return;

    // Save first, then mark complete
    handleSaveChapter();
    markComplete.mutate({
      chapterId: chapters[currentChapterIndex].id,
    });
  };

  const handleNextChapter = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Save before moving to the next chapter?")) {
        handleSaveChapter();
      }
    }
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Save before moving to the previous chapter?")) {
        handleSaveChapter();
      }
    }
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const completedChapters = chapters.filter((c: any) => c.status === "completed").length;
  const totalWords = chapters.reduce((sum: number, c: any) => sum + (c.wordCount || 0), 0);

  if (!blueprint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (initializeManuscript.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Initializing your manuscript...</p>
      </div>
    );
  }

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/start-writing/${blueprintId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blueprint
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{blueprint.workingTitle || "Untitled"}</h1>
              <p className="text-sm text-muted-foreground">
                {completedChapters} of {chapters.length} chapters complete • {totalWords.toLocaleString()} words
              </p>
            </div>
          </div>
          <Button
            onClick={() => setLocation("/ready-to-publish")}
            disabled={completedChapters < chapters.length}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Continue to Publishing
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter List Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Chapters</CardTitle>
              <CardDescription>Click to navigate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {chapters.map((chapter: any, index: number) => (
                <Button
                  key={chapter.id}
                  variant={index === currentChapterIndex ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (confirm("You have unsaved changes. Save before switching chapters?")) {
                        handleSaveChapter();
                      }
                    }
                    setCurrentChapterIndex(index);
                  }}
                >
                  {chapter.status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  )}
                  {chapter.status === "drafting" && (
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  )}
                  {chapter.status === "planned" && (
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                  <span className="truncate">{chapter.title}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Chapter Editor */}
          <div className="lg:col-span-3 space-y-6">
            {currentChapter && (
              <>
                {/* Chapter Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          value={chapterTitle}
                          onChange={(e) => {
                            setChapterTitle(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Chapter Title"
                          className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Chapter {currentChapter.chapterNumber} • {(chapterContent.trim().split(/\s+/).filter(w => w.length > 0).length).toLocaleString()} words
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleSaveChapter}
                          disabled={!hasUnsavedChanges || saveChapter.isPending}
                        >
                          {saveChapter.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        {currentChapter.status !== "completed" && (
                          <Button
                            onClick={handleMarkComplete}
                            disabled={!chapterContent.trim() || markComplete.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Chapter Content Editor */}
                <Card>
                  <CardContent className="pt-6">
                    <Textarea
                      value={chapterContent}
                      onChange={(e) => {
                        setChapterContent(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Start writing your chapter here..."
                      className="min-h-[500px] text-base leading-relaxed resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousChapter}
                    disabled={currentChapterIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Chapter
                  </Button>
                  <Button
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                  >
                    Next Chapter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
