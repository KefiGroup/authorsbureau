import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, Plus, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Books() {
  const { data: books, isLoading } = trpc.book.getMyBooks.useQuery();
  const { data: authorProfile } = trpc.author.getProfile.useQuery();
  const createBookMutation = trpc.book.create.useMutation();
  const deleteBookMutation = trpc.book.delete.useMutation();
  const utils = trpc.useUtils();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    subtitle: "",
    genre: "",
    targetWordCount: 50000,
  });

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorProfile) {
      toast.error("Please create your author profile first");
      return;
    }

    if (!newBook.title.trim()) {
      toast.error("Please enter a book title");
      return;
    }

    try {
      await createBookMutation.mutateAsync(newBook);
      toast.success("Book created successfully!");
      setIsDialogOpen(false);
      setNewBook({ title: "", subtitle: "", genre: "", targetWordCount: 50000 });
      utils.book.getMyBooks.invalidate();
    } catch (error) {
      toast.error("Failed to create book. Please try again.");
    }
  };

  const handleDeleteBook = async (bookId: number, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteBookMutation.mutateAsync({ bookId });
      toast.success("Book deleted successfully");
      utils.book.getMyBooks.invalidate();
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

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

  const genres = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Science Fiction",
    "Fantasy",
    "Biography",
    "Self-Help",
    "Business",
    "History",
    "Other",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Books</h1>
            <p className="text-muted-foreground mt-2">
              Manage all your book projects in one place
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                New Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateBook}>
                <DialogHeader>
                  <DialogTitle>Create New Book</DialogTitle>
                  <DialogDescription>
                    Start your next bestseller. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your book title"
                      value={newBook.title}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      placeholder="Optional subtitle"
                      value={newBook.subtitle}
                      onChange={(e) => setNewBook({ ...newBook, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={newBook.genre}
                      onValueChange={(value) => setNewBook({ ...newBook, genre: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetWordCount">Target Word Count</Label>
                    <Input
                      id="targetWordCount"
                      type="number"
                      min="1000"
                      step="1000"
                      value={newBook.targetWordCount}
                      onChange={(e) =>
                        setNewBook({ ...newBook, targetWordCount: parseInt(e.target.value) || 50000 })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBookMutation.isPending}>
                    {createBookMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Book"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !books || books.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No books yet</h3>
                  <p className="text-muted-foreground">
                    Create your first book to start your author journey
                  </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Book
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        book.status
                      )}`}
                    >
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </span>
                  </div>
                  <CardTitle className="mt-4 line-clamp-2">{book.title}</CardTitle>
                  {book.subtitle && (
                    <CardDescription className="line-clamp-2">{book.subtitle}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {book.wordCount || 0} / {book.targetWordCount || 50000} words
                      </span>
                    </div>
                    {book.genre && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Genre</span>
                        <span className="font-medium text-foreground">{book.genre}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button asChild className="flex-1">
                        <Link href={`/writing/${book.id}`}>
                          Continue Writing <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      {book.status !== 'published' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          disabled={deleteBookMutation.isPending}
                          title="Delete book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
