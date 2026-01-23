import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BookOpen, PenTool, Rocket, TrendingUp, ArrowRight, CheckCircle2, Sparkles, Star, Users, BookMarked } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  // Featured authors data
  const featuredAuthors = [
    {
      name: "Pauline Teo",
      title: "International Bestselling Author",
      book: "Be SUCKcessful",
      achievement: "#1 Amazon Bestseller",
      genre: "Personal Development",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      quote: "Every master was once a disaster"
    },
    {
      name: "Robert J. Battista",
      title: "Technology Executive & Author",
      book: "Hemispheric Intelligence",
      achievement: "#1 New Release",
      genre: "AI & Philosophy",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      quote: "Better architecture enables better thinking"
    },
    {
      name: "Featured Author",
      title: "Bestselling Author",
      book: "Coming Soon",
      achievement: "Amazon Bestseller",
      genre: "Business & Leadership",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      quote: "Transform your story into impact"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Authors Bureau</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="#featured-authors">Featured Authors</Link>
            </Button>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="#how-it-works">How It Works</Link>
            </Button>
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="lg" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>Sign Up</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Star className="h-4 w-4 mr-2 inline" />
            Join 500+ Published Authors
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Write, Publish & Market Your{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
              Bestseller
            </span>{" "}
            in 2 Days
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The world's first AI-powered author platform with 3 integrated studios. 
            From blank page to Amazon bestseller—faster than you ever imagined.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Writing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="#featured-authors">See Success Stories</Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>500+ Authors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>1,000+ Books Published</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>2M+ Copies Sold</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Studios Section - Why Choose Us */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Why Authors Choose Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three powerful studios, one seamless journey from idea to bestseller
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AI Writing Studio */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center mx-auto">
                  <PenTool className="h-8 w-8 text-white" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold">AI Writing Studio</h3>
                  <p className="text-4xl font-bold text-primary">50,000 words</p>
                  <p className="text-muted-foreground">in 24 hours</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>AI-powered blueprint creation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Chapter-by-chapter generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Real-time editing & refinement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Genre-specific templates</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/ai-writing-studio">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Publishing Studio */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-xl relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
              <CardContent className="p-8 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center mx-auto">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold">AI Publishing Studio</h3>
                  <p className="text-4xl font-bold text-primary">KDP Ready</p>
                  <p className="text-muted-foreground">in 1 day</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>AI-generated book covers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Professional formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Amazon KDP optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>ISBN & metadata management</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/ai-publishing-studio">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Marketing Studio */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-primary flex items-center justify-center mx-auto">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold">AI Marketing Studio</h3>
                  <p className="text-4xl font-bold text-primary">Launch</p>
                  <p className="text-muted-foreground">campaigns that sell</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Email campaign builder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Social media automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Amazon ad optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Sales analytics dashboard</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/ai-marketing-studio">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Authors Section */}
      <section id="featured-authors" className="py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Featured Authors from Our Network
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of successful authors who transformed their ideas into bestsellers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredAuthors.map((author, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all group">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img 
                    src={author.image} 
                    alt={author.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{author.name}</h3>
                    <p className="text-sm text-muted-foreground">{author.title}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{author.book}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <Star className="h-3 w-3 mr-1" />
                      {author.achievement}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{author.genre}</p>
                  </div>
                  
                  <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                    "{author.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/featured-authors">
                <Users className="mr-2 h-5 w-5" />
                View All 500+ Authors
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              From Idea to Bestseller in 3 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our proven system has helped 500+ authors achieve their publishing dreams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold">Write</h3>
              <p className="text-muted-foreground">
                Use AI Writing Studio to create your manuscript in 24 hours with our blueprint-driven system
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold">Publish</h3>
              <p className="text-muted-foreground">
                Get your KDP-ready package with professional cover, formatting, and metadata in 1 day
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-primary flex items-center justify-center text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold">Market</h3>
              <p className="text-muted-foreground">
                Launch targeted campaigns with email, social media, and Amazon ads to reach your readers
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Author Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-purple-500/10 to-accent/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Ready to Become a Published Author?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join our network of 500+ successful authors. Start writing for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="#featured-authors">See Success Stories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Authors Bureau</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The world's largest AI-powered authors platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Studios</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/ai-writing-studio" className="hover:text-foreground">AI Writing Studio</Link></li>
                <li><Link href="/ai-publishing-studio" className="hover:text-foreground">AI Publishing Studio</Link></li>
                <li><Link href="/ai-marketing-studio" className="hover:text-foreground">AI Marketing Studio</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/featured-authors" className="hover:text-foreground">Featured Authors</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground">How It Works</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Authors Bureau. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
