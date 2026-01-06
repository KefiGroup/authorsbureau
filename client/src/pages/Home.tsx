import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { BookOpen, PenTool, Rocket, TrendingUp, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Authors Bureau</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/featured-authors">Featured Authors</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            The World's Largest{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Authors Bureau
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your book idea into a published bestseller in just 2 days. Write, design, market, and
            dominate Amazon with our comprehensive AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/ready-to-publish">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Upload Existing Manuscript
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/choose-track">
                    Or Start Writing From Scratch
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/choose-track">
                    Start Writing Your Book
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-24 bg-card/50 rounded-3xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-foreground">Complete Author Platform</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to become a bestselling author, all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <PenTool className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">AI Book Writing</h3>
            <p className="text-muted-foreground">
              Complete your manuscript in 2 days with our intensive AI-powered writing program. From outline to
              final draft.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Professional Design</h3>
            <p className="text-muted-foreground">
              AI-generated covers, professional formatting, and export to all major formats (EPUB, MOBI, PDF).
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Marketing Automation</h3>
            <p className="text-muted-foreground">
              Build landing pages, create funnels, automate email sequences, and maximize your book's revenue.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Amazon Bestseller</h3>
            <p className="text-muted-foreground">
              Optimize for Amazon.com, .uk, and .sg. Track rankings, reviews, and dominate your categories.
            </p>
          </div>
        </div>
      </section>

      {/* 2-Day Program Section */}
      <section className="container py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">The 2-Day Book Writing Program</h2>
            <p className="text-xl text-muted-foreground">
              Our proven process takes you from idea to completed manuscript in just 48 hours
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Day 1 */}
            <div className="space-y-6 p-8 rounded-xl border-2 border-primary bg-card">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-foreground">Day 1: Foundation</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Book idea and detailed outline generation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Draft chapters 1-3 with AI assistance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Character and plot development</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Review and refine your foundation</span>
                </li>
              </ul>
            </div>

            {/* Day 2 */}
            <div className="space-y-6 p-8 rounded-xl border-2 border-accent bg-card">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-foreground">Day 2: Completion</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Complete remaining chapters (4-10)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">AI-powered editing and proofreading</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Generate compelling titles and subtitles</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Final review and export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Empowerment Section */}
      <section className="container py-16 bg-card/30 rounded-3xl">
        <div className="text-center space-y-6">
          <Badge className="mb-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Free SUCKcess Story Discovery
          </Badge>
          <h2 className="text-4xl font-bold text-foreground">What's Your SUCKcess Story?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take our free 5-minute quiz to discover your unique transformation journey and get a personalized roadmap to turn your story into a published book.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/discover-your-story">
                <Sparkles className="mr-2 h-5 w-5" />
                Discover Your Story
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/writing-studio">
                Go to Writing Studio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-foreground">Real People, Real Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ordinary people who became published authors with Authors Bureau
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4 p-8 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-1 text-accent">
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-lg text-foreground italic">
              "I went from idea to #1 Amazon bestseller in just one week. The AI writing tools are absolutely revolutionary!"
            </blockquote>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                SM
              </div>
              <div>
                <div className="font-semibold text-foreground">Sarah Mitchell</div>
                <div className="text-sm text-muted-foreground">Thriller Author • 7 Books</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-8 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-1 text-accent">
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-lg text-foreground italic">
              "The marketing automation helped me grow from 500 to 50,000 email subscribers. My revenue increased 100x!"
            </blockquote>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                ER
              </div>
              <div>
                <div className="font-semibold text-foreground">Elena Rodriguez</div>
                <div className="text-sm text-muted-foreground">Romance Author • 15 Books</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-8 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-1 text-accent">
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <CheckCircle2 className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-lg text-foreground italic">
              "Published 12 books in one year, each hitting bestseller status. This platform is a game-changer for authors!"
            </blockquote>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                MC
              </div>
              <div>
                <div className="font-semibold text-foreground">Marcus Chen</div>
                <div className="text-sm text-muted-foreground">Business Author • 12 Books</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-border">
          <h2 className="text-4xl font-bold text-foreground">Ready to Become a Bestselling Author?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of authors who have transformed their ideas into published bestsellers with Authors
            Bureau.
          </p>
          {isAuthenticated ? (
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/dashboard">
                Start Writing Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2026 Authors Bureau. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
