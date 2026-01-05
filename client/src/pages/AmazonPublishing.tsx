import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Target, FileText, Upload, Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function AmazonPublishing() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch user's books
  const { data: booksData, isLoading: booksLoading } = trpc.book.getMyBooks.useQuery();
  const books = booksData || [];

  // Category Research
  const researchCategories = trpc.amazon.researchCategories.useMutation({
    onSuccess: (data) => {
      toast.success("AI analysis complete! Review the recommended categories below.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to analyze book");
    },
  });

  // Listing Optimizer
  const generateListing = trpc.amazon.generateCompleteListing.useMutation({
    onSuccess: () => {
      toast.success("Complete KDP listing generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate listing");
    },
  });

  const handleAnalyzeBook = () => {
    if (!selectedBookId) {
      toast.error("Please select a book to analyze");
      return;
    }
    researchCategories.mutate({ bookId: selectedBookId });
  };

  const handleGenerateListing = () => {
    if (!selectedBookId) {
      toast.error("Please select a book first");
      return;
    }
    
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category from the research results");
      return;
    }

    const selectedBook = books.find(b => b.id === selectedBookId);
    if (!selectedBook) return;

    generateListing.mutate({
      originalTitle: selectedBook.title,
      genre: selectedBook.genre || "General",
      targetAudience: "General readers",
      mainBenefit: "Transform your knowledge into a published book",
      keyBenefits: selectedCategories.slice(0, 3),
      outline: selectedBook.description || "A comprehensive guide",
      authorName: "Author", // Will be replaced with actual author name
      authorBio: "Experienced author and expert in the field",
    });
  };

  const toggleCategorySelection = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      if (prev.length >= 3) {
        toast.error("Amazon only allows 3 categories maximum");
        return prev;
      }
      return [...prev, category];
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getCompetitivenessColor = (score: number) => {
    if (score <= 3) return "text-green-600 bg-green-50";
    if (score <= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getCompetitivenessLabel = (score: number) => {
    if (score <= 3) return "Low Competition";
    if (score <= 6) return "Medium Competition";
    return "High Competition";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Amazon KDP Publishing</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered category research, listing optimization, and KDP upload guidance
          </p>
        </div>

        {/* Book Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Select Your Book
            </CardTitle>
            <CardDescription>
              Choose which book you want to optimize for Amazon KDP
            </CardDescription>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your books...
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No books found. Create a book first to use Amazon publishing tools.</p>
              </div>
            ) : (
              <Select
                value={selectedBookId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedBookId(parseInt(value));
                  setSelectedCategories([]);
                  researchCategories.reset();
                  generateListing.reset();
                }}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a book..." />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id.toString()}>
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Category Research
            </TabsTrigger>
            <TabsTrigger value="listing" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Listing Optimizer
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              KDP Upload
            </TabsTrigger>
          </TabsList>

          {/* Category Research Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Category Research</CardTitle>
                <CardDescription>
                  Our AI analyzes your book content and recommends the smartest Amazon categories - 
                  those with low competition but high traffic to maximize your bestseller chances.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleAnalyzeBook}
                  disabled={!selectedBookId || researchCategories.isPending}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {researchCategories.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI Analyzing Your Book...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Book & Find Best Categories
                    </>
                  )}
                </Button>

                {researchCategories.data && (
                  <div className="space-y-4">
                    {/* Book Analysis Summary */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        AI Analysis Complete
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Based on your book "{researchCategories.data.bookAnalysis.title}", 
                        our AI identified {researchCategories.data.categories.length} optimal categories.
                        Select up to 3 categories (Amazon's limit).
                      </p>
                    </div>

                    {/* Category Recommendations */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Recommended Categories</h3>
                      {researchCategories.data.categories.map((cat, idx) => (
                        <Card
                          key={idx}
                          className={`cursor-pointer transition-all ${
                            selectedCategories.includes(cat.category)
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => toggleCategorySelection(cat.category)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium text-foreground">{cat.category}</h4>
                                  {cat.recommended && (
                                    <Badge variant="default" className="text-xs">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI Recommended
                                    </Badge>
                                  )}
                                  {selectedCategories.includes(cat.category) && (
                                    <Badge variant="outline" className="text-xs border-primary text-primary">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Selected
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm text-muted-foreground">{cat.reasoning}</p>

                                <div className="flex items-center gap-4 flex-wrap text-sm">
                                  <div className="flex items-center gap-1">
                                    <Badge className={getCompetitivenessColor(cat.competitivenessScore)}>
                                      {getCompetitivenessLabel(cat.competitivenessScore)}
                                    </Badge>
                                    <span className="text-muted-foreground">Score: {cat.competitivenessScore}/10</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    {cat.estimatedMonthlySearches.toLowerCase().includes("high") ? (
                                      <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 text-yellow-600" />
                                    )}
                                    <span>{cat.estimatedMonthlySearches} searches</span>
                                  </div>

                                  <div className="text-muted-foreground">
                                    To rank #1: {cat.topSellerRequirement}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedCategories.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">
                          Selected Categories ({selectedCategories.length}/3)
                        </h4>
                        <div className="space-y-1">
                          {selectedCategories.map((cat, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              {idx + 1}. {cat}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listing Optimizer Tab */}
          <TabsContent value="listing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KDP Listing Optimizer</CardTitle>
                <CardDescription>
                  Generate optimized title, description, and 7 keywords based on your selected categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedCategories.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Categories Required</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please complete the Category Research step first and select your categories.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleGenerateListing}
                      disabled={generateListing.isPending}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {generateListing.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Optimized Listing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Complete KDP Listing
                        </>
                      )}
                    </Button>

                    {generateListing.data && (
                      <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Optimized Title</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generateListing.data.title, "Title")}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-foreground">{generateListing.data.title}</p>
                          </div>
                        </div>

                        {/* Subtitle */}
                        {generateListing.data.subtitle && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground">Subtitle</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generateListing.data.subtitle!, "Subtitle")}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                              <p className="text-foreground">{generateListing.data.subtitle}</p>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Book Description</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generateListing.data.description, "Description")}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-foreground whitespace-pre-wrap">{generateListing.data.description}</p>
                          </div>
                        </div>

                        {/* Keywords */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">7 Keywords (Amazon Limit)</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generateListing.data.keywords.join(", "), "Keywords")}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <div className="flex flex-wrap gap-2">
                              {generateListing.data.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Author Bio */}
                        {generateListing.data.authorBio && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground">Author Bio</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generateListing.data.authorBio!, "Author Bio")}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                              <p className="text-foreground">{generateListing.data.authorBio}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KDP Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Amazon KDP Upload Guide</CardTitle>
                <CardDescription>
                  Follow these steps to publish your book on Amazon KDP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Direct API integration with Amazon KDP requires approval from Amazon. 
                    For now, follow these manual steps to publish your book.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Export Your Manuscript</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Go to your book's dashboard and export as DOCX or PDF format.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Create KDP Account</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Visit <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">kdp.amazon.com</a> and sign in or create an account.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Upload Manuscript & Cover</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your exported manuscript and book cover generated from our Cover Generator tool.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Use Optimized Listing Data</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Copy and paste the title, description, keywords, and categories from the "Listing Optimizer" tab above.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Set Pricing & Publish</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose your pricing strategy, select territories, and click "Publish Your Kindle eBook".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-green-900">
                    <strong>Pro Tip:</strong> Your book will be live on Amazon within 24-72 hours after publishing. 
                    Monitor your rankings in the categories you selected!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
