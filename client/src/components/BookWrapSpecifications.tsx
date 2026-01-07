import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Upload, ExternalLink } from "lucide-react";
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

  const uploadWrapMutation = trpc.covers.uploadCustomCover.useMutation();

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, or PDF)");
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
              Use the specifications below to create your complete book wrap in Canva. Copy the text content, 
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
          Copy these texts to paste into your Canva design:
        </p>

        <div className="space-y-4">
          {/* Book Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Book Title</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bookTitle, "Title")}
              >
                {copiedField === "Title" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded text-sm">{bookTitle}</div>
          </div>

          {/* Subtitle */}
          {bookSubtitle && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Subtitle</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bookSubtitle, "Subtitle")}
                >
                  {copiedField === "Subtitle" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-muted p-3 rounded text-sm">{bookSubtitle}</div>
            </div>
          )}

          {/* Author Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Author Name</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(authorName, "Author")}
              >
                {copiedField === "Author" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded text-sm">{authorName}</div>
          </div>

          {/* Book Description (for back cover) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Book Description (for back cover)</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bookDescription, "Description")}
              >
                {copiedField === "Description" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
              {bookDescription}
            </div>
          </div>

          {/* Author Bio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Author Bio (for back cover)</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(authorBio, "Bio")}
              >
                {copiedField === "Bio" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
              {authorBio}
            </div>
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
              <p className="text-xs text-muted-foreground mt-1">
                Place barcode in bottom-right corner of back cover
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📤 Upload Your Finished Book Wrap</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you've designed your book wrap in Canva, download it as PNG (highest quality) and upload it here.
        </p>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="wrap-upload"
            />
            <label htmlFor="wrap-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-semibold mb-1">
                {uploadedFile ? uploadedFile.name : "Click to select file"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or PDF • Max 50MB • {widthPixels}×{heightPixels}px recommended
              </p>
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!uploadedFile || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? "Uploading..." : "Upload Book Wrap"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
