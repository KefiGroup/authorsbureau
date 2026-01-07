import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function MyBooks() {
  const [, setLocation] = useLocation();
  const { data: books, isLoading } = trpc.book.getMyBooks.useQuery();

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
            <p className="text-muted-foreground mt-2">
              Manage your book projects and publishing workflows
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setLocation("/ready-to-publish")}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            New Book Project
          </Button>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : books && books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setLocation(`/ready-to-publish?bookId=${book.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate group-hover:text-primary transition-colors">
                        {book.title || "Untitled Book"}
                      </CardTitle>
                      {book.subtitle && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {book.subtitle}
                        </CardDescription>
                      )}
                    </div>
                    <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {book.status === "published" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            Published
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-600" />
                          <Badge variant="outline" className="border-amber-600 text-amber-600">
                            In Progress
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      {book.genre && (
                        <p>
                          <span className="font-medium">Genre:</span> {book.genre}
                        </p>
                      )}
                      {book.wordCount && (
                        <p>
                          <span className="font-medium">Word Count:</span>{" "}
                          {book.wordCount.toLocaleString()}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(book.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-primary/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/ready-to-publish?bookId=${book.id}`);
                      }}
                    >
                      <span>Continue Workflow</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No books yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start your publishing journey by creating your first book project
              </p>
              <Button
                size="lg"
                onClick={() => setLocation("/ready-to-publish")}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Book
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
