import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Sparkles,
  Check,
  ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function ChooseTrack() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to choose your author track</CardDescription>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Authors Bureau</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Choose Your Path
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Two Ways to Become a Published Author
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you want to write your own book or contribute to our bestselling anthology series, 
              we have the perfect path for you.
            </p>
          </div>

          {/* Track Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Track 1: Independent Author */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full" />
              
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">Track 1</Badge>
                    <CardTitle className="text-2xl">Independent Author</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Write and publish your own complete book on any topic you're passionate about
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Choose your own topic (investing, finance, parenting, business, self-help, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Full creative control and ownership of your book</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">AI-powered writing assistance for faster completion</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Professional manuscript export (DOCX/PDF)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Amazon KDP publishing optimization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Keep 100% of your royalties</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Perfect for:</strong> Experts, coaches, consultants, and professionals who want to establish authority in their field
                  </p>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setLocation("/writing-studio/independent")}
                  >
                    Start Your Own Book
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Track 2: Anthology Contributor */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-shadow border-2 border-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full" />
              
              <Badge className="absolute top-4 right-4 bg-amber-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>

              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">Track 2</Badge>
                    <CardTitle className="text-2xl">Anthology Contributor</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Contribute your SUCKcess story to our bestselling anthology series with Pauline Teo
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Share your transformation story in "Be SUCKcessful" anthology</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Co-author credit alongside Pauline Teo (#1 Bestselling Author)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Collaborative editing and mentorship from Pauline</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Faster path to published author status</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Leverage existing bestseller platform and audience</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Build credibility with established brand</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Perfect for:</strong> First-time authors, entrepreneurs, and anyone with a powerful transformation story to share
                  </p>
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="default"
                    onClick={() => setLocation("/anthology/submit")}
                  >
                    Join the Anthology
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Not sure which path is right for you?
            </p>
            <Button variant="outline" asChild>
              <Link href="/discover-your-story">
                Take Our SUCKcess Story Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
