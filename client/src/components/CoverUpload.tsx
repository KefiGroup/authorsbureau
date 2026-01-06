import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CoverUploadProps {
  onUploadComplete: (coverUrl: string) => void;
  currentCoverUrl?: string;
}

export function CoverUpload({ onUploadComplete, currentCoverUrl }: CoverUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCover = trpc.covers.uploadCustomCover.useMutation({
    onSuccess: (data: { url: string; key: string }) => {
      toast.success("Cover uploaded successfully!");
      onUploadComplete(data.url);
      setUploadProgress(100);
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
      setValidationError(error.message);
      setUploadProgress(0);
    },
  });

  const validateImage = (file: File): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      // Check file type
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        resolve({ valid: false, error: 'Invalid file format. Please upload PNG or JPG.' });
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        resolve({ valid: false, error: 'File size exceeds 50MB limit.' });
        return;
      }

      // Check image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { width, height } = img;
        
        // Recommended: 1600x2560 (eBook standard)
        // Accept aspect ratio around 5:8 (0.625)
        const aspectRatio = width / height;
        const recommendedAspectRatio = 1600 / 2560; // 0.625
        
        if (Math.abs(aspectRatio - recommendedAspectRatio) > 0.1) {
          resolve({
            valid: false,
            error: `Image aspect ratio should be close to 5:8 (portrait). Current: ${width}x${height}. Recommended: 1600x2560px.`,
            dimensions: { width, height }
          });
          return;
        }

        // Minimum dimensions check
        if (width < 800 || height < 1280) {
          resolve({
            valid: false,
            error: `Image too small. Minimum 800x1280px. Current: ${width}x${height}px.`,
            dimensions: { width, height }
          });
          return;
        }

        resolve({ valid: true, dimensions: { width, height } });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'Failed to load image. File may be corrupted.' });
      };

      img.src = objectUrl;
    });
  };

  const handleFileSelect = async (file: File) => {
    setValidationError(null);
    setSelectedFile(file);

    // Validate image
    const validation = await validateImage(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid image');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Convert to base64 for upload
    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(10);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(10 + (e.loaded / e.total) * 40);
      }
    };
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadProgress(50);
      
      uploadCover.mutate({
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!previewUrl && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Upload Your Cover</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your cover image here, or click to browse
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="relative w-48 h-72 flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                {uploadProgress === 100 && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Cover Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile?.name}
                  </p>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadProgress === 100 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Cover uploaded successfully! You can now continue to the next step.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRemove}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Different Image
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Guidelines */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-2">Cover Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Recommended size:</strong> 1600x2560 pixels (5:8 aspect ratio)</li>
            <li>• <strong>Minimum size:</strong> 800x1280 pixels</li>
            <li>• <strong>Format:</strong> PNG or JPG</li>
            <li>• <strong>Max file size:</strong> 50MB</li>
            <li>• <strong>Orientation:</strong> Portrait (vertical)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
