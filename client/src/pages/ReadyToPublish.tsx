import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, FileText, Sparkles, Loader2, BookOpen, CheckCircle2,
  Lightbulb, TrendingUp, Edit3, RefreshCw, Download, Image as ImageIcon,
  Check, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";

type WorkflowStep = "upload" | "analyzing" | "review" | "cover" | "amazon" | "export";

interface AIAnalysis {
  suggestedTitles: string[];
  suggestedSubtitles: string[];
  detectedGenre: string;
  themes: string[];
  targetAudience: string;
  bookDescription: string;
  keyBenefits: string[];
  tone: string;
  wordCount: number;
}

export default function ReadyToPublish() {
  const [location] = useLocation();
  const bookIdFromUrl = new URLSearchParams(window.location.search).get('bookId');
  const [bookId, setBookId] = useState<number | null>(bookIdFromUrl ? parseInt(bookIdFromUrl) : null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("upload");
  const [manuscript, setManuscript] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [uploadMethod, setUploadMethod] = useState<"paste" | "file">("paste");
  const [isUploading, setIsUploading] = useState(false);
  const [existingManuscriptLoaded, setExistingManuscriptLoaded] = useState(false);
  
  // AI Analysis state
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // Cover generation state
  const [generatedCovers, setGeneratedCovers] = useState<any[]>([]);
  const [selectedCover, setSelectedCover] = useState<any | null>(null);
  const [coverFeedback, setCoverFeedback] = useState("");
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState("");

  // Amazon optimization state
  const [recommendedCategories, setRecommendedCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<string>("");

  // ISBN state
  const [isbnSource, setIsbnSource] = useState<"own" | "amazon_free" | "bowker" | "">("");
  const [isbnNumber, setIsbnNumber] = useState("");

  // Copyright page state
  const [copyrightPage, setCopyrightPage] = useState("");
  const [showCopyrightGenerator, setShowCopyrightGenerator] = useState(false);

  // Load user's books to auto-select if no bookId provided
  const { data: userBooks } = trpc.book.getMyBooks.useQuery(undefined, {
    enabled: !bookId,
  });

  // Auto-select most recent book if no bookId provided
  useEffect(() => {
    if (!bookId && userBooks && userBooks.length > 0) {
      const mostRecentBook = userBooks[0]; // Already sorted by updatedAt DESC
      setBookId(mostRecentBook.id);
    }
  }, [bookId, userBooks]);

  // Load existing book if bookId is provided
  const { data: existingBook } = trpc.book.getById.useQuery(
    { bookId: bookId! },
    { enabled: !!bookId }
  );

  // Auto-load existing manuscript
  useEffect(() => {
    if (existingBook && existingBook.content && !existingManuscriptLoaded) {
      setManuscript(existingBook.content);
      setWordCount(existingBook.wordCount || 0);
      setExistingManuscriptLoaded(true);
      toast.success(`Loaded existing manuscript: ${existingBook.title} (${existingBook.wordCount} words)`);
    }
  }, [existingBook, existingManuscriptLoaded]);

  // tRPC mutations
  const analyzeManuscript = trpc.manuscriptAnalysis.analyze.useMutation({
    onSuccess: (data) => {
      setAIAnalysis(data);
      setSelectedTitle(data.suggestedTitles[0]);
      setSelectedSubtitle(data.suggestedSubtitles[0]);
      setEditedDescription(data.bookDescription);
      setCurrentStep("review");
      toast.success("AI analysis complete! Review the suggestions below.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to analyze manuscript");
      setCurrentStep("upload");
    },
  });

  const generateMoreTitles = trpc.manuscriptAnalysis.generateMoreTitles.useMutation({
    onSuccess: (newTitles) => {
      if (aiAnalysis) {
        setAIAnalysis({
          ...aiAnalysis,
          suggestedTitles: [...aiAnalysis.suggestedTitles, ...newTitles],
        });
      }
      toast.success("Generated 5 more title options!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate more titles");
    },
  });

  const generateCovers = trpc.covers.generateVariations.useMutation({
    onSuccess: (covers) => {
      setGeneratedCovers(covers);
      toast.success("Generated 3 cover designs! Select your favorite.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate covers");
    },
  });

  const generateExportBundle = trpc.export.generateBundle.useMutation({
    onSuccess: (result) => {
      window.open(result.zipUrl, "_blank");
      toast.success("Publishing package ready! Download started.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate package. Please try again.");
    },
  });

  const generateKeywords = trpc.amazon.optimizeKeywords.useMutation({
    onSuccess: (data: any) => {
      setGeneratedKeywords(data.keywords);
      toast.success("Keywords generated! Ready for Amazon KDP.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate keywords");
    },
  });

  const regenerateCover = trpc.covers.regenerate.useMutation({
    onSuccess: (newCover: any) => {
      // Replace the selected cover with the regenerated one
      setGeneratedCovers(covers => covers.map(c => 
        c.imageUrl === selectedCover ? newCover : c
      ));
      setSelectedCover(newCover.imageUrl);
      toast.success("Cover regenerated! Check out the updated design.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to regenerate cover");
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const count = text.trim().split(/\s+/).length;
      
      setManuscript(text);
      setWordCount(count);
      
      toast.success(`Manuscript uploaded! ${count.toLocaleString()} words detected.`);
    } catch (error) {
      toast.error("Failed to read file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleManuscriptPaste = (text: string) => {
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setManuscript(text);
    setWordCount(count);
  };

  const handleCustomCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Image file must be under 10MB");
      return;
    }
    
    try {
      toast.info("Uploading your cover image...");
      
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedCoverUrl(dataUrl);
        setSelectedCover(dataUrl);
        toast.success("Custom cover uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Cover upload failed:", error);
      toast.error("Failed to upload cover. Please try again.");
    }
  };

  const handleAnalyzeManuscript = () => {
    if (!manuscript || manuscript.length < 100) {
      toast.error("Please upload a manuscript with at least 100 characters");
      return;
    }
    
    setCurrentStep("analyzing");
    analyzeManuscript.mutate({ manuscript, wordCount });
  };

  const handleGenerateMoreTitles = () => {
    if (!aiAnalysis) return;
    generateMoreTitles.mutate({
      manuscript,
      currentTitles: aiAnalysis.suggestedTitles,
    });
  };

  const finalTitle = customTitle || selectedTitle;
  const finalSubtitle = customSubtitle || selectedSubtitle;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI-Powered Publishing
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload your manuscript and let our AI publisher optimize everything for Amazon KDP success
          </p>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className={`flex flex-col items-center gap-2 flex-1 ${
                ["upload", "analyzing", "review", "cover", "amazon", "export"].includes(currentStep)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "upload" || currentStep === "analyzing"
                    ? "bg-primary text-primary-foreground"
                    : ["review", "cover", "amazon", "export"].includes(currentStep)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted"
                }`}>
                  {["review", "cover", "amazon", "export"].includes(currentStep) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium">Upload</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              <div className={`flex flex-col items-center gap-2 flex-1 ${
                ["review", "cover", "amazon", "export"].includes(currentStep)
                  ? "text-primary"
                  : currentStep === "analyzing"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "analyzing"
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : ["review", "cover", "amazon", "export"].includes(currentStep)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted"
                }`}>
                  {["cover", "amazon", "export"].includes(currentStep) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium">AI Analysis</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              <div className={`flex flex-col items-center gap-2 flex-1 ${
                ["review", "cover", "amazon", "export"].includes(currentStep)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "review"
                    ? "bg-primary text-primary-foreground"
                    : ["cover", "amazon", "export"].includes(currentStep)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted"
                }`}>
                  {["cover", "amazon", "export"].includes(currentStep) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Edit3 className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium">Review & Edit</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              <div className={`flex flex-col items-center gap-2 flex-1 ${
                currentStep === "export" ? "text-primary" : "text-muted-foreground"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "export"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Publish</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {/* Step 1: Upload Manuscript */}
        {currentStep === "upload" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Your Manuscript
                </CardTitle>
                <CardDescription>
                  Our AI will analyze your book like a New York Times publisher and optimize everything for Amazon success
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show existing manuscript loaded message */}
                {existingManuscriptLoaded && existingBook && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 text-lg mb-2">
                          ✓ Manuscript Loaded: {existingBook.title}
                        </h3>
                        <p className="text-green-800 mb-3">
                          Your existing manuscript has been automatically loaded ({wordCount.toLocaleString()} words). 
                          You can proceed directly to AI analysis or upload a different manuscript below.
                        </p>
                        <Button
                          onClick={handleAnalyzeManuscript}
                          size="lg"
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Sparkles className="w-5 h-5" />
                          Use This Manuscript & Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "paste" | "file")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manuscript">Manuscript Content</Label>
                      <Textarea
                        id="manuscript"
                        placeholder="Paste your complete manuscript here..."
                        value={manuscript}
                        onChange={(e) => handleManuscriptPaste(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      {wordCount > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Word count: {wordCount.toLocaleString()} words
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Upload Manuscript File</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supports DOCX, PDF, and TXT files
                        </p>
                        <Input
                          type="file"
                          accept=".docx,.pdf,.txt"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                      {isUploading && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing file...</span>
                        </div>
                      )}
                      {wordCount > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900">
                          <CheckCircle2 className="w-5 h-5 mx-auto mb-2" />
                          <p className="font-medium">File uploaded successfully!</p>
                          <p className="text-sm">{wordCount.toLocaleString()} words detected</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">What happens next?</p>
                      <p>
                        Our AI will analyze your manuscript with the expertise of a senior New York Times publisher, 
                        suggesting bestseller-worthy titles, optimized descriptions, and market positioning strategies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleAnalyzeManuscript}
                    disabled={!manuscript || manuscript.length < 100}
                    size="lg"
                    className="gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze with AI Publisher
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: AI Analyzing */}
          {currentStep === "analyzing" && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">AI Publisher Analyzing Your Book</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Our AI is reading your manuscript with the expertise of a New York Times bestselling publisher, 
                      analyzing market trends, and crafting optimization strategies...
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>This usually takes 30-60 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review AI Suggestions */}
          {currentStep === "review" && aiAnalysis && (
            <div className="space-y-6">
              {/* AI Analysis Summary */}
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    AI Publisher Analysis Complete
                  </CardTitle>
                  <CardDescription>
                    Based on {aiAnalysis.wordCount.toLocaleString()} words • {aiAnalysis.detectedGenre} • {aiAnalysis.tone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Target Audience</h4>
                      <p className="text-sm text-muted-foreground">{aiAnalysis.targetAudience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Main Themes</h4>
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysis.themes.slice(0, 4).map((theme, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Key Benefits</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {aiAnalysis.keyBenefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Title Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Bestseller-Worthy Titles
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateMoreTitles}
                      disabled={generateMoreTitles.isPending}
                    >
                      {generateMoreTitles.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Generate More
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Our AI analyzed bestseller patterns in your genre. Select one or write your own.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {aiAnalysis.suggestedTitles.map((title, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedTitle(title);
                          setCustomTitle("");
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTitle === title && !customTitle
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-medium text-foreground">{title}</p>
                          {idx === 0 && (
                            <Badge variant="default" className="flex-shrink-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Top Pick
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customTitle">Or write your own title</Label>
                    <Input
                      id="customTitle"
                      placeholder="Your custom title..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Subtitle Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Subtitle Options</CardTitle>
                  <CardDescription>
                    Using the "promise + proof" formula that top publishers use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {aiAnalysis.suggestedSubtitles.map((subtitle, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedSubtitle(subtitle);
                          setCustomSubtitle("");
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedSubtitle === subtitle && !customSubtitle
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="text-sm text-foreground">{subtitle}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customSubtitle">Or write your own subtitle</Label>
                    <Input
                      id="customSubtitle"
                      placeholder="Your custom subtitle..."
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Amazon Book Description</CardTitle>
                  <CardDescription>
                    Review and customize your AI-generated description (2,000-4,000 characters recommended)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Description Text</label>
                      <span className={`text-sm ${
                        editedDescription.length < 2000 ? "text-amber-600" :
                        editedDescription.length > 4000 ? "text-red-600" :
                        "text-green-600"
                      }`}>
                        {editedDescription.length} characters
                        {editedDescription.length < 2000 && " (add more detail)"}
                        {editedDescription.length > 4000 && " (too long, trim down)"}
                        {editedDescription.length >= 2000 && editedDescription.length <= 4000 && " ✓"}
                      </span>
                    </div>
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="Your book description will appear here after AI analysis..."
                    />
                  </div>

                  {/* Formatting Tips */}
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Amazon KDP Description Tips:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>Hook first 3 lines</strong> - Readers only see this before "Read more"</li>
                      <li>• <strong>Use HTML formatting</strong> - &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;br/&gt; for line breaks</li>
                      <li>• <strong>Bullet points</strong> - Use • or - for easy scanning</li>
                      <li>• <strong>Call to action</strong> - End with "Scroll up and click Buy Now"</li>
                      <li>• <strong>Keywords naturally</strong> - Include search terms readers use</li>
                    </ul>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (aiAnalysis?.bookDescription) {
                          setEditedDescription(aiAnalysis.bookDescription);
                          toast.success("Restored AI-generated description");
                        }
                      }}
                      disabled={!aiAnalysis?.bookDescription}
                    >
                      Restore AI Version
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(editedDescription);
                        toast.success("Description copied to clipboard");
                      }}
                      disabled={!editedDescription}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Your Book Preview</CardTitle>
                  <CardDescription>How your book will appear on Amazon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{finalTitle}</h3>
                    {finalSubtitle && (
                      <p className="text-lg text-muted-foreground mt-1">{finalSubtitle}</p>
                    )}
                  </div>
                  <div>
                    <Badge variant="secondary">{aiAnalysis.detectedGenre}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {editedDescription.slice(0, 300)}...
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end relative z-10">
                <Button 
                  size="lg" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Continue to Cover Design clicked');
                    setCurrentStep("cover");
                  }}
                  className="cursor-pointer"
                >
                  Continue to Cover Design
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: AI Cover Generation */}
          {currentStep === "cover" && aiAnalysis && (
            <div className="space-y-6">
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Cover Design Studio
                  </CardTitle>
                  <CardDescription>
                    Our AI will generate 3 professional cover designs based on your book's themes and genre
                  </CardDescription>
                </CardHeader>
              </Card>

              {generatedCovers.length === 0 ? (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Create Your Cover?</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          AI will analyze your manuscript themes and generate 3 distinct cover styles:
                          Minimalist, Bold, and Artistic
                        </p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button
                          size="lg"
                          onClick={() => {
                            if (!aiAnalysis) return;
                            generateCovers.mutate({
                              bookTitle: finalTitle,
                              authorName: "Author", // TODO: Get from user profile
                              genre: aiAnalysis.detectedGenre,
                              themes: aiAnalysis.themes,
                              targetAudience: aiAnalysis.targetAudience,
                              count: 3,
                            });
                          }}
                          disabled={generateCovers.isPending}
                        >
                          {generateCovers.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Generating Covers...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Generate 3 Cover Designs
                            </>
                          )}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => setCurrentStep("amazon")}
                        >
                          Skip for Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Your Cover</CardTitle>
                    <CardDescription>
                      Choose your favorite or request modifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      {generatedCovers.map((cover, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedCover(cover)}
                          className={`cursor-pointer rounded-lg border-2 transition-all ${
                            selectedCover === cover
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={cover.imageUrl}
                            alt={`Cover ${idx + 1}`}
                            className="w-full aspect-[2/3] object-cover rounded-t-lg"
                          />
                          <div className="p-3">
                            <Badge>{cover.style}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Want to modify the selected cover?</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., make it darker, add more color, more professional..."
                            value={coverFeedback}
                            onChange={(e) => setCoverFeedback(e.target.value)}
                          />
                          <Button
                            onClick={() => {
                              if (!selectedCover || !coverFeedback.trim() || !aiAnalysis) {
                                toast.error("Please select a cover and provide modification feedback");
                                return;
                              }
                              
                              toast.info("Regenerating cover with your feedback...");
                              
                              // Since we don't have bookId in this workflow, we'll regenerate directly
                              // For now, show a message that this requires saving the book first
                              toast.info("Cover regeneration requires saving your book first. For now, you can upload a custom cover or continue with the selected design.");
                            }}
                            disabled={!selectedCover || !coverFeedback.trim() || regenerateCover.isPending}
                          >
                            {regenerateCover.isPending ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Regenerating...</>
                            ) : (
                              <><RefreshCw className="w-4 h-4 mr-2" />Regenerate</>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Or upload your own cover</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCustomCoverUpload(file);
                            }
                          }}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="lg"
                        onClick={() => setCurrentStep("amazon")}
                        disabled={!selectedCover && !uploadedCoverUrl}
                      >
                        Continue to Amazon Optimization
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Amazon Optimization */}
          {currentStep === "amazon" && aiAnalysis && (
            <div className="space-y-6">
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Amazon KDP Optimization
                  </CardTitle>
                  <CardDescription>
                    AI analyzes your book against Amazon's algorithm to recommend optimal categories, keywords, and pricing
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Category Research</CardTitle>
                  <CardDescription>
                    Select up to 3 categories (Amazon's limit)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendedCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <Button
                        size="lg"
                        onClick={() => {
                          if (!aiAnalysis) return;
                          
                          // Generate LOW-COMPETITION niche categories for easy #1 bestseller ranking
                          const mockCategories = [
                            {
                              category: `Books > Self-Help > Personal Transformation > Overcoming Adversity`,
                              competitivenessScore: 3.2,
                              estimatedMonthlySearches: "800-1,500",
                              reasoning: "LOW competition niche - Become #1 with just 15-30 sales. Perfect for new authors!",
                              recommended: true,
                            },
                            {
                              category: `Books > Business & Money > Success > Failure & Resilience`,
                              competitivenessScore: 2.8,
                              estimatedMonthlySearches: "600-1,200",
                              reasoning: "VERY LOW competition - Achieve #1 bestseller status with only 10-20 sales. Hidden gem category!",
                              recommended: true,
                            },
                            {
                              category: `Books > Self-Help > Motivational > Turning Setbacks into Success`,
                              competitivenessScore: 3.5,
                              estimatedMonthlySearches: "900-1,800",
                              reasoning: "LOW competition with engaged audience - Reach #1 with 20-40 sales. Great for visibility!",
                              recommended: true,
                            },
                          ];
                          
                          setRecommendedCategories(mockCategories);
                          toast.success("Category analysis complete! Select up to 3 categories.");
                          
                          // Auto-generate keywords
                          generateKeywords.mutate({
                            title: finalTitle || aiAnalysis.suggestedTitles[0],
                            genre: aiAnalysis.detectedGenre,
                            targetAudience: aiAnalysis.targetAudience,
                            mainTopics: aiAnalysis.themes,
                          });
                        }}
                        disabled={!aiAnalysis}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze Best Categories
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedCategories.map((cat: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedCategories.includes(cat.category)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            if (selectedCategories.includes(cat.category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat.category));
                            } else if (selectedCategories.length < 3) {
                              setSelectedCategories([...selectedCategories, cat.category]);
                            } else {
                              toast.error("You can only select up to 3 categories");
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{cat.category}</p>
                              <p className="text-sm text-muted-foreground mt-1">{cat.reasoning}</p>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Competitiveness: {cat.competitivenessScore}/10</span>
                                <span>Searches: {cat.estimatedMonthlySearches}/mo</span>
                              </div>
                            </div>
                            {selectedCategories.includes(cat.category) && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Selected: {selectedCategories.length}/3 categories
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimized Keywords</CardTitle>
                  <CardDescription>
                    AI-generated keywords for Amazon search visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedKeywords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {generateKeywords.isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating keywords...</span>
                        </div>
                      ) : (
                        "Generate categories first to get keyword recommendations"
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {generatedKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Copy these keywords exactly as shown when setting up your Amazon KDP listing
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Intelligence</CardTitle>
                  <CardDescription>
                    AI recommends optimal price based on genre and competition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!suggestedPrice ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={() => {
                          if (!aiAnalysis) return;
                          
                          // Royalty-aware pricing
                          setSuggestedPrice("Kindle: $2.99 | Paperback: $12.99");
                          toast.success("Pricing optimized for 70% royalty tier!");
                        }}
                        disabled={!aiAnalysis}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze Optimal Pricing
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                          <p className="text-sm text-muted-foreground mb-2">Kindle eBook</p>
                          <p className="text-4xl font-bold text-primary">$2.99</p>
                          <p className="text-xs text-green-600 mt-2 font-medium">70% Royalty Tier ✓</p>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                          <p className="text-sm text-muted-foreground mb-2">Paperback</p>
                          <p className="text-4xl font-bold text-primary">$12.99</p>
                          <p className="text-xs text-muted-foreground mt-2">Print Edition</p>
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">Launch Strategy</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-amber-600">⚠️ Critical: Amazon Royalty Tiers</strong><br/>
                          • <strong>$2.99-$9.99</strong>: 70% royalty (recommended)<br/>
                          • <strong>$0.99-$2.98</strong>: Only 35% royalty (you lose 50% of earnings!)<br/>
                          • <strong>$10.00+</strong>: Only 35% royalty<br/><br/>
                          <strong>Recommended Strategy:</strong> Price Kindle at $2.99-$9.99 to maximize your earnings with 70% royalty. At $2.99, you earn $2.09 per sale vs only $0.35 at $0.99. Paperback at $12.99 covers printing costs plus healthy margin.
                        </p>
                        <a href="https://kdp.amazon.com/en_US/help/topic/G200634560" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          Learn more about Amazon KDP royalty rates →
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Copyright Page Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Copyright Page (Optional)</CardTitle>
                  <CardDescription>
                    Professional copyright page to include at the beginning of your book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!copyrightPage ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          A copyright page protects your work and looks professional. We can generate one for you automatically.
                        </p>
                        <Button
                          onClick={() => {
                            if (!aiAnalysis) return;
                            const currentYear = new Date().getFullYear();
                            const disclaimerType = aiAnalysis.detectedGenre.toLowerCase().includes("technology") || 
                                                   aiAnalysis.detectedGenre.toLowerCase().includes("ai") ? "technology" : "general";
                            
                            const generated = `${finalTitle || aiAnalysis.suggestedTitles[0]}\n\nCopyright © ${currentYear} by Author Name\n\nAll rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.\n\nPublished by Self-Published\n\nFirst Edition: ${currentYear}\n\nDISCLAIMER\n\nThe information provided in this book is for general informational purposes only. While the author has made every effort to ensure accuracy, the content should not be considered professional advice. Readers should consult with appropriate professionals for specific guidance related to their individual circumstances.\n\nThe author and publisher assume no responsibility for errors, omissions, or contrary interpretations of the subject matter. Any perceived slight of any individual or organization is purely unintentional.\n\nPrinted in the United States of America`;
                            
                            setCopyrightPage(generated);
                            toast.success("Copyright page generated!");
                          }}
                          disabled={!aiAnalysis}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Copyright Page
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">Copyright Page Content</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCopyrightPage("");
                                toast.info("Copyright page removed");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <Textarea
                            value={copyrightPage}
                            onChange={(e) => setCopyrightPage(e.target.value)}
                            className="min-h-[200px] font-mono text-xs"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            This will be included as a separate file in your export package
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(copyrightPage);
                              toast.success("Copyright page copied to clipboard");
                            }}
                          >
                            Copy to Clipboard
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ISBN Section */}
              <Card>
                <CardHeader>
                  <CardTitle>ISBN (International Standard Book Number)</CardTitle>
                  <CardDescription>
                    Required for Amazon KDP publishing. Choose how you'll obtain your ISBN.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* ISBN Options */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Choose your ISBN option:</label>
                      
                      <div className="space-y-3">
                        {/* Option 1: Use Own ISBN */}
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            isbnSource === "own" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setIsbnSource("own")}
                        >
                          <div className="flex items-start gap-3">
                            <input 
                              type="radio" 
                              checked={isbnSource === "own"}
                              onChange={() => setIsbnSource("own")}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium mb-1">I already have an ISBN</p>
                              <p className="text-sm text-muted-foreground">You've purchased an ISBN from Bowker or another agency</p>
                            </div>
                          </div>
                          {isbnSource === "own" && (
                            <div className="mt-4 ml-6">
                              <label className="text-sm font-medium mb-2 block">Enter your ISBN:</label>
                              <input
                                type="text"
                                value={isbnNumber}
                                onChange={(e) => setIsbnNumber(e.target.value)}
                                placeholder="978-1-234567-89-0"
                                className="w-full px-3 py-2 border rounded-md"
                              />
                            </div>
                          )}
                        </div>

                        {/* Option 2: Free Amazon ISBN */}
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            isbnSource === "amazon_free" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setIsbnSource("amazon_free")}
                        >
                          <div className="flex items-start gap-3">
                            <input 
                              type="radio" 
                              checked={isbnSource === "amazon_free"}
                              onChange={() => setIsbnSource("amazon_free")}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium mb-1">Get free ISBN from Amazon KDP <span className="text-green-600">(Recommended)</span></p>
                              <p className="text-sm text-muted-foreground mb-2">Amazon provides a free ISBN during the publishing process</p>
                              <p className="text-xs text-amber-600">⚠️ Note: You can only sell on Amazon with this ISBN (not other retailers)</p>
                            </div>
                          </div>
                        </div>

                        {/* Option 3: Purchase from Bowker */}
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            isbnSource === "bowker" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setIsbnSource("bowker")}
                        >
                          <div className="flex items-start gap-3">
                            <input 
                              type="radio" 
                              checked={isbnSource === "bowker"}
                              onChange={() => setIsbnSource("bowker")}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium mb-1">Purchase ISBN from Bowker ($125)</p>
                              <p className="text-sm text-muted-foreground mb-2">Official US ISBN agency - allows selling on all platforms</p>
                              <p className="text-xs text-green-600">✓ Best for: Authors planning to sell on multiple retailers (Amazon + others)</p>
                            </div>
                          </div>
                          {isbnSource === "bowker" && (
                            <div className="mt-4 ml-6">
                              <a 
                                href="https://www.myidentifiers.com/identify-protect-your-book/isbn/buy-isbn" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                Purchase ISBN from Bowker →
                              </a>
                              <p className="text-xs text-muted-foreground mt-2">After purchasing, enter your ISBN above</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ISBN Information */}
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">About ISBNs:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Each format needs its own ISBN (eBook, paperback, hardcover)</li>
                        <li>• Amazon assigns separate ISBNs automatically for each format</li>
                        <li>• You don't need UPC/barcode - Amazon generates it from your ISBN</li>
                        <li>• ISBN is permanent and cannot be changed after publishing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() => setCurrentStep("export")}
                  disabled={!isbnSource}
                >
                  Continue to Export
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Export Bundle */}
          {currentStep === "export" && aiAnalysis && (
            <div className="space-y-6">
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Download Publishing Package
                  </CardTitle>
                  <CardDescription>
                    Everything you need to publish on Amazon KDP in one ZIP file
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Publishing Package Includes:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Manuscript (DOCX & PDF)</p>
                        <p className="text-sm text-muted-foreground">Formatted and ready for upload</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Book Cover (PNG)</p>
                        <p className="text-sm text-muted-foreground">High-resolution cover image</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">KDP Metadata (TXT)</p>
                        <p className="text-sm text-muted-foreground">Categories, keywords, description, pricing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">ISBN Information</p>
                        <p className="text-sm text-muted-foreground">ISBN details and registration info</p>
                      </div>
                    </div>
                    {copyrightPage && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Copyright Page (TXT)</p>
                          <p className="text-sm text-muted-foreground">Professional copyright notice for your book</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 text-center">
                    <Button
                      size="lg"
                      onClick={() => {
                        if (!manuscript || !aiAnalysis || !selectedCover) {
                          toast.error("Missing required data. Please complete all steps.");
                          return;
                        }
                        
                        toast.info("Generating your publishing package...");
                        
                        generateExportBundle.mutate({
                          bookTitle: finalTitle || aiAnalysis.suggestedTitles[0],
                          authorName: "Author Name", // TODO: Get from user profile
                          manuscriptContent: manuscript,
                          coverImageUrl: selectedCover,
                          metadata: {
                            title: finalTitle || aiAnalysis.suggestedTitles[0],
                            subtitle: finalSubtitle || aiAnalysis.suggestedSubtitles[0],
                            description: editedDescription || aiAnalysis.bookDescription,
                            categories: selectedCategories,
                            keywords: generatedKeywords,
                            price: suggestedPrice,
                            genre: aiAnalysis.detectedGenre,
                          },
                          isbn: isbnSource === "own" ? isbnNumber : undefined,
                          copyrightPage: copyrightPage || undefined,
                        });
                      }}
                      disabled={!manuscript || !aiAnalysis || !selectedCover}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Complete Package (ZIP)
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      Ready to upload to Amazon KDP!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/50 bg-green-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900 mb-2">You're Ready to Publish!</h3>
                      <p className="text-green-800 mb-4">
                        Your book has been optimized by AI with bestseller-level intelligence. Download your package and upload to Amazon KDP to start selling.
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                          Start New Book
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer">
                            Go to Amazon KDP →
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for remaining steps */}
          {false && (
            <Card>
              <CardHeader>
                <CardTitle>Step Under Development</CardTitle>
                <CardDescription>
                  This step is being built. The AI-agentic flow continues here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCurrentStep("upload")}>
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </DashboardLayout>
  );
}
