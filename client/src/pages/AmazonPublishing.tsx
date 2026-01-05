import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CategoryAnalysis {
  category: string;
  subcategory?: string;
  competitivenessScore: number;
  estimatedMonthlySearches: string;
  topSellerRequirement: string;
  reasoning: string;
  recommended: boolean;
}

interface OptimizedListing {
  title: string;
  subtitle?: string;
  description: string;
  keywords: string[];
  authorBio: string;
}

export default function AmazonPublishing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");

  // Category Research State
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    genre: "",
    keywords: "",
    targetAudience: "",
  });
  const [categories, setCategories] = useState<CategoryAnalysis[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<{
    primary?: CategoryAnalysis;
    secondary?: CategoryAnalysis;
  }>({});

  // Listing Optimizer State
  const [listingForm, setListingForm] = useState({
    originalTitle: "",
    genre: "",
    targetAudience: "",
    mainBenefit: "",
    keyBenefits: "",
    outline: "",
    authorName: user?.name || "",
    authorBio: "",
  });
  const [optimizedListing, setOptimizedListing] = useState<OptimizedListing | null>(null);

  // Mutations
  const researchCategories = trpc.amazon.researchCategories.useMutation({
    onSuccess: (data) => {
      setCategories(data.categories);
      toast.success(`Found ${data.categories.length} optimal categories for your book.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const recommendCategories = trpc.amazon.recommendCategories.useMutation({
    onSuccess: (data) => {
      setSelectedCategories({
        primary: data.primary,
        secondary: data.secondary,
      });
      toast.success("Optimal category combination selected for bestseller positioning.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateListing = trpc.amazon.generateCompleteListing.useMutation({
    onSuccess: (data) => {
      setOptimizedListing(data);
      toast.success("Your Amazon KDP listing has been optimized for maximum visibility and sales.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCategoryResearch = () => {
    if (!categoryForm.title || !categoryForm.genre || !categoryForm.targetAudience) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const keywords = categoryForm.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    researchCategories.mutate({
      title: categoryForm.title,
      genre: categoryForm.genre,
      keywords,
      targetAudience: categoryForm.targetAudience,
    });
  };

  const handleRecommendCategories = () => {
    if (categories.length < 2) {
      toast.error("Research categories first to get recommendations.");
      return;
    }

    recommendCategories.mutate({ categories });
  };

  const handleGenerateListing = () => {
    if (!listingForm.originalTitle || !listingForm.genre || !listingForm.targetAudience) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const keyBenefits = listingForm.keyBenefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    generateListing.mutate({
      originalTitle: listingForm.originalTitle,
      genre: listingForm.genre,
      targetAudience: listingForm.targetAudience,
      mainBenefit: listingForm.mainBenefit,
      keyBenefits,
      outline: listingForm.outline,
      authorName: listingForm.authorName,
      authorBio: listingForm.authorBio,
    });
  };

  const getCompetitivenessColor = (score: number) => {
    if (score <= 3) return "bg-green-500";
    if (score <= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCompetitivenessLabel = (score: number) => {
    if (score <= 3) return "Easy";
    if (score <= 6) return "Moderate";
    return "Difficult";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Amazon KDP Publishing</h1>
          <p className="text-lg text-muted-foreground">
            Optimize your book for Amazon bestseller success with AI-powered category research and listing optimization.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                <CardTitle>Smart Category Research</CardTitle>
                <CardDescription>
                  Find the least competitive but high-traffic categories to maximize your bestseller chances.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-title">Book Title *</Label>
                    <Input
                      id="cat-title"
                      placeholder="Your book title"
                      value={categoryForm.title}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-genre">Genre *</Label>
                    <Input
                      id="cat-genre"
                      placeholder="e.g., Business, Self-Help, Finance"
                      value={categoryForm.genre}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, genre: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat-audience">Target Audience *</Label>
                  <Input
                    id="cat-audience"
                    placeholder="Who is this book for?"
                    value={categoryForm.targetAudience}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, targetAudience: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat-keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="cat-keywords"
                    placeholder="investing, stocks, wealth building"
                    value={categoryForm.keywords}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, keywords: e.target.value })
                    }
                  />
                </div>

                <Button
                  onClick={handleCategoryResearch}
                  disabled={researchCategories.isPending}
                  className="w-full"
                >
                  {researchCategories.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Categories...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Research Categories
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Category Results */}
            {categories.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Categories</CardTitle>
                    <CardDescription>
                      Categories sorted by competitiveness (lower is better for ranking)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${
                          cat.recommended ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {cat.category}
                              {cat.subcategory && ` > ${cat.subcategory}`}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getCompetitivenessColor(cat.competitivenessScore)}>
                              {getCompetitivenessLabel(cat.competitivenessScore)} ({cat.competitivenessScore}/10)
                            </Badge>
                            {cat.recommended && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Monthly Searches:</span>{" "}
                            <span className="font-medium">{cat.estimatedMonthlySearches}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Top Seller Needs:</span>{" "}
                            <span className="font-medium">{cat.topSellerRequirement}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{cat.reasoning}</p>
                      </div>
                    ))}

                    <Button
                      onClick={handleRecommendCategories}
                      disabled={recommendCategories.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {recommendCategories.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Selecting Best Combination...
                        </>
                      ) : (
                        "Get Optimal Category Combination"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Selected Categories */}
                {(selectedCategories.primary || selectedCategories.secondary) && (
                  <Card className="border-2 border-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Your Optimal Category Combination
                      </CardTitle>
                      <CardDescription>
                        Amazon allows 2 categories. These give you the best chance of ranking as a bestseller.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCategories.primary && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>Primary Category</Badge>
                            <Badge className={getCompetitivenessColor(selectedCategories.primary.competitivenessScore)}>
                              {getCompetitivenessLabel(selectedCategories.primary.competitivenessScore)} (
                              {selectedCategories.primary.competitivenessScore}/10)
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">
                            {selectedCategories.primary.category}
                            {selectedCategories.primary.subcategory && ` > ${selectedCategories.primary.subcategory}`}
                          </h3>
                        </div>
                      )}
                      {selectedCategories.secondary && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Secondary Category</Badge>
                            <Badge className={getCompetitivenessColor(selectedCategories.secondary.competitivenessScore)}>
                              {getCompetitivenessLabel(selectedCategories.secondary.competitivenessScore)} (
                              {selectedCategories.secondary.competitivenessScore}/10)
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">
                            {selectedCategories.secondary.category}
                            {selectedCategories.secondary.subcategory && ` > ${selectedCategories.secondary.subcategory}`}
                          </h3>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Listing Optimizer Tab */}
          <TabsContent value="listing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KDP Listing Optimizer</CardTitle>
                <CardDescription>
                  Generate conversion-optimized title, description, and keywords for maximum visibility and sales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="list-title">Original Book Title *</Label>
                    <Input
                      id="list-title"
                      placeholder="Your book title"
                      value={listingForm.originalTitle}
                      onChange={(e) =>
                        setListingForm({ ...listingForm, originalTitle: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="list-genre">Genre *</Label>
                    <Input
                      id="list-genre"
                      placeholder="e.g., Business, Self-Help"
                      value={listingForm.genre}
                      onChange={(e) =>
                        setListingForm({ ...listingForm, genre: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="list-audience">Target Audience *</Label>
                  <Input
                    id="list-audience"
                    placeholder="Who is this book for?"
                    value={listingForm.targetAudience}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, targetAudience: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="list-benefit">Main Benefit/Transformation *</Label>
                  <Input
                    id="list-benefit"
                    placeholder="What will readers achieve?"
                    value={listingForm.mainBenefit}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, mainBenefit: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="list-benefits">Key Benefits (one per line)</Label>
                  <Textarea
                    id="list-benefits"
                    placeholder="Learn proven investment strategies&#10;Build wealth systematically&#10;Achieve financial freedom"
                    rows={4}
                    value={listingForm.keyBenefits}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, keyBenefits: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="list-outline">Book Outline/Summary *</Label>
                  <Textarea
                    id="list-outline"
                    placeholder="Brief overview of your book's content and structure"
                    rows={4}
                    value={listingForm.outline}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, outline: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="list-author">Author Name *</Label>
                    <Input
                      id="list-author"
                      placeholder="Your name"
                      value={listingForm.authorName}
                      onChange={(e) =>
                        setListingForm({ ...listingForm, authorName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="list-bio">Author Bio (optional)</Label>
                    <Input
                      id="list-bio"
                      placeholder="Your credentials"
                      value={listingForm.authorBio}
                      onChange={(e) =>
                        setListingForm({ ...listingForm, authorBio: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateListing}
                  disabled={generateListing.isPending}
                  className="w-full"
                >
                  {generateListing.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing Listing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Optimized Listing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Optimized Listing Results */}
            {optimizedListing && (
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Your Optimized Amazon Listing
                  </CardTitle>
                  <CardDescription>
                    Copy these optimized fields to your Amazon KDP dashboard for maximum visibility and conversions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Optimized Title</Label>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-medium text-lg">{optimizedListing.title}</p>
                    </div>
                  </div>

                  {optimizedListing.subtitle && (
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">Optimized Subtitle</Label>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-muted-foreground">{optimizedListing.subtitle}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Optimized Description</Label>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: optimizedListing.description }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Optimized Keywords (7 keywords)</Label>
                    <div className="flex flex-wrap gap-2">
                      {optimizedListing.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Author Bio</Label>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm">{optimizedListing.authorBio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* KDP Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Direct KDP Upload</CardTitle>
                <CardDescription>
                  One-click upload to Amazon KDP (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Feature In Development</p>
                    <p className="text-sm text-blue-700">
                      Direct KDP upload integration is currently being developed. For now, you can export your manuscript
                      and use the optimized listing data to manually publish on Amazon KDP.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Manual Publishing Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Export your manuscript from the Writing Studio (Day 2 page)</li>
                    <li>Use the Category Research tool to find optimal categories</li>
                    <li>Generate your optimized listing with the Listing Optimizer</li>
                    <li>Go to <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">kdp.amazon.com</a> and create a new book</li>
                    <li>Upload your manuscript file (DOCX or PDF)</li>
                    <li>Copy the optimized title, subtitle, description, and keywords</li>
                    <li>Select your researched categories</li>
                    <li>Complete pricing and rights information</li>
                    <li>Publish your book!</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
