import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, FileText, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function WritingProject() {
  const [, params] = useRoute("/writing/:id");
  const bookId = params?.id ? parseInt(params.id) : null;

  const { data: author, isLoading: authorLoading } = trpc.author.getProfile.useQuery();
  const { data: book, isLoading: bookLoading, error } = trpc.book.getById.useQuery(
    { bookId: bookId! },
    { enabled: !!bookId }
  );

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
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <BookOpen className="w-4 h-4 mr-2" />
              Continue Writing
            </Button>
          </div>
        </div>

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
