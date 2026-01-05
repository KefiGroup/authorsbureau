import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp,
  Heart,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Cpu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

const TOPIC_CATEGORIES = [
  { id: "investing", name: "Investing & Finance", icon: TrendingUp, description: "Stock market, real estate, wealth building" },
  { id: "business", name: "Business & Entrepreneurship", icon: Briefcase, description: "Startups, leadership, scaling companies" },
  { id: "parenting", name: "Parenting & Family", icon: Heart, description: "Child development, family dynamics, education" },
  { id: "self-help", name: "Personal Development", icon: Lightbulb, description: "Productivity, mindset, habits, goals" },
  { id: "career", name: "Career & Professional Growth", icon: GraduationCap, description: "Job search, promotions, skills development" },
  { id: "ai-tech", name: "AI & Technology", icon: Cpu, description: "Artificial intelligence, automation, future tech" },
];

export default function IndependentAuthor() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [bookIdea, setBookIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [uniqueAngle, setUniqueAngle] = useState("");

  const generateOutlineMutation = trpc.ai.generateOutline.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to start writing your book</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateOutline = async () => {
    if (!bookIdea.trim() || !targetAudience.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await generateOutlineMutation.mutateAsync({
        topic: selectedCategory || customTopic,
        bookIdea: bookIdea,
        targetAudience: targetAudience,
        uniqueAngle: uniqueAngle.trim() || undefined,
      });

      // Store outline and navigate to Day 1
      localStorage.setItem("independent_author_outline", result.outline);
      localStorage.setItem("independent_author_topic", selectedCategory || customTopic);
      toast.success("Book outline generated! Starting Day 1...");
      setLocation("/writing-studio/day-1");
    } catch (error) {
      toast.error("Failed to generate outline. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Authors Bureau</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/choose-track">← Back to Track Selection</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Independent Author Track
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Write Your Own Book
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your topic, define your unique angle, and let AI help you create a complete book manuscript
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                1
              </div>
              <span className="text-sm font-medium hidden sm:inline">Topic</span>
            </div>
            <div className={`h-px w-16 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">Details</span>
            </div>
            <div className={`h-px w-16 ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                3
              </div>
              <span className="text-sm font-medium hidden sm:inline">Generate</span>
            </div>
          </div>

          {/* Step 1: Topic Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Book Topic</CardTitle>
                <CardDescription>
                  Select a category or enter your own custom topic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {TOPIC_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCategory === category.id ? "border-primary border-2" : ""
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setCustomTopic("");
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{category.name}</CardTitle>
                              <CardDescription className="text-xs">{category.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customTopic">Custom Topic</Label>
                  <Input
                    id="customTopic"
                    placeholder="E.g., Cryptocurrency trading, Vegan cooking, Digital marketing..."
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      setSelectedCategory("");
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter any topic you're passionate about and knowledgeable in
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!selectedCategory && !customTopic.trim()}
                >
                  Continue to Book Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Book Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Tell Us About Your Book</CardTitle>
                <CardDescription>
                  Help us understand your vision so AI can create the perfect outline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bookIdea">
                    What's your book about? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="bookIdea"
                    placeholder="Describe your book idea in 2-3 sentences. What problem does it solve? What will readers learn?"
                    value={bookIdea}
                    onChange={(e) => setBookIdea(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">
                    Who is your target audience? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="targetAudience"
                    placeholder="E.g., Beginner investors, Working parents, Small business owners..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueAngle">
                    What makes your approach unique? (Optional)
                  </Label>
                  <Textarea
                    id="uniqueAngle"
                    placeholder="What's your unique perspective, methodology, or framework? What sets your book apart?"
                    value={uniqueAngle}
                    onChange={(e) => setUniqueAngle(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!bookIdea.trim() || !targetAudience.trim()}
                    className="flex-1"
                  >
                    Review & Generate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Book Plan</CardTitle>
                <CardDescription>
                  Make sure everything looks good before we generate your outline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Topic</Label>
                    <p className="font-medium">{selectedCategory ? TOPIC_CATEGORIES.find(c => c.id === selectedCategory)?.name : customTopic}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Book Concept</Label>
                    <p className="font-medium">{bookIdea}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Target Audience</Label>
                    <p className="font-medium">{targetAudience}</p>
                  </div>

                  {uniqueAngle && (
                    <div>
                      <Label className="text-muted-foreground">Unique Angle</Label>
                      <p className="font-medium">{uniqueAngle}</p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next Steps:</strong> AI will generate a detailed 8-chapter outline based on your inputs. 
                    You'll then move to Day 1 of the 2-Day Program where you can refine the outline and start writing.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    disabled={generateOutlineMutation.isPending}
                  >
                    ← Edit Details
                  </Button>
                  <Button
                    onClick={handleGenerateOutline}
                    disabled={generateOutlineMutation.isPending}
                    className="flex-1"
                    size="lg"
                  >
                    {generateOutlineMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Outline...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Outline & Start Writing
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
