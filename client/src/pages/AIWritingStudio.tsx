import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, BookOpen, Trash2, ArrowRight, Rocket, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
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
import DashboardLayout from "@/components/DashboardLayout";

export default function AIWritingStudio() {
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [showBlueprintForm, setShowBlueprintForm] = useState(false);
  const { isAuthenticated } = useAuth();

  // Blueprint form state
  const [workingTitle, setWorkingTitle] = useState("");
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [bookDescription, setBookDescription] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated]);

  // Get all user's projects
  const { data: projects, isLoading, refetch } = trpc.blueprint.getUserProjects.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Get all books to check word counts
  const { data: books } = trpc.book.getMyBooks.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();
  
  // Delete project mutation
  const deleteProject = trpc.blueprint.delete.useMutation({
    onSuccess: () => {
      utils.blueprint.getUserProjects.invalidate();
      utils.book.getMyBooks.invalidate(); // Also invalidate books since they're linked to blueprints
      toast.success("Project deleted successfully");
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete project");
    },
  });

  // Create blueprint mutation
  const createBlueprint = trpc.blueprint.create.useMutation({
    onSuccess: (data) => {
      toast.success("Blueprint created successfully!");
      setShowBlueprintForm(false);
      // Reset form
      setWorkingTitle("");
      setPrimaryGenre("");
      setTargetAudience("");
      setBookDescription("");
      refetch();
      // Navigate to blueprint process
      navigate(`/start-writing?blueprintId=${data.blueprintId}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create blueprint");
    },
  });

  const handleStartNew = () => {
    setShowBlueprintForm(true);
  };

  const handleCancelForm = () => {
    setShowBlueprintForm(false);
    setWorkingTitle("");
    setPrimaryGenre("");
    setTargetAudience("");
    setBookDescription("");
  };

  const handleSubmitBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workingTitle.trim()) {
      toast.error("Please enter a working title");
      return;
    }
    if (!primaryGenre.trim()) {
      toast.error("Please enter a genre");
      return;
    }

    createBlueprint.mutate({
      projectType: "novel",
      workingTitle: workingTitle.trim(),
    });
  };

  const handleContinue = (blueprintId: number, blueprintGenerated: boolean, outlineGenerated: boolean) => {
    // Determine where to navigate based on progress
    if (!blueprintGenerated) {
      navigate(`/start-writing?blueprintId=${blueprintId}`);
    } else if (!outlineGenerated) {
      navigate(`/review-outline/${blueprintId}`);
    } else {
      navigate(`/generate-manuscript/${blueprintId}`);
    }
  };

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject.mutate({ blueprintId: projectToDelete });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Writing Studio</h1>
          <p className="text-muted-foreground">
            Create and manage your book projects with AI assistance
          </p>
        </div>

        {/* Blueprint Creation Form */}
        {showBlueprintForm && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Book Project</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Tell us about your book idea to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBlueprint} className="space-y-4">
                <div>
                  <Label htmlFor="workingTitle">Working Title *</Label>
                  <Input
                    id="workingTitle"
                    value={workingTitle}
                    onChange={(e) => setWorkingTitle(e.target.value)}
                    placeholder="Enter your book's working title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="primaryGenre">Genre *</Label>
                  <Input
                    id="primaryGenre"
                    value={primaryGenre}
                    onChange={(e) => setPrimaryGenre(e.target.value)}
                    placeholder="e.g., Fiction, Non-Fiction, Self-Help, Romance"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Who is this book for?"
                  />
                </div>

                <div>
                  <Label htmlFor="bookDescription">Book Description</Label>
                  <Textarea
                    id="bookDescription"
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    placeholder="Brief description of your book idea..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createBlueprint.isPending}
                  >
                    {createBlueprint.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List or Empty State */}
        {projects && projects.length > 0 ? (
          <>
            {!showBlueprintForm && (
              <Button onClick={handleStartNew} size="lg" className="mb-6">
                <Plus className="h-5 w-5 mr-2" />
                Start New Book
              </Button>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const essentialData = project.essentialData as any;
                const title = project.workingTitle || essentialData?.workingTitle || "Untitled Project";
                const genre = project.primaryGenre || essentialData?.primaryGenre || "Unknown Genre";
                
                // Calculate word count from project data
                const wordCount = 0; // TODO: Get word count from book data
                const isReadyToPublish = wordCount >= 40000;

                // Calculate progress
                let progressText = "Just started";
                const hasBlueprint = project.blueprintGenerated === true;
                if (hasBlueprint) {
                  progressText = "Blueprint complete";
                }

                return (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <BookOpen className="h-8 w-8 text-primary mb-2" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(project.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="line-clamp-2">{title}</CardTitle>
                      <CardDescription>{genre}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          <div className="font-medium text-foreground mb-1">Progress</div>
                          {progressText}
                        </div>
                        
                        {wordCount > 0 && (
                          <div className="text-sm">
                            {isReadyToPublish ? (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="font-medium">{wordCount.toLocaleString()} words - Ready to publish!</span>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                {wordCount.toLocaleString()} words written
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {isReadyToPublish ? (
                            <Button
                              onClick={() => navigate("/ai-publishing-studio")}
                              className="flex-1"
                            >
                              <Rocket className="h-4 w-4 mr-2" />
                              Continue to Publishing
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleContinue(project.id, project.blueprintGenerated || false, false)}
                              className="flex-1"
                            >
                              Continue Writing
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          !showBlueprintForm && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your first book project with AI assistance
                </p>
                <Button onClick={handleStartNew} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Start Your First Book
                </Button>
              </CardContent>
            </Card>
          )
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your book project
                including all chapters, outlines, and progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
