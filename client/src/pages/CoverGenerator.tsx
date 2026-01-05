import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download, Trash2, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CoverGenerator() {
  const { user } = useAuth();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [coverForm, setCoverForm] = useState({
    bookTitle: "",
    authorName: user?.name || "",
    genre: "",
    style: "professional",
    customPrompt: "",
  });
  const [generatedCovers, setGeneratedCovers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("generate");

  // Queries
  const { data: booksData } = trpc.book.getMyBooks.useQuery();
  const { data: coversData, refetch: refetchCovers } = trpc.covers.getBookCovers.useQuery(
    { bookId: selectedBookId! },
    { enabled: !!selectedBookId }
  );

  // Mutations
  const generateCover = trpc.covers.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedCovers([...generatedCovers, data.cover]);
      toast.success("Book cover generated successfully!");
      refetchCovers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateVariations = trpc.covers.generateVariations.useMutation({
    onSuccess: (data) => {
      setGeneratedCovers([...generatedCovers, ...data]);
      toast.success(`Generated ${data.length} cover variations!`);
      refetchCovers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const setActiveCover = trpc.covers.setActiveCover.useMutation({
    onSuccess: () => {
      toast.success("Cover set as active!");
      refetchCovers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCover = trpc.covers.deleteCover.useMutation({
    onSuccess: () => {
      toast.success("Cover deleted successfully!");
      refetchCovers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerateCover = () => {
    if (!selectedBookId) {
      toast.error("Please select a book first");
      return;
    }

    if (!coverForm.bookTitle || !coverForm.authorName || !coverForm.genre) {
      toast.error("Please fill in all required fields");
      return;
    }

    generateCover.mutate({
      bookId: selectedBookId,
      ...coverForm,
    });
  };

  const handleGenerateVariations = () => {
    if (!selectedBookId) {
      toast.error("Please select a book first");
      return;
    }

    if (!coverForm.bookTitle || !coverForm.authorName || !coverForm.genre) {
      toast.error("Please fill in all required fields");
      return;
    }

    generateVariations.mutate({
      bookTitle: coverForm.bookTitle,
      authorName: coverForm.authorName,
      genre: coverForm.genre,
      count: 3,
    });
  };

  const handleBookSelect = (bookId: string) => {
    const id = parseInt(bookId);
    setSelectedBookId(id);
    
    const book = booksData?.find(b => b.id === id);
    if (book) {
      setCoverForm({
        ...coverForm,
        bookTitle: book.title,
        genre: book.genre || "",
      });
    }
  };

  const genres = [
    "Business & Entrepreneurship",
    "Self-Help & Personal Development",
    "Investing & Finance",
    "Health & Wellness",
    "Parenting & Family",
    "AI & Technology",
    "Memoir & Biography",
  ];

  const styles = [
    { value: "professional", label: "Professional" },
    { value: "artistic", label: "Artistic" },
    { value: "minimalist", label: "Minimalist" },
    { value: "bold", label: "Bold" },
    { value: "elegant", label: "Elegant" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Book Cover Generator</h1>
          <p className="text-lg text-muted-foreground">
            Create stunning, professional book covers in seconds with AI-powered design.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Covers
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Cover Gallery
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Details</CardTitle>
                <CardDescription>
                  Provide your book information to generate a professional cover design.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-select">Select Book *</Label>
                  <Select onValueChange={handleBookSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a book" />
                    </SelectTrigger>
                    <SelectContent>
                      {booksData?.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="book-title">Book Title *</Label>
                    <Input
                      id="book-title"
                      placeholder="Your book title"
                      value={coverForm.bookTitle}
                      onChange={(e) =>
                        setCoverForm({ ...coverForm, bookTitle: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author-name">Author Name *</Label>
                    <Input
                      id="author-name"
                      placeholder="Your name"
                      value={coverForm.authorName}
                      onChange={(e) =>
                        setCoverForm({ ...coverForm, authorName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre *</Label>
                    <Select
                      value={coverForm.genre}
                      onValueChange={(value) =>
                        setCoverForm({ ...coverForm, genre: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
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
                    <Label htmlFor="style">Design Style</Label>
                    <Select
                      value={coverForm.style}
                      onValueChange={(value) =>
                        setCoverForm({ ...coverForm, style: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="Add specific design elements, colors, or themes you want..."
                    rows={3}
                    value={coverForm.customPrompt}
                    onChange={(e) =>
                      setCoverForm({ ...coverForm, customPrompt: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleGenerateCover}
                    disabled={generateCover.isPending}
                    className="flex-1"
                  >
                    {generateCover.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Cover...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Single Cover
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateVariations}
                    disabled={generateVariations.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {generateVariations.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Variations...
                      </>
                    ) : (
                      "Generate 3 Variations"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Generated Covers */}
            {generatedCovers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Covers</CardTitle>
                  <CardDescription>
                    Click on a cover to set it as your book's active cover.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {generatedCovers.map((cover, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="relative group">
                          <img
                            src={cover.coverUrl || ""}
                            alt={`Cover ${idx + 1}`}
                            className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
                            onClick={() =>
                              selectedBookId &&
                              setActiveCover.mutate({
                                bookId: selectedBookId,
                                coverId: cover.id,
                              })
                            }
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => deleteCover.mutate({ coverId: cover.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Badge>{cover.designStyle}</Badge>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {cover.coverPrompt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            {!selectedBookId ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a book to view its covers</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a book from the Generate tab first
                  </p>
                </CardContent>
              </Card>
            ) : coversData?.covers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No covers yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate your first book cover to get started
                  </p>
                  <Button onClick={() => setActiveTab("generate")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Cover
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coversData?.covers.map((cover) => (
                  <Card key={cover.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={cover.coverUrl || ""}
                        alt="Book cover"
                        className="w-full aspect-[2/3] object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() =>
                            setActiveCover.mutate({
                              bookId: selectedBookId,
                              coverId: cover.id,
                            })
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteCover.mutate({ coverId: cover.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <Badge className="mb-2">{cover.designStyle}</Badge>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {cover.coverPrompt}
                      </p>
                      <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                        <a href={cover.coverUrl || ""} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
