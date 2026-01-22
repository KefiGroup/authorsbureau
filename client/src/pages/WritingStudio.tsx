import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { 
  BookOpen, 
  Sparkles, 
  MessageSquare,
  FileText,
  Palette,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function WritingStudio() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);

  const createBlueprint = trpc.blueprint.create.useMutation({
    onSuccess: (data) => {
      setLocation(`/start-writing/${data.blueprintId}`);
    },
    onError: (error) => {
      toast.error("Failed to start writing process");
      console.error("Blueprint creation error:", error);
      setIsCreating(false);
    },
  });

  const handleStartWriting = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    setIsCreating(true);
    createBlueprint.mutate({ projectType: "novel" }); // Default to novel, will be updated in conversation
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Conversational AI Guidance",
      description: "Chat with our AI to develop your story through natural conversation. No forms, no templates—just a friendly dialogue that adapts to your vision.",
      color: "text-blue-500"
    },
    {
      icon: FileText,
      title: "Comprehensive Story Blueprint",
      description: "Build a complete blueprint covering premise, characters, plot structure, target audience, and themes—everything you need before writing your first chapter.",
      color: "text-purple-500"
    },
    {
      icon: Palette,
      title: "Seamless Integration",
      description: "Your blueprint automatically flows to AI Manuscript Assistance, Cover Design, Amazon KDP Optimizer, and Marketing—no duplicate data entry.",
      color: "text-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Professional Publishing Path",
      description: "From concept to published book with AI-powered tools at every step: writing, editing, cover design, category optimization, and marketing campaigns.",
      color: "text-green-500"
    }
  ];

  const process = [
    {
      step: 1,
      title: "Define Your Project",
      description: "Tell us about your book type, genre, and target length through conversational AI"
    },
    {
      step: 2,
      title: "Develop Your Story",
      description: "Build your premise, characters, plot structure, and themes with AI guidance"
    },
    {
      step: 3,
      title: "Generate Blueprint",
      description: "Get a comprehensive story blueprint with all elements ready for writing"
    },
    {
      step: 4,
      title: "Start Writing",
      description: "Use AI Manuscript Assistance with full context from your blueprint"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Authors Bureau</span>
          </Link>
          {isAuthenticated ? (
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Writing Studio
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start Your Writing Process
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform your book idea into a comprehensive story blueprint through conversational AI. 
              No more staring at blank pages—let our AI guide you step-by-step from concept to completion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartWriting}
                disabled={isCreating}
                className="text-lg px-8 py-6"
              >
                {isCreating ? (
                  <>
                    <Zap className="mr-2 h-5 w-5 animate-pulse" />
                    Creating Your Blueprint...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Start Your Writing Process
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground mt-4">
                  New here? Clicking "Start Your Writing Process" will let you sign up instantly with Google, Microsoft, or Apple.
                </p>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color.replace('text-', '')}/10 to-${feature.color.replace('text-', '')}/20 flex items-center justify-center`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Process Timeline */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our conversational AI guides you through a structured process to develop your story blueprint
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {process.map((item, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="absolute -top-4 left-6">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* What You'll Build */}
          <Card className="mb-16 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                What You'll Build
              </CardTitle>
              <CardDescription className="text-base">
                Your comprehensive story blueprint includes:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Project Overview (type, genre, target length)",
                  "Core Premise & Unique Selling Points",
                  "Protagonist Profile (goals, conflicts, arc)",
                  "Supporting Characters & Relationships",
                  "Setting & World-Building Details",
                  "Plot Structure (beginning, middle, end)",
                  "Target Audience Analysis",
                  "Thematic Elements & Messages",
                  "Comparable Titles & Market Positioning"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Bring Your Book to Life?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of authors who have transformed their ideas into published books with our AI-powered platform
            </p>
            <Button 
              size="lg" 
              onClick={handleStartWriting}
              disabled={isCreating}
              className="text-lg px-8 py-6"
            >
              {isCreating ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" />
                  Creating Your Blueprint...
                </>
              ) : (
                <>
                  Start Your Writing Process Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
