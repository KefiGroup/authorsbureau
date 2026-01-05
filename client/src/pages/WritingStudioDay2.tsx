import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  FileText,
  Download
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WritingStudioDay2() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Book state
  const [bookTitle, setBookTitle] = useState("My SUCKcess Story");
  const [currentChapter, setCurrentChapter] = useState(1);
  
  // Chapter data for all 8 chapters
  const [chapters, setChapters] = useState([
    { number: 1, title: "Start by Sucking - The Disaster", outline: "", content: "", status: "drafting" },
    { number: 2, title: "Understanding Myself", outline: "", content: "", status: "planned" },
    { number: 3, title: "Choosing My Path", outline: "", content: "", status: "planned" },
    { number: 4, title: "Knowing My Niche", outline: "", content: "", status: "planned" },
    { number: 5, title: "Cultivating My Circle", outline: "", content: "", status: "planned" },
    { number: 6, title: "Evolving Through Crisis", outline: "", content: "", status: "planned" },
    { number: 7, title: "Seeing the Future", outline: "", content: "", status: "planned" },
    { number: 8, title: "Serving Others", outline: "", content: "", status: "planned" },
  ]);

  const [authorVoiceNotes, setAuthorVoiceNotes] = useState("");

  // tRPC mutation for AI chapter generation
  const generateChapterMutation = trpc.ai.generateChapter.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the Writing Studio</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalChapters = 8;
  const completedChapters = chapters.filter(c => c.status === "completed").length;
  const progress = (completedChapters / totalChapters) * 100;

  const currentChapterData = chapters[currentChapter - 1];

  const handleGenerateChapter = async () => {
    if (!currentChapterData.outline.trim()) {
      toast.error("Please add a chapter outline first");
      return;
    }

    try {
      const previousChapter = currentChapter > 1 ? chapters[currentChapter - 2] : null;
      const previousSummary = previousChapter?.content 
        ? `Previous chapter summary: ${previousChapter.content.substring(0, 500)}...`
        : undefined;

      const result = await generateChapterMutation.mutateAsync({
        bookTitle,
        chapterNumber: currentChapter,
        chapterTitle: currentChapterData.title,
        chapterOutline: currentChapterData.outline,
        previousChapterSummary: previousSummary,
        authorVoiceNotes: authorVoiceNotes || undefined,
      });

      // Update chapter content
      const updatedChapters = [...chapters];
      updatedChapters[currentChapter - 1] = {
        ...currentChapterData,
        content: result.draft,
        status: "drafting"
      };
      setChapters(updatedChapters);

      toast.success("Chapter draft generated! Review and edit as needed.");
    } catch (error) {
      console.error("Chapter generation error:", error);
      toast.error("Failed to generate chapter. Please try again.");
    }
  };

  const handleSaveChapter = () => {
    const updatedChapters = [...chapters];
    updatedChapters[currentChapter - 1] = {
      ...currentChapterData,
      status: "completed"
    };
    setChapters(updatedChapters);
    toast.success(`Chapter ${currentChapter} saved!`);
  };

  const handleNextChapter = () => {
    if (currentChapter < totalChapters) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const isGenerating = generateChapterMutation.isPending;
  const wordCount = currentChapterData.content.split(/\s+/).filter(w => w.length > 0).length;
  const totalWordCount = chapters.reduce((sum, ch) => 
    sum + ch.content.split(/\s+/).filter(w => w.length > 0).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/writing-studio">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Writing Studio
            </Link>
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="mb-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Day 2 of 2
              </Badge>
              <h1 className="text-4xl font-bold">Write Your SUCKcess Story</h1>
              <p className="text-muted-foreground mt-2">
                AI-assisted chapter-by-chapter writing
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Word Count</div>
              <div className="text-3xl font-bold">{totalWordCount.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedChapters} of {totalChapters} chapters completed</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Chapter Navigation */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Enter your book title"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chapters</CardTitle>
                <CardDescription>Click to navigate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {chapters.map((chapter) => (
                  <Button
                    key={chapter.number}
                    variant={currentChapter === chapter.number ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setCurrentChapter(chapter.number)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Ch. {chapter.number}</span>
                        {chapter.status === "completed" && (
                          <Badge variant="secondary" className="text-xs">Done</Badge>
                        )}
                      </div>
                      <div className="text-xs opacity-80 line-clamp-2">{chapter.title}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Voice</CardTitle>
                <CardDescription>Optional style notes</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={authorVoiceNotes}
                  onChange={(e) => setAuthorVoiceNotes(e.target.value)}
                  placeholder="E.g., Write in a conversational tone, use humor, be vulnerable..."
                  rows={4}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Chapter Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Chapter {currentChapter}: {currentChapterData.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {wordCount > 0 && `${wordCount.toLocaleString()} words`}
                    </CardDescription>
                  </div>
                  <Badge variant={currentChapterData.status === "completed" ? "default" : "secondary"}>
                    {currentChapterData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="outline" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Outline
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Draft
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="outline" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Chapter Outline</Label>
                      <Textarea
                        value={currentChapterData.outline}
                        onChange={(e) => {
                          const updatedChapters = [...chapters];
                          updatedChapters[currentChapter - 1] = {
                            ...currentChapterData,
                            outline: e.target.value
                          };
                          setChapters(updatedChapters);
                        }}
                        placeholder="What should happen in this chapter? Key points, stories, lessons..."
                        rows={12}
                        className="resize-none font-mono text-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        Provide key points and the AI will expand them into a full chapter draft
                      </p>
                    </div>

                    <Button 
                      onClick={handleGenerateChapter}
                      disabled={isGenerating || !currentChapterData.outline.trim()}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Chapter Draft...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Chapter Draft with AI
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="draft" className="space-y-4 mt-4">
                    {currentChapterData.content ? (
                      <>
                        <div className="space-y-2">
                          <Label>Chapter Content</Label>
                          <Textarea
                            value={currentChapterData.content}
                            onChange={(e) => {
                              const updatedChapters = [...chapters];
                              updatedChapters[currentChapter - 1] = {
                                ...currentChapterData,
                                content: e.target.value
                              };
                              setChapters(updatedChapters);
                            }}
                            rows={20}
                            className="resize-none font-serif text-base leading-relaxed"
                          />
                        </div>

                        <div className="border rounded-lg p-6 bg-muted/30">
                          <h4 className="font-semibold mb-3">Preview</h4>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <Streamdown>{currentChapterData.content}</Streamdown>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No draft yet</p>
                        <p className="text-sm">Add an outline and generate your chapter draft with AI</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Navigation and Actions */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousChapter}
                disabled={currentChapter === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Chapter
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveChapter}
                  disabled={!currentChapterData.content}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Chapter
                </Button>
                
                {completedChapters === totalChapters && (
                  <Button
                    onClick={() => {
                      toast.success("Manuscript complete! Ready for export.");
                      setLocation("/writing-studio");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Manuscript
                  </Button>
                )}
              </div>

              <Button
                onClick={handleNextChapter}
                disabled={currentChapter === totalChapters}
              >
                Next Chapter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
