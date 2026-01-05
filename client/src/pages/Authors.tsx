import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Award, BookOpen, Star, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

// Featured authors data - in production, this would come from the database
const featuredAuthors = [
  {
    id: 1,
    name: "Sarah Mitchell",
    penName: "S.M. Mitchell",
    bio: "New York Times bestselling author of psychological thrillers",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    genre: "Thriller",
    booksPublished: 7,
    bestsellerRank: "#1 Amazon Bestseller",
    achievement: "Over 2 million copies sold worldwide",
    quote: "Authors Bureau transformed my writing process. I completed my latest thriller in just 2 days and it hit #1 on Amazon within a week!",
  },
  {
    id: 2,
    name: "Marcus Chen",
    penName: "Marcus Chen",
    bio: "Award-winning business strategist and author",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    genre: "Business",
    booksPublished: 12,
    bestsellerRank: "Wall Street Journal Bestseller",
    achievement: "Featured in Forbes and Entrepreneur",
    quote: "The AI-powered writing tools helped me scale my content creation. I've published 12 books in the last year, each one reaching bestseller status.",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    penName: "Elena R. Martinez",
    bio: "Romance novelist with a passion for heartfelt stories",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    genre: "Romance",
    booksPublished: 15,
    bestsellerRank: "USA Today Bestseller",
    achievement: "4.8-star average rating across all books",
    quote: "The marketing automation features are incredible. My email list grew from 500 to 50,000 readers in just 6 months!",
  },
  {
    id: 4,
    name: "Dr. James Patterson",
    penName: "James Patterson PhD",
    bio: "Self-help expert and motivational speaker",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    genre: "Self-Help",
    booksPublished: 9,
    bestsellerRank: "Amazon #1 in Personal Development",
    achievement: "Keynote speaker at TEDx",
    quote: "From idea to published bestseller in 48 hours. The platform's efficiency is unmatched in the publishing industry.",
  },
  {
    id: 5,
    name: "Aisha Patel",
    penName: "A.K. Patel",
    bio: "Science fiction author exploring future worlds",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    genre: "Sci-Fi",
    booksPublished: 6,
    bestsellerRank: "Hugo Award Nominee",
    achievement: "Featured in Wired and The Verge",
    quote: "The AI writing assistant understood my creative vision perfectly. It's like having a co-author who never sleeps!",
  },
  {
    id: 6,
    name: "Robert Thompson",
    penName: "R.J. Thompson",
    bio: "Historical fiction writer bringing the past to life",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    genre: "Historical Fiction",
    booksPublished: 8,
    bestsellerRank: "Goodreads Choice Award Winner",
    achievement: "Over 500,000 copies sold",
    quote: "The research and writing tools saved me months of work. I can focus on storytelling while the platform handles the rest.",
  },
];

const stats = [
  { label: "Published Authors", value: "10,000+", icon: Users },
  { label: "Books Published", value: "50,000+", icon: BookOpen },
  { label: "Amazon Bestsellers", value: "2,500+", icon: Award },
  { label: "Total Copies Sold", value: "25M+", icon: TrendingUp },
];

export default function Authors() {
  // SEO optimization
  useEffect(() => {
    document.title = "Featured Authors | Authors Bureau - Meet Our Bestselling Authors";
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Discover successful authors who transformed their ideas into bestsellers with Authors Bureau. Join 10,000+ published authors using AI-powered writing, design, and marketing tools."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Discover successful authors who transformed their ideas into bestsellers with Authors Bureau. Join 10,000+ published authors using AI-powered writing, design, and marketing tools.";
      document.head.appendChild(meta);
    }

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "Featured Authors | Authors Bureau");
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      meta.content = "Featured Authors | Authors Bureau";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Authors Bureau</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Meet Our <span className="text-gradient">Bestselling Authors</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful authors who transformed their book ideas into published
            bestsellers using our AI-powered platform. Their success stories speak for themselves.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Authors Grid */}
      <section className="container py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-foreground">Featured Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real authors, real results. See how our platform helped them achieve their publishing dreams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredAuthors.map((author) => (
            <Card key={author.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={author.image}
                  alt={author.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {author.genre}
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{author.penName}</h3>
                  <p className="text-sm text-muted-foreground">{author.name}</p>
                </div>
                <p className="text-muted-foreground">{author.bio}</p>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">{author.booksPublished} Books Published</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-foreground font-medium">{author.bestsellerRank}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-foreground font-medium">{author.achievement}</span>
                  </div>
                </div>

                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                  "{author.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-border">
          <h2 className="text-4xl font-bold text-foreground">Ready to Join Our Success Stories?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start your journey to becoming a bestselling author today. Join 10,000+ authors who trust
            Authors Bureau with their publishing success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>Start Writing Now</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">Authors Bureau</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The world's largest AI-powered authors platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                <li><Link href="/authors" className="hover:text-foreground">Featured Authors</Link></li>
                <li><a href={getLoginUrl()} className="hover:text-foreground">Get Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Success Stories</a></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
            <p>&copy; 2026 Authors Bureau. All rights reserved. Empowering authors worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
