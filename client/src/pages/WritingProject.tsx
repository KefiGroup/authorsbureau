import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, FileText, Download, ArrowLeft, Upload, FileUp } from "lucide-react";
// import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function WritingProject() {
  const [, params] = useRoute("/writing/:id");
  const bookId = params?.id ? parseInt(params.id) : null;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: author, isLoading: authorLoading } = trpc.author.getProfile.useQuery();
  const { data: book, isLoading: bookLoading, error, refetch } = trpc.book.getById.useQuery(
    { bookId: bookId! },
    { enabled: !!bookId }
  );
  
  const updateBookMutation = trpc.book.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsUploading(false);
      setUploadError(null);
    },
    onError: (error) => {
      setUploadError(error.message);
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      
      await updateBookMutation.mutateAsync({
        bookId: book!.id,
        content: text,
        wordCount,
        status: 'drafting',
      });
    } catch (error) {
      setUploadError('Failed to upload manuscript. Please try again.');
      setIsUploading(false);
    }
  };

  const isLoading = authorLoading || bookLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !book) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Book Not Found</CardTitle>
              <CardDescription>
                The book you're looking for doesn't exist or you don't have access to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">{book.title || "Untitled Book"}</h1>
            <p className="text-muted-foreground mt-2">
              {book.genre} • {book.status} • {book.wordCount || 0} words
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                alert("📦 Export Feature\n\nThis will download a complete publishing package containing:\n\n• Your manuscript (DOCX & PDF)\n• Book cover image (high-resolution PNG)\n• Amazon KDP metadata (categories, keywords, description)\n• ISBN information\n\nNote: This feature is currently available in the 'Ready to Publish' workflow.");
              }}
              title="Download your complete publishing package"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/writing-studio">
                <BookOpen className="w-4 h-4 mr-2" />
                Continue Writing
              </Link>
            </Button>
          </div>
        </div>

        {/* Upload Manuscript CTA - Show when no content */}
        {(!book.content || book.wordCount === 0) && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileUp className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-2">Upload Your Manuscript</h3>
                  <p className="text-muted-foreground mb-4">
                    Have an existing manuscript? Upload it now to get started with AI-powered optimization, cover design, and Amazon KDP publishing.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label htmlFor="manuscript-upload">
                      <Button disabled={isUploading} size="lg" className="cursor-pointer">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Manuscript
                          </>
                        )}
                      </Button>
                    </label>
                    <input
                      id="manuscript-upload"
                      type="file"
                      accept=".txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/writing-studio">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Or Start Writing
                      </Link>
                    </Button>
                  </div>
                  {uploadError && (
                    <p className="text-sm text-destructive mt-3">{uploadError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Supported formats: TXT, DOC, DOCX • Max size: 10MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Book Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Book Progress</CardTitle>
            <CardDescription>
              Track your writing journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold capitalize">{book.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="text-2xl font-bold">{book.wordCount?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-2xl font-bold">50,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book Details */}
        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {book.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-lg">{book.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        {book.content && (
          <Card>
            <CardHeader>
              <CardTitle>Book Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{book.content.substring(0, 1000)}...</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              What would you like to do next?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-6 justify-start" asChild>
              <Link href={`/writing-studio/day-1?bookId=${book.id}`}>
                <div className="text-left">
                  <p className="font-semibold">Continue Day 1</p>
                  <p className="text-sm text-muted-foreground">Work on your SUCKcess story</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 justify-start" asChild>
              <Link href={`/writing-studio/day-2?bookId=${book.id}`}>
                <div className="text-left">
                  <p className="font-semibold">Continue Day 2</p>
                  <p className="text-sm text-muted-foreground">Write your chapters</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 justify-start" asChild>
              <Link href="/amazon-publishing">
                <div className="text-left">
                  <p className="font-semibold">Amazon Publishing</p>
                  <p className="text-sm text-muted-foreground">Optimize for KDP</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 justify-start" asChild>
              <Link href="/cover-generator">
                <div className="text-left">
                  <p className="font-semibold">Generate Cover</p>
                  <p className="text-sm text-muted-foreground">Create book cover with AI</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
