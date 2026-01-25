import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { BookOpen, PenTool, Rocket, TrendingUp, Plus, ArrowRight, Sparkles, AlertCircle, Clock, Trash2 } from "lucide-react";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";

export default function Dashboard() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; title: string; type: 'book' | 'blueprint' } | null>(null);
  
  const { data: books, isLoading: booksLoading } = trpc.book.getMyBooks.useQuery();
  const { data: blueprints, isLoading: blueprintsLoading } = trpc.blueprint.getUserProjects.useQuery();
  const { data: authorProfile } = trpc.author.getProfile.useQuery();
  
  const utils = trpc.useUtils();
  const deleteBook = trpc.book.delete.useMutation({
    onSuccess: () => {
      toast.success("Book deleted successfully");
      utils.book.getMyBooks.invalidate();
      utils.blueprint.getUserProjects.invalidate(); // Also invalidate blueprints since they're linked to books
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete book: " + error.message);
    },
  });
  
  const deleteBlueprint = trpc.blueprint.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully");
      utils.blueprint.getUserProjects.invalidate();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete project: " + error.message);
    },
  });
  
  const handleDeleteClick = (e: React.MouseEvent, project: { id: number; title: string; type: 'book' | 'blueprint' }) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    
    if (projectToDelete.type === 'book') {
      deleteBook.mutate({ bookId: projectToDelete.id });
    } else {
      deleteBlueprint.mutate({ blueprintId: projectToDelete.id });
    }
  };

  // Define calculateProgress before using it
  const calculateProgress = (book: any) => {
    // Progress calculation based on Publishing Studio workflow completion
    // Workflow steps: Upload (12.5%) → Analysis (25%) → Review & Edit (37.5%) → Profile Check (50%) → Cover Design (62.5%) → KDP Optimization (75%) → Amazon Preview (87.5%) → Export (100%)
    
    // If book has publishingProgress field, use it
    if (book.publishingProgress !== undefined && book.publishingProgress !== null) {
      return Math.round(book.publishingProgress);
    }
    
    // Otherwise calculate based on status
    const statusProgress: Record<string, number> = {
      'ideation': 0,
      'outlining': 25,
      'drafting': 50,  // Manuscript complete = halfway through publishing workflow
      'editing': 62,
      'designed': 75,
      'marketing': 87,
      'published': 100,
    };
    
    return statusProgress[book.status] || 0;
  };
  
  // Merge books and blueprints into unified projects
  const projectsMap = new Map<string, any>();
  
  // Add blueprints first
  blueprints?.forEach(bp => {
    const key = (bp.workingTitle || 'Untitled Project').toLowerCase();
    projectsMap.set(key, {
      id: bp.id,
      title: bp.workingTitle || 'Untitled Project',
      genre: bp.primaryGenre,
      updatedAt: bp.updatedAt,
      blueprint: bp,
      book: null,
      writingProgress: bp.manuscriptCompleted ? 100 : (bp.manuscriptStarted ? 50 : 25),
      publishingProgress: 0,
    });
  });
  
  // Merge books with matching blueprints
  books?.forEach(book => {
    const key = book.title.toLowerCase();
    const existing = projectsMap.get(key);
    
    if (existing) {
      // Merge with existing blueprint
      existing.book = book;
      existing.writingProgress = 100; // Manuscript complete
      existing.publishingProgress = calculateProgress(book);
      existing.updatedAt = new Date(book.updatedAt) > new Date(existing.updatedAt) ? book.updatedAt : existing.updatedAt;
    } else {
      // Book without blueprint
      projectsMap.set(key, {
        id: book.id,
        title: book.title,
        genre: book.genre,
        updatedAt: book.updatedAt,
        blueprint: null,
        book: book,
        writingProgress: 100,
        publishingProgress: calculateProgress(book),
      });
    }
  });
  
  const allProjects = Array.from(projectsMap.values())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());


  const stats = [
    {
      title: "Total Books",
      value: allProjects.length,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All projects",
    },
    {
      title: "In Progress",
      value: allProjects.filter((p) => {
        const overallProgress = (p.writingProgress + p.publishingProgress) / 2;
        return overallProgress < 100;
      }).length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Active writing",
    },
    {
      title: "Published",
      value: allProjects.filter((p) => p.publishingProgress === 100).length,
      icon: Rocket,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Live on Amazon",
    },
    {
      title: "Total Words",
      value: allProjects.reduce((sum, p) => sum + (p.book?.wordCount || 0), 0).toLocaleString(),
      icon: PenTool,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Words written",
    },
  ];

  const recentProjects = allProjects.slice(0, 5);

  const getStatusInfo = (status: string, project?: any) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      idea: { label: "Blueprint Questions", color: "bg-gray-100 text-gray-700", icon: "📋" },
      outlining: { label: "Writing Manuscript", color: "bg-blue-100 text-blue-700", icon: "✍️" },
      drafting: { label: "Manuscript Complete", color: "bg-amber-100 text-amber-700", icon: "✅" },
      editing: { label: "Editing", color: "bg-orange-100 text-orange-700", icon: "✏️" },
      designed: { label: "Designed", color: "bg-purple-100 text-purple-700", icon: "🎨" },
      marketing: { label: "Marketing", color: "bg-green-100 text-green-700", icon: "📢" },
      published: { label: "Published", color: "bg-green-100 text-green-700", icon: "🚀" },
    };
    return statusMap[status] || { label: "Unknown", color: "bg-gray-100 text-gray-700", icon: "❓" };
  };

  // calculateProgress function moved earlier in the file (line 73)

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
            {(booksLoading || blueprintsLoading) ? (
              <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
            ) : recentProjects.length === 0 ? (
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
                {recentProjects.map((project) => {
                  const overallProgress = Math.round((project.writingProgress + project.publishingProgress) / 2);
                  const statusInfo = project.book ? getStatusInfo(project.book.status) : getStatusInfo('outlining');
                  const projectUrl = project.book ? `/ready-to-publish?bookId=${project.book.id}` : `/start-writing?blueprintId=${project.id}`;
                  
                  return (
                    <div key={project.id} className="relative">
                      <Link
                        href={projectUrl}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {project.wordCount?.toLocaleString() || 0} words
                                {project.genre && ` • ${project.genre}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}
                              >
                                {statusInfo.icon} {statusInfo.label}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => handleDeleteClick(e, project)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Overall Progress</span>
                              <span>{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-2" />
                            
                            {/* Studio Breakdown */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <span>✍️ Writing:</span>
                                <span className="font-medium">{project.writingProgress}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>📚 Publishing:</span>
                                <span className="font-medium">{project.publishingProgress}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {projectToDelete?.type === 'book' ? 'Book' : 'Project'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{projectToDelete?.title}"</strong>?
              <br />
              <br />
              <span className="text-destructive font-semibold">
                ⚠️ Warning: Once deleted, this {projectToDelete?.type === 'book' ? 'book' : 'project'} cannot be retrieved.
              </span>
              <br />
              All chapters, manuscripts, and related data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
