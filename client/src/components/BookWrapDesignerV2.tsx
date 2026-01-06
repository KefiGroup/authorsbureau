import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Layout, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BookWrapDesignerV2Props {
  bookTitle: string;
  authorName: string;
  authorBio: string;
  authorPhotoUrl?: string;
  bookDescription: string;
  frontCoverUrl?: string;
  pageCount: number;
  onWrapGenerated: (wrapUrl: string) => void;
}

export function BookWrapDesignerV2({
  bookTitle,
  authorName,
  authorBio: initialBio,
  authorPhotoUrl,
  bookDescription: initialDescription,
  frontCoverUrl,
  pageCount,
  onWrapGenerated,
}: BookWrapDesignerV2Props) {
  const [selectedOption, setSelectedOption] = useState<"upload" | "template" | "ai">("upload");
  const [uploadedWrapUrl, setUploadedWrapUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(11);
  const [authorBio, setAuthorBio] = useState(initialBio);
  const [bookDescription, setBookDescription] = useState(initialDescription);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate spine width (KDP formula: page count * 0.002252 for cream paper)
  const spineWidth = (pageCount * 0.002252).toFixed(3);
  const totalWidth = (6 + 6 + parseFloat(spineWidth) + 0.25).toFixed(3); // front + back + spine + bleed
  const totalHeight = 9.25; // 9" + 0.125" bleed top + 0.125" bleed bottom

  const uploadWrapMutation = trpc.covers.uploadCustomCover.useMutation({
    onSuccess: (result) => {
      setUploadedWrapUrl(result.url);
      onWrapGenerated(result.url);
      toast.success("Book wrap uploaded successfully!");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const generateWrapMutation = trpc.covers.generateWrap.useMutation({
    onSuccess: (result) => {
      onWrapGenerated(result.wrapUrl);
      toast.success("Book wrap generated successfully!");
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/) && file.type !== "application/pdf") {
      toast.error("Please upload a PNG, JPG, or PDF file");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setIsUploading(true);
    toast.info("Uploading book wrap...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await uploadWrapMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload book wrap");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Wrap Designer</CardTitle>
          <CardDescription>
            Choose how you want to create your book wrap for Amazon KDP paperback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedOption} onValueChange={(v) => setSelectedOption(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your Own
              </TabsTrigger>
              <TabsTrigger value="template">
                <Layout className="w-4 h-4 mr-2" />
                Use Template
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Generated
              </TabsTrigger>
            </TabsList>

            {/* Option 1: Upload Your Own */}
            <TabsContent value="upload" className="space-y-4">
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Complete Book Wrap</CardTitle>
                  <CardDescription>
                    Upload a print-ready book wrap you designed in Photoshop, Canva, or any design tool
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Required Dimensions</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• <strong>Total Size:</strong> {totalWidth}" × {totalHeight}" (with bleed)</p>
                      <p>• <strong>Spine Width:</strong> {spineWidth}" ({pageCount} pages, cream paper)</p>
                      <p>• <strong>Format:</strong> PNG, JPG, or PDF</p>
                      <p>• <strong>Resolution:</strong> 300 DPI minimum</p>
                      <p>• <strong>Max File Size:</strong> 50MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wrap-upload">Upload Book Wrap</Label>
                    <Input
                      id="wrap-upload"
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </div>

                  {uploadedWrapUrl && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border rounded-lg p-4 bg-muted">
                        <img
                          src={uploadedWrapUrl}
                          alt="Uploaded book wrap"
                          className="w-full h-auto"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = uploadedWrapUrl;
                          link.download = `${bookTitle.replace(/[^a-z0-9]/gi, "_")}_book_wrap.png`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Book Wrap
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Option 2: Use Template */}
            <TabsContent value="template" className="space-y-4">
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Choose a Template</CardTitle>
                  <CardDescription>
                    Select a professional template and customize it with your book's information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Style</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {["modern", "classic", "minimalist", "bold"].map((template) => (
                        <button
                          key={template}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 border-2 rounded-lg text-left transition-colors ${
                            selectedTemplate === template
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium capitalize">{template}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {template === "modern" && "Clean layout with photo emphasis"}
                            {template === "classic" && "Traditional book design"}
                            {template === "minimalist" && "Simple and elegant"}
                            {template === "bold" && "Eye-catching and vibrant"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bg-color">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bg-color"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="text-color">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="text-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size: {fontSize}pt</Label>
                    <Input
                      id="font-size"
                      type="range"
                      min="8"
                      max="14"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author-bio">Author Bio</Label>
                    <Textarea
                      id="author-bio"
                      value={authorBio}
                      onChange={(e) => setAuthorBio(e.target.value)}
                      rows={4}
                      placeholder="Enter author biography..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="book-desc">Book Description</Label>
                    <Textarea
                      id="book-desc"
                      value={bookDescription}
                      onChange={(e) => setBookDescription(e.target.value)}
                      rows={6}
                      placeholder="Enter book description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Live Preview</Label>
                    <div
                      className="border rounded-lg p-6 min-h-[400px]"
                      style={{
                        backgroundColor,
                        color: textColor,
                        fontSize: `${fontSize}pt`,
                      }}
                    >
                      <div className="flex gap-4">
                        {authorPhotoUrl && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={authorPhotoUrl}
                              alt={authorName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold">{authorName}</p>
                          <p className="text-sm leading-relaxed">{authorBio}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <p className="leading-relaxed">{bookDescription}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      if (!frontCoverUrl) {
                        toast.error("Please upload a front cover first");
                        return;
                      }
                      toast.info("Generating book wrap...");
                      generateWrapMutation.mutate({
                        frontCoverUrl,
                        bookTitle,
                        authorName,
                        authorPhotoUrl,
                        authorBio,
                        bookDescription,
                        backgroundColor,
                        textColor,
                        fontSize,
                        pageCount,
                        template: selectedTemplate as "modern" | "classic" | "minimalist" | "bold",
                      });
                    }}
                    disabled={generateWrapMutation.isPending || !frontCoverUrl}
                  >
                    {generateWrapMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate Book Wrap
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Option 3: AI-Generated */}
            <TabsContent value="ai" className="space-y-4">
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">AI-Generated Design</CardTitle>
                  <CardDescription>
                    Let AI analyze your book and create a professional book wrap design
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
                    <p className="text-muted-foreground mb-6">
                      AI will analyze your book's genre, cover design, and content to create
                      a professionally designed book wrap that matches your book's style.
                    </p>
                    <Button size="lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Design
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
