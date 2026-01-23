import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, BookOpen, Trash2, ArrowRight } from "lucide-react";
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
  const { isAuthenticated } = useAuth();

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

  // Delete project mutation
  const deleteProject = trpc.blueprint.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Project deleted successfully");
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete project");
    },
  });

  const handleStartNew = () => {
    navigate("/start-writing");
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Writing Studio</h1>
        <p className="text-muted-foreground">
          Create and manage your book projects with AI assistance
        </p>
      </div>

      {/* Start New Book Button */}
      <Button onClick={handleStartNew} size="lg" className="mb-8">
        <Plus className="h-5 w-5 mr-2" />
        Start New Book
      </Button>

      {/* Projects List */}
      {projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const essentialData = project.essentialData as any;
            const title = project.workingTitle || essentialData?.workingTitle || "Untitled Project";
            const genre = project.primaryGenre || essentialData?.primaryGenre || "Unknown Genre";
            
            // Calculate progress
            let progressText = "Just started";
            const hasBlueprint = project.blueprintGenerated === true;
            // Note: outlineGenerated field doesn't exist yet, will be added later
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
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                    <Button
                      onClick={() => handleContinue(project.id, project.blueprintGenerated === true, false)}
                      className="w-full"
                    >
                      Continue Writing
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
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
