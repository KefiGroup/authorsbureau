import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { 
  BookOpen, 
  Sparkles, 
  Target, 
  Users, 
  Heart, 
  Lightbulb, 
  TrendingUp, 
  Award,
  ArrowRight,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function WritingStudio() {
  const { user, isAuthenticated } = useAuth();
  const { data: authorProfile } = trpc.author.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // SUCKcess Theory 8 Steps
  const suckcessSteps = [
    {
      icon: Target,
      title: "Start by Sucking",
      description: "Embrace that everyone starts as a beginner. Your 'disaster' moments are the foundation of your story.",
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Understand Yourself",
      description: "Deep dive into your personal journey, struggles, and the lessons you've learned along the way.",
      color: "text-orange-500"
    },
    {
      icon: Lightbulb,
      title: "Choose Your Path",
      description: "Identify the specific transformation you want to share and who needs to hear your story.",
      color: "text-yellow-500"
    },
    {
      icon: Award,
      title: "Know Your Niche",
      description: "Define your unique angle and expertise that sets your story apart from others.",
      color: "text-green-500"
    },
    {
      icon: Heart,
      title: "Cultivate Your Circle",
      description: "Understand your ideal reader and how your story will impact their lives.",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Evolve Through Crisis",
      description: "Transform your biggest challenges into your most powerful teaching moments.",
      color: "text-indigo-500"
    },
    {
      icon: Sparkles,
      title: "See It Before It Happens",
      description: "Visualize your completed book and the impact it will have on readers worldwide.",
      color: "text-purple-500"
    },
    {
      icon: BookOpen,
      title: "Serve With Your Story",
      description: "Complete your manuscript and share your transformation to inspire others.",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Writing Studio
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Write Your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              SUCKcess Story
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your life's disasters into a published bestseller in just 2 days using our proven SUCKcess Theory framework and AI-powered writing tools.
          </p>
          
          {isAuthenticated && authorProfile ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/writing-studio/day-1">
                  Start Day 1: Discover Your Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/books">View My Books</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/">Learn More</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 2-Day Program Overview */}
      <section className="container py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold">The 2-Day SUCKcess Program</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A structured, AI-guided journey from your personal disaster to published masterpiece
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Day 1 */}
          <Card className="border-2 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default" className="text-lg px-4 py-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Day 1
                </Badge>
                <span className="text-sm text-muted-foreground">4-6 hours</span>
              </div>
              <CardTitle className="text-2xl">Discover Your SUCKcess Story</CardTitle>
              <CardDescription className="text-base">
                Uncover your transformation journey and build your book foundation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Story Identification</p>
                    <p className="text-sm text-muted-foreground">AI helps you identify your most powerful transformation moment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">8-Step Framework Mapping</p>
                    <p className="text-sm text-muted-foreground">Map your journey through the SUCKcess Theory steps</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Chapter Outline Creation</p>
                    <p className="text-sm text-muted-foreground">AI generates your complete book outline with chapter summaries</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Character & Theme Development</p>
                    <p className="text-sm text-muted-foreground">Define your protagonist (you!), supporting characters, and core themes</p>
                  </div>
                </div>
              </div>
              
              {isAuthenticated && authorProfile ? (
                <Button className="w-full mt-4" asChild>
                  <Link href="/writing-studio/day-1">
                    Start Day 1 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full mt-4" variant="outline" asChild>
                  <a href={getLoginUrl()}>Sign In to Start</a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Day 2 */}
          <Card className="border-2 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default" className="text-lg px-4 py-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Day 2
                </Badge>
                <span className="text-sm text-muted-foreground">6-8 hours</span>
              </div>
              <CardTitle className="text-2xl">Write Your Manuscript</CardTitle>
              <CardDescription className="text-base">
                AI-assisted chapter drafting and professional editing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">AI Chapter Drafting</p>
                    <p className="text-sm text-muted-foreground">Generate complete chapter drafts based on your outline</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Real-Time Editing</p>
                    <p className="text-sm text-muted-foreground">Refine your voice, add personal details, and polish your prose</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Consistency Check</p>
                    <p className="text-sm text-muted-foreground">AI ensures your story flows and maintains consistent themes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Export & Format</p>
                    <p className="text-sm text-muted-foreground">Download your manuscript ready for publishing</p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline" disabled={!isAuthenticated}>
                Complete Day 1 First
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SUCKcess Theory Framework */}
      <section className="container py-16 bg-card/30 rounded-3xl my-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold">The SUCKcess Theory Framework</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Eight proven steps to transform your disasters into your greatest breakthroughs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {suckcessSteps.map((step, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-muted ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline">Step {index + 1}</Badge>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg italic text-muted-foreground max-w-2xl mx-auto mb-6">
            "We do not succeed in spite of our disasters. We succeed because of them."
          </p>
          <p className="font-semibold">— Pauline Teo, International Bestselling Author</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Disaster Is Not The End.<br />
              It's The Beginning Of Your SUCKcess.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of ordinary people who transformed their stories into published books
            </p>
            {isAuthenticated && authorProfile ? (
              <Button size="lg" asChild>
                <Link href="/writing-studio/day-1">
                  Start Writing Your SUCKcess Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
