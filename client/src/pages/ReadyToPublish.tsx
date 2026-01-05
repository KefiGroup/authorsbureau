import { useState } from "react";
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
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("upload");
  const [manuscript, setManuscript] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [uploadMethod, setUploadMethod] = useState<"paste" | "file">("paste");
  const [isUploading, setIsUploading] = useState(false);
  
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
        <div className="space-y-6">
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

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Amazon Book Description</CardTitle>
                  <CardDescription>
                    Conversion-optimized description ready for Amazon KDP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can edit this description or use it as-is. It's already optimized for Amazon conversions.
                  </p>
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

              <div className="flex justify-end">
                <Button size="lg" onClick={() => setCurrentStep("cover")}>
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
                            // TODO: Call cover generation API
                            toast.info("Cover generation coming soon!");
                          }}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate 3 Cover Designs
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
                              // TODO: Regenerate with feedback
                              toast.info("Cover refinement coming soon!");
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
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
                              // TODO: Upload cover
                              toast.info("Cover upload coming soon!");
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
                  <div className="text-center py-8">
                    <Button
                      size="lg"
                      onClick={() => {
                        toast.info("AI category research integration coming soon!");
                      }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Best Categories
                    </Button>
                  </div>
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
                  <div className="text-center py-8 text-muted-foreground">
                    Generate categories first to get keyword recommendations
                  </div>
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
                  <div className="text-center py-8 text-muted-foreground">
                    Pricing analysis coming soon
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() => setCurrentStep("export")}
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
                  </div>

                  <div className="mt-8 text-center">
                    <Button
                      size="lg"
                      onClick={() => {
                        toast.info("Export bundle generation coming soon!");
                      }}
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
      </div>
    </DashboardLayout>
  );
}
