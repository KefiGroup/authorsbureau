import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  ExternalLink,
  Award,
  Users,
  TrendingUp,
  Heart,
  Baby,
  DollarSign,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function FeaturedAuthors() {
  const authors = [
    {
      name: "Pauline Teo",
      penName: "Pauline Teo",
      tagline: "International Bestselling Author & SUCKcess Theory Pioneer",
      bio: "Pauline Teo is the creator of the SUCKcess Theory - the revolutionary framework that transforms disasters into breakthroughs. As an international bestselling author, she has helped thousands discover that we don't succeed in spite of our disasters, but because of them.",
      achievements: [
        "#1 Amazon Bestseller",
        "First author with AI-written forewords",
        "Built Singapore & Malaysia's largest financial education company",
        "Successfully led two ASX listings"
      ],
      books: [
        {
          title: "BE SUCKCESSFUL: We SUCK Before We Succeed",
          description: "The groundbreaking book that introduces the SUCKcess Theory - an 8-step framework for transforming life's disasters into your greatest breakthroughs.",
          amazonUrl: "https://www.amazon.com/dp/B09HPZL2JT",
          category: "Personal Development"
        },
        {
          title: "Value Investing for Women",
          description: "Empowering women to take control of their financial future through proven value investing strategies.",
          amazonUrl: "https://www.amazon.com/s?k=Pauline+Teo+Value+Investing",
          category: "Finance"
        },
        {
          title: "Invest Like Buffett: Value Investing for Parents",
          description: "Teaching parents how to build generational wealth using Warren Buffett's investment principles.",
          amazonUrl: "https://www.amazon.com/s?k=Pauline+Teo+Buffett",
          category: "Finance"
        },
        {
          title: "QiMen Manifestation: Unlock Ancient QiMen Secrets",
          description: "Ancient Chinese wisdom meets modern manifestation techniques for creating your desired reality.",
          amazonUrl: "https://www.amazon.com/s?k=Pauline+Teo+QiMen",
          category: "Spirituality"
        }
      ],
      website: "https://www.besuckcessful.com",
      icon: Sparkles,
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Felicia Tan",
      penName: "Felicia Tan",
      tagline: "Motherhood Journey Author & Fertility Advocate",
      bio: "Felicia Tan is an inspiring author who turned her decade-long journey to motherhood into a powerful trilogy that has touched thousands of hearts. Through her raw, honest storytelling about IVF, pregnancy loss, and ultimate triumph, she offers hope to women facing similar challenges.",
      achievements: [
        "Published 3-book motherhood trilogy",
        "10-year journey from heartbreak to hope",
        "Founder of Art of Life Circle",
        "Keynote speaker on fertility and faith"
      ],
      books: [
        {
          title: "To Baby With Love",
          description: "A heartfelt journey through IUI and IVF, coping with premature birth loss, and finding the courage to not give up on the dream of motherhood.",
          amazonUrl: "https://www.amazon.com/s?k=Felicia+Tan+To+Baby+With+Love",
          category: "Memoir"
        },
        {
          title: "Lost And Found",
          description: "The story of twin sons, Cervical Incompetence, and finding faith, peace, and hope through unimaginable loss. Features expert contributions and real stories from other mothers.",
          amazonUrl: "https://www.amazon.com/s?k=Felicia+Tan+Lost+And+Found",
          category: "Memoir"
        },
        {
          title: "A Gift From Heaven",
          description: "A miracle pregnancy after 10 years of marriage - conceived naturally after multiple losses. A mother's tale of faith, perseverance, and being rewarded with a rainbow baby.",
          amazonUrl: "https://www.amazon.com/s?k=Felicia+Tan+Gift+From+Heaven",
          category: "Memoir"
        }
      ],
      website: "https://www.artoflifecircle.com",
      icon: Heart,
      color: "from-pink-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="mb-4" variant="secondary">
            <Award className="w-4 h-4 mr-2" />
            Featured SUCKcess Authors
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Featured Authors
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ordinary people who transformed their life's disasters into published bestsellers using the SUCKcess Theory framework
          </p>
        </div>
      </section>

      {/* Authors Section */}
      <section className="container py-8 space-y-16">
        {authors.map((author, index) => (
          <div key={index} className="max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${author.color} flex-shrink-0`}>
                    <author.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <CardTitle className="text-3xl mb-2">{author.name}</CardTitle>
                      <CardDescription className="text-lg">{author.tagline}</CardDescription>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{author.bio}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {author.achievements.map((achievement, i) => (
                        <Badge key={i} variant="secondary">
                          <Award className="w-3 h-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button asChild variant="outline" size="sm">
                        <a href={author.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Published Books ({author.books.length})</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {author.books.map((book, bookIndex) => (
                      <Card key={bookIndex} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2">{book.category}</Badge>
                              <CardTitle className="text-lg leading-tight">{book.title}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{book.description}</p>
                          <Button asChild size="sm" className="w-full">
                            <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Amazon
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 max-w-4xl mx-auto">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Story Could Be Next
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join Pauline, Felicia, and hundreds of others who transformed their disasters into published SUCKcess stories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/discover-your-story">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Discover Your SUCKcess Story
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/writing-studio">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Writing Your Book
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
