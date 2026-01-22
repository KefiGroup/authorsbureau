import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, PenTool, Rocket, TrendingUp, Plus, ArrowRight, Sparkles, Upload, User, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: books, isLoading: booksLoading } = trpc.book.getMyBooks.useQuery();
  const { data: authorProfile } = trpc.author.getProfile.useQuery();

  const stats = [
    {
      title: "Total Books",
      value: books?.length || 0,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "In Progress",
      value: books?.filter((b) => ["drafting", "editing"].includes(b.status)).length || 0,
      icon: PenTool,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Published",
      value: books?.filter((b) => b.status === "published").length || 0,
      icon: Rocket,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Marketing Active",
      value: 0,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const recentBooks = books?.slice(0, 5) || [];

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      idea: "bg-muted text-muted-foreground",
      outlining: "bg-blue-100 text-blue-700",
      drafting: "bg-yellow-100 text-yellow-700",
      editing: "bg-orange-100 text-orange-700",
      designed: "bg-purple-100 text-purple-700",
      marketing: "bg-green-100 text-green-700",
      published: "bg-primary/10 text-primary",
    };
    return colors[status] || "bg-muted text-muted-foreground";
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
              Here's an overview of your author journey
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/books">
              <Plus className="mr-2 h-5 w-5" />
              New Book
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Completion Prompt */}
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
                    Add your photo and bio to unlock the Book Wrap Designer and create professional back covers for your books.
                  </CardDescription>
                  <Link href="/profile">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary">
            <Link href="/ready-to-publish">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Ready to Publish
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">FEATURED</span>
                </CardTitle>
                <CardDescription>
                  Upload your manuscript and get a complete KDP-ready package with cover, formatting, and metadata
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/books">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>My Books</CardTitle>
                <CardDescription>
                  View and manage all your book projects in one place
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/writing-studio">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  AI Writing Studio
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">NEW</span>
                </CardTitle>
                <CardDescription>
                  Start your writing process with conversational AI blueprint builder
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
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
                <Link href="/books">
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
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium text-foreground">No books yet</p>
                  <p className="text-muted-foreground">
                    Start your author journey by creating your first book
                  </p>
                </div>
                <Button asChild>
                  <Link href="/books">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Book
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {book.wordCount || 0} words
                          {book.genre && ` • ${book.genre}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          book.status
                        )}`}
                      >
                        {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/writing/${book.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
