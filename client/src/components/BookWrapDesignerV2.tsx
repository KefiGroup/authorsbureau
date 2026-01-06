import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  authorBio,
  authorPhotoUrl,
  bookDescription,
  frontCoverUrl: initialFrontCoverUrl,
  pageCount,
  onWrapGenerated,
}: BookWrapDesignerV2Props) {
  const [frontCoverUrl, setFrontCoverUrl] = useState<string | null>(initialFrontCoverUrl || null);
  const [backBackgroundUrl, setBackBackgroundUrl] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [generatedWrapUrl, setGeneratedWrapUrl] = useState<string | null>(null);

  // Calculate spine width (KDP formula: page count * 0.002252 for cream paper)
  const spineWidth = (pageCount * 0.002252).toFixed(3);
  const totalWidth = (6 + 6 + parseFloat(spineWidth) + 0.25).toFixed(3); // front + back + spine + bleed
  const totalHeight = 9.25; // 9" + 0.125" bleed top + 0.125" bleed bottom

  const uploadCoverMutation = trpc.covers.uploadCustomCover.useMutation({
    onSuccess: (result: { url: string }) => {
      setFrontCoverUrl(result.url);
      setIsUploadingFront(false);
      toast.success("Front cover uploaded successfully!");
    },
    onError: (error: any) => {
      setIsUploadingFront(false);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const uploadBackgroundMutation = trpc.covers.uploadCustomCover.useMutation({
    onSuccess: (result) => {
      setBackBackgroundUrl(result.url);
      setIsUploadingBack(false);
      toast.success("Back cover background uploaded successfully!");
    },
    onError: (error: any) => {
      setIsUploadingBack(false);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const generateWrapMutation = trpc.covers.generateWrap.useMutation({
    onSuccess: (result: { wrapUrl: string }) => {
      setGeneratedWrapUrl(result.wrapUrl);
      onWrapGenerated(result.wrapUrl);
      toast.success("Book wrap generated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const handleFrontCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setIsUploadingFront(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      uploadCoverMutation.mutate({
        fileData: base64,
        fileName: file.name,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBackBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setIsUploadingBack(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      uploadBackgroundMutation.mutate({
        fileData: base64,
        fileName: file.name,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateWrap = () => {
    if (!frontCoverUrl) {
      toast.error("Please upload a front cover first");
      return;
    }

    generateWrapMutation.mutate({
      frontCoverUrl: frontCoverUrl!,
      backgroundColor,
      textColor,
      fontSize: 11,
      template: "modern",
      bookTitle,
      authorName,
      authorBio,
      authorPhotoUrl: authorPhotoUrl || undefined,
      bookDescription,
      pageCount,
    });
  };

  return (
    <div className="space-y-6">
      {/* KDP Guide Lines Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>KDP Book Wrap Specifications (6" × 9" Book)</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• <strong>Total Size:</strong> {totalWidth}" × {totalHeight}" (with bleed)</li>
            <li>• <strong>Spine Width:</strong> {spineWidth}" ({pageCount} pages, cream paper)</li>
            <li>• <strong>Bleed Area:</strong> 0.125" on all sides (background must extend here)</li>
            <li>• <strong>Safe Area:</strong> Keep text/images 0.375" from trim line</li>
            <li>• <strong>Hinge Area:</strong> Avoid text 0.0625" from spine fold</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Step 1: Upload Front Cover */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 1: Upload Front Cover
          </CardTitle>
          <CardDescription>
            Upload your custom front cover design (1600×2560px recommended, PNG or JPG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="front-cover">Front Cover Image</Label>
            <Input
              id="front-cover"
              type="file"
              accept="image/*"
              onChange={handleFrontCoverUpload}
              disabled={isUploadingFront}
            />
            {isUploadingFront && (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Uploading front cover to S3...
              </p>
            )}
            {frontCoverUrl && !isUploadingFront && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  ✓ Front cover uploaded successfully! Ready to generate wrap.
                </p>
                <img
                  src={frontCoverUrl}
                  alt="Front cover"
                  className="w-48 h-auto border rounded"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload Back Cover Background (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 2: Back Cover Background (Optional)
          </CardTitle>
          <CardDescription>
            Upload a background image for the back cover, or use a solid color below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="back-background">Background Image (Optional)</Label>
            <Input
              id="back-background"
              type="file"
              accept="image/*"
              onChange={handleBackBackgroundUpload}
              disabled={isUploadingBack}
            />
          </div>
          {backBackgroundUrl && (
            <div className="space-y-2">
              <p className="text-sm text-green-600">✓ Background uploaded</p>
              <img
                src={backBackgroundUrl}
                alt="Back background"
                className="w-48 h-auto border rounded"
              />
            </div>
          )}
          <div className="pt-4 border-t">
            <Label htmlFor="bg-color">Or Use Solid Background Color</Label>
            <div className="flex items-center gap-4 mt-2">
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
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Customize Text */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Customize Text Color</CardTitle>
          <CardDescription>
            Adjust text color for bio and description on back cover
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex items-center gap-4 mt-2">
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
                placeholder="#000000"
              />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Auto-filled content:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Author Photo: {authorPhotoUrl ? "✓ Available" : "✗ Not uploaded"}</li>
                <li>• Author Bio: {authorBio ? `✓ ${authorBio.substring(0, 50)}...` : "✗ Not provided"}</li>
                <li>• Book Description: {bookDescription ? `✓ ${bookDescription.substring(0, 50)}...` : "✗ Not provided"}</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 4: Generate Book Wrap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Step 4: Generate Book Wrap
          </CardTitle>
          <CardDescription>
            Create your print-ready book wrap with KDP guide lines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateWrap}
            disabled={!frontCoverUrl || generateWrapMutation.isPending}
            className="w-full"
            size="lg"
          >
            {generateWrapMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating Book Wrap...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Book Wrap
              </>
            )}
          </Button>

          {!frontCoverUrl && (
            <p className="text-sm text-muted-foreground">
              ⚠️ Upload a front cover first to generate book wrap
            </p>
          )}

          {/* Show generated wrap preview and download */}
          {generatedWrapUrl && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                ✓ Book Wrap Generated Successfully!
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-2 rounded border">
                  <img
                    src={generatedWrapUrl}
                    alt="Generated book wrap"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={() => window.open(generatedWrapUrl, '_blank')}
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Print-Ready Book Wrap
                </Button>
                <p className="text-sm text-muted-foreground">
                  This file includes front cover, spine, and back cover with KDP guide lines and bleed areas.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
