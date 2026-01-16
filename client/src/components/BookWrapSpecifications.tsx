import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Upload, ExternalLink, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BookWrapSpecificationsProps {
  bookId: number;
  bookTitle: string;
  bookSubtitle?: string;
  authorName: string;
  bookDescription: string;
  authorBio: string;
  isbn?: string;
  pageCount: number;
  onUploadComplete: (wrapUrl: string) => void;
}

export function BookWrapSpecifications({
  bookId,
  bookTitle,
  bookSubtitle,
  authorName,
  bookDescription,
  authorBio,
  isbn,
  pageCount,
  onUploadComplete,
}: BookWrapSpecificationsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Editable state for each field
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState(bookTitle);
  const [editedSubtitle, setEditedSubtitle] = useState(bookSubtitle || "");
  const [editedAuthorName, setEditedAuthorName] = useState(authorName);
  const [editedDescription, setEditedDescription] = useState(bookDescription);
  const [editedBio, setEditedBio] = useState(authorBio);

  const uploadWrapMutation = trpc.covers.uploadCustomCover.useMutation();
  const updateContentMutation = trpc.book.updateBookWrapContent.useMutation();

  // Calculate spine width based on page count (cream paper formula)
  const spineWidth = (pageCount * 0.002252).toFixed(3);
  
  // Calculate total wrap dimensions
  const frontCoverWidth = 6.0; // inches
  const frontCoverHeight = 9.0; // inches
  const bleed = 0.125; // inches on all sides
  const totalWidth = (frontCoverWidth + parseFloat(spineWidth) + frontCoverWidth + 2 * bleed).toFixed(3);
  const totalHeight = (frontCoverHeight + 2 * bleed).toFixed(3);
  
  // Convert to pixels at 300 DPI
  const widthPixels = Math.round(parseFloat(totalWidth) * 300);
  const heightPixels = Math.round(parseFloat(totalHeight) * 300);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleEdit = (fieldName: string) => {
    setEditingField(fieldName);
  };

  const handleSave = async (fieldName: string) => {
    try {
      const updateData: Record<string, string | number> = {
        bookId: bookId,
      };

      if (fieldName === "Title") updateData.selectedTitle = editedTitle;
      if (fieldName === "Subtitle") updateData.selectedSubtitle = editedSubtitle;
      if (fieldName === "Author") updateData.authorName = editedAuthorName;
      if (fieldName === "Description") updateData.bookDescription = editedDescription;
      if (fieldName === "Bio") updateData.authorBio = editedBio;

      await updateContentMutation.mutateAsync(updateData as any);
      setEditingField(null);
      toast.success(`${fieldName} saved successfully!`);
    } catch (error) {
      toast.error(`Failed to save ${fieldName}`);
    }
  };

  const handleCancel = (fieldName: string) => {
    // Reset to original values
    if (fieldName === "Title") setEditedTitle(bookTitle);
    if (fieldName === "Subtitle") setEditedSubtitle(bookSubtitle || "");
    if (fieldName === "Author") setEditedAuthorName(authorName);
    if (fieldName === "Description") setEditedDescription(bookDescription);
    if (fieldName === "Bio") setEditedBio(authorBio);
    setEditingField(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload an image file (PNG, JPG) or PDF");
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      
      setUploadedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await uploadWrapMutation.mutateAsync({
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          fileData: base64,
        });
        
        toast.success("Book wrap uploaded successfully!");
        onUploadComplete(result.url);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setIsUploading(false);
      };
      reader.readAsDataURL(uploadedFile);
    } catch (error) {
      toast.error("Failed to upload book wrap");
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Canva Instructions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎨</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-purple-900 mb-2">Design Your Book Wrap in Canva</h3>
            <p className="text-sm text-gray-700 mb-3">
              Use the specifications below to create your complete book wrap in Canva. Edit and copy the text content, 
              design your wrap, then upload the finished file here.
            </p>
            <a 
              href="https://www.canva.com/create/book-covers/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Canva Book Cover Designer
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Dimensions Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📐 Book Wrap Dimensions</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Canva Custom Size:</p>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded text-lg font-mono">
                {widthPixels} × {heightPixels} pixels
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`${widthPixels} × ${heightPixels}`, "Dimensions")}
              >
                {copiedField === "Dimensions" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Width:</p>
              <p className="font-semibold">{totalWidth}" ({widthPixels}px)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Height:</p>
              <p className="font-semibold">{totalHeight}" ({heightPixels}px)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Spine Width:</p>
              <p className="font-semibold">{spineWidth}" ({Math.round(parseFloat(spineWidth) * 300)}px)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Page Count:</p>
              <p className="font-semibold">{pageCount} pages</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
            <p className="font-semibold text-amber-900 mb-1">⚠️ Layout Guide:</p>
            <ul className="text-amber-800 space-y-1 text-xs">
              <li>• <strong>Back Cover:</strong> Left side ({frontCoverWidth}" wide)</li>
              <li>• <strong>Spine:</strong> Center ({spineWidth}" wide) - text should be vertical</li>
              <li>• <strong>Front Cover:</strong> Right side ({frontCoverWidth}" wide)</li>
              <li>• <strong>Bleed:</strong> 0.125" on all edges (will be trimmed)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Content to Copy */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📝 Content for Your Design</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Edit and copy these texts to paste into your Canva design:
        </p>

        <div className="space-y-4">
          {/* Book Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Book Title</label>
              <div className="flex gap-1">
                {editingField === "Title" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave("Title")}
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel("Title")}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit("Title")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(editedTitle, "Title")}
                    >
                      {copiedField === "Title" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {editingField === "Title" ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-sm"
                autoFocus
              />
            ) : (
              <div className="bg-muted p-3 rounded text-sm">{editedTitle}</div>
            )}
          </div>

          {/* Subtitle */}
          {(bookSubtitle || editingField === "Subtitle") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Subtitle</label>
                <div className="flex gap-1">
                  {editingField === "Subtitle" ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave("Subtitle")}
                      >
                        <Save className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancel("Subtitle")}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit("Subtitle")}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(editedSubtitle, "Subtitle")}
                      >
                        {copiedField === "Subtitle" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingField === "Subtitle" ? (
                <Input
                  value={editedSubtitle}
                  onChange={(e) => setEditedSubtitle(e.target.value)}
                  className="text-sm"
                  autoFocus
                />
              ) : (
                <div className="bg-muted p-3 rounded text-sm">{editedSubtitle}</div>
              )}
            </div>
          )}

          {/* Author Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Author Name</label>
              <div className="flex gap-1">
                {editingField === "Author" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave("Author")}
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel("Author")}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit("Author")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(editedAuthorName, "Author")}
                    >
                      {copiedField === "Author" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {editingField === "Author" ? (
              <Input
                value={editedAuthorName}
                onChange={(e) => setEditedAuthorName(e.target.value)}
                className="text-sm"
                autoFocus
              />
            ) : (
              <div className="bg-muted p-3 rounded text-sm">{editedAuthorName}</div>
            )}
          </div>

          {/* Book Description (for back cover) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Book Description (for back cover)</label>
              <div className="flex gap-1">
                {editingField === "Description" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave("Description")}
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel("Description")}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit("Description")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(editedDescription, "Description")}
                    >
                      {copiedField === "Description" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {editingField === "Description" ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="text-sm min-h-32"
                autoFocus
              />
            ) : (
              <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
                {editedDescription}
              </div>
            )}
          </div>

          {/* Author Bio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Author Bio (for back cover)</label>
              <div className="flex gap-1">
                {editingField === "Bio" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave("Bio")}
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel("Bio")}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit("Bio")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(editedBio, "Bio")}
                    >
                      {copiedField === "Bio" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {editingField === "Bio" ? (
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="text-sm min-h-32"
                autoFocus
              />
            ) : (
              <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
                {editedBio}
              </div>
            )}
          </div>

          {/* ISBN */}
          {isbn && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">ISBN (for barcode)</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(isbn, "ISBN")}
                >
                  {copiedField === "ISBN" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-muted p-3 rounded text-sm font-mono">{isbn}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📤 Upload Your Finished Book Wrap</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you've designed your book wrap in Canva, export it as PNG or PDF and upload it here.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="wrap-upload"
            />
            <label htmlFor="wrap-upload">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </span>
              </Button>
            </label>
            {uploadedFile && (
              <span className="text-sm text-muted-foreground">
                {uploadedFile.name}
              </span>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!uploadedFile || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Book Wrap"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
