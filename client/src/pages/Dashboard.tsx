import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { BookOpen, PenTool, Rocket, TrendingUp, Plus, ArrowRight, Sparkles, AlertCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: books, isLoading: booksLoading } = trpc.book.getMyBooks.useQuery();
  const { data: authorProfile } = trpc.author.getProfile.useQuery();

  const stats = [
    {
      title: "Total Books",
      value: books?.length || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All projects",
    },
    {
      title: "In Progress",
      value: books?.filter((b) => ["drafting", "editing"].includes(b.status)).length || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Active writing",
    },
    {
      title: "Published",
      value: books?.filter((b) => b.status === "published").length || 0,
      icon: Rocket,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Live on Amazon",
    },
    {
      title: "Total Words",
      value: books?.reduce((sum, b) => sum + (b.wordCount || 0), 0).toLocaleString() || "0",
      icon: PenTool,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Words written",
    },
  ];

  const recentBooks = books?.slice(0, 5) || [];

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      idea: { label: "Planning", color: "bg-gray-100 text-gray-700", icon: "💡" },
      outlining: { label: "Outlining", color: "bg-blue-100 text-blue-700", icon: "📝" },
      drafting: { label: "Drafting", color: "bg-amber-100 text-amber-700", icon: "✍️" },
      editing: { label: "Editing", color: "bg-orange-100 text-orange-700", icon: "✏️" },
      designed: { label: "Designed", color: "bg-purple-100 text-purple-700", icon: "🎨" },
      marketing: { label: "Marketing", color: "bg-green-100 text-green-700", icon: "📢" },
      published: { label: "Published", color: "bg-green-100 text-green-700", icon: "🚀" },
    };
    return statusMap[status] || { label: "Unknown", color: "bg-gray-100 text-gray-700", icon: "❓" };
  };

  const calculateProgress = (book: any) => {
    // Simple progress calculation based on word count
    const targetWords = 50000; // Average book length
    const progress = Math.min((book.wordCount / targetWords) * 100, 100);
    return Math.round(progress);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {authorProfile?.penName || "Author"}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's your author dashboard overview
            </p>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <Link href="/ai-writing-studio">
              <Plus className="mr-2 h-5 w-5" />
              Start New Book
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Completion Alert */}
        {authorProfile && !authorProfile.avatarUrl && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-amber-900 dark:text-amber-100 mb-2">
                    Complete Your Author Profile
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300 mb-4">
                    Add your photo and bio to unlock professional book covers and author pages.
                  </CardDescription>
                  <Link href="/profile">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                      Complete Profile Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* 3 Studio Cards */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Studios</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <Link href="/ai-writing-studio">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    AI Writing Studio
                  </CardTitle>
                  <CardDescription>
                    Create books with AI-powered blueprint builder and chapter generation
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <Link href="/ai-publishing-studio">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Rocket className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    AI Publishing Studio
                  </CardTitle>
                  <CardDescription>
                    8-step workflow: Upload manuscript → AI analysis → Cover design → KDP optimization → Export
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <Link href="/ai-marketing-studio">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    AI Marketing Studio
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">NEW</span>
                  </CardTitle>
                  <CardDescription>
                    Promote books with AI-powered marketing campaigns and analytics
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Books */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Books</CardTitle>
                <CardDescription>Your latest book projects</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/ai-writing-studio">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading books...</div>
            ) : recentBooks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">No books yet</p>
                  <p className="text-muted-foreground">
                    Start your author journey by creating your first book
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href="/ai-writing-studio">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Book
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBooks.map((book) => {
                  const statusInfo = getStatusInfo(book.status);
                  const progress = calculateProgress(book);
                  
                  return (
                    <div
                      key={book.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {book.wordCount?.toLocaleString() || 0} words
                              {book.genre && ` • ${book.genre}`}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                        <Link href={`/ai-writing-studio`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
