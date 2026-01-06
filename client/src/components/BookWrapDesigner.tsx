import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { BackCoverLayoutEditor } from "@/components/BackCoverLayoutEditor";
import { BackCoverPreview } from "@/components/BackCoverPreview";
import type { BackCoverLayout } from "../../../shared/back-cover-types";
import { LAYOUT_PRESETS } from "../../../shared/back-cover-types";
import {
  TrimSize,
  PaperType,
  calculateWrapDimensions,
  getSafeZones,
  getBarcodeSpecs,
  inchesToPixels,
  TRIM_SIZES,
} from "@/../../shared/book-wrap-calculator";

interface BookWrapDesignerProps {
  frontCoverUrl: string;
  bookTitle: string;
  authorName: string;
  authorPhoto?: string;
  authorBio?: string;
  bookDescription: string;
  pageCount: number;
  isbn?: string;
}

export function BookWrapDesigner({
  frontCoverUrl,
  bookTitle,
  authorName,
  authorPhoto,
  authorBio: initialAuthorBio,
  bookDescription,
  pageCount,
  isbn,
}: BookWrapDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Design settings
  const [trimSize, setTrimSize] = useState<TrimSize>('6x9');
  const [paperType, setPaperType] = useState<PaperType>('white');
  const [backDescription, setBackDescription] = useState(bookDescription);
  const [authorBio, setAuthorBio] = useState(initialAuthorBio || "");
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState(authorPhoto || "");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(11);
  const [zoom, setZoom] = useState(0.3); // Start zoomed out to see full wrap
  const [backCoverLayout, setBackCoverLayout] = useState<BackCoverLayout>({
    preset: "classic",
    elements: LAYOUT_PRESETS.classic.elements || [],
  });
  
  // Calculate dimensions
  const dimensions = calculateWrapDimensions(trimSize, pageCount, paperType);
  const safeZones = getSafeZones(dimensions);
  const barcodeSpecs = getBarcodeSpecs(dimensions);
  
  // Draw the wrap on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to print resolution (300 DPI)
    const width = inchesToPixels(dimensions.totalWidth);
    const height = inchesToPixels(dimensions.totalHeight);
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.fillStyle = '#CCCCCC'; // Gray background for bleed area
    ctx.fillRect(0, 0, width, height);
    
    // Draw trim area (white)
    const bleedPx = inchesToPixels(dimensions.bleed);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bleedPx, bleedPx, width - (bleedPx * 2), height - (bleedPx * 2));
    
    // Draw guide lines
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    
    // Spine boundaries
    const frontWidth = inchesToPixels(dimensions.trimWidth);
    const spineWidth = inchesToPixels(dimensions.spineWidth);
    ctx.beginPath();
    ctx.moveTo(bleedPx + frontWidth, 0);
    ctx.lineTo(bleedPx + frontWidth, height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(bleedPx + frontWidth + spineWidth, 0);
    ctx.lineTo(bleedPx + frontWidth + spineWidth, height);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw front cover (load image)
    const frontImg = new Image();
    frontImg.crossOrigin = "anonymous";
    frontImg.onload = () => {
      ctx.drawImage(
        frontImg,
        bleedPx,
        bleedPx,
        frontWidth,
        inchesToPixels(dimensions.trimHeight)
      );
      
      // Draw spine
      drawSpine(ctx);
      
      // Draw back cover
      drawBackCover(ctx);
    };
    frontImg.src = frontCoverUrl;
    
  }, [dimensions, frontCoverUrl, backDescription, authorBio, backgroundColor, textColor, fontSize, trimSize, paperType]);
  
  const drawSpine = (ctx: CanvasRenderingContext2D) => {
    const bleedPx = inchesToPixels(dimensions.bleed);
    const frontWidth = inchesToPixels(dimensions.trimWidth);
    const spineWidth = inchesToPixels(dimensions.spineWidth);
    const height = inchesToPixels(dimensions.trimHeight);
    
    // Spine background (match front cover or use solid color)
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(
      bleedPx + frontWidth,
      bleedPx,
      spineWidth,
      height
    );
    
    // Only add text if spine is wide enough (> 0.25")
    if (dimensions.spineWidth > 0.25) {
      ctx.save();
      ctx.translate(bleedPx + frontWidth + (spineWidth / 2), bleedPx + (height / 2));
      ctx.rotate(-Math.PI / 2);
      
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize + 2}pt Georgia`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const spineText = `${bookTitle}  •  ${authorName}`;
      ctx.fillText(spineText, 0, 0);
      
      ctx.restore();
    }
  };
  
  const drawBackCover = (ctx: CanvasRenderingContext2D) => {
    const bleedPx = inchesToPixels(dimensions.bleed);
    const frontWidth = inchesToPixels(dimensions.trimWidth);
    const spineWidth = inchesToPixels(dimensions.spineWidth);
    const backWidth = inchesToPixels(dimensions.trimWidth);
    const height = inchesToPixels(dimensions.trimHeight);
    
    const backX = bleedPx + frontWidth + spineWidth;
    
    // Back cover background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(backX, bleedPx, backWidth, height);
    
    // Safe zone for text
    const safeMargin = inchesToPixels(0.25);
    const textX = backX + safeMargin;
    const textY = bleedPx + safeMargin;
    const textWidth = backWidth - (safeMargin * 2);
    const textHeight = height - (safeMargin * 2);
    
    // Draw description
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}pt Georgia`;
    ctx.textAlign = 'left';
    
    const lines = wrapText(ctx, backDescription, textWidth - inchesToPixels(0.5));
    let currentY = textY + 20;
    
    lines.forEach(line => {
      if (currentY < textY + textHeight - inchesToPixels(2)) {
        ctx.fillText(line, textX, currentY);
        currentY += fontSize * 1.5;
      }
    });
    
    // Draw author bio if provided
    if (authorBio.trim()) {
      currentY += 30;
      ctx.font = `italic ${fontSize - 1}pt Georgia`;
      const bioLines = wrapText(ctx, `About the Author: ${authorBio}`, textWidth - inchesToPixels(0.5));
      bioLines.forEach(line => {
        if (currentY < textY + textHeight - inchesToPixels(2)) {
          ctx.fillText(line, textX, currentY);
          currentY += (fontSize - 1) * 1.5;
        }
      });
    }
    
    // Draw barcode placeholder
    const barcodeX = backX + inchesToPixels(barcodeSpecs.left - bleedPx - frontWidth - spineWidth);
    const barcodeY = bleedPx + height - inchesToPixels(barcodeSpecs.height) - inchesToPixels(barcodeSpecs.bottom);
    const barcodeWidth = inchesToPixels(barcodeSpecs.width);
    const barcodeHeight = inchesToPixels(barcodeSpecs.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    
    // Barcode text
    ctx.fillStyle = '#000000';
    ctx.font = '10pt Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ISBN BARCODE', barcodeX + (barcodeWidth / 2), barcodeY + (barcodeHeight / 2) - 10);
    if (isbn) {
      ctx.font = 'bold 12pt Arial';
      ctx.fillText(isbn, barcodeX + (barcodeWidth / 2), barcodeY + (barcodeHeight / 2) + 10);
    } else {
      ctx.font = '9pt Arial';
      ctx.fillText('(Add ISBN in settings)', barcodeX + (barcodeWidth / 2), barcodeY + (barcodeHeight / 2) + 10);
    }
  };
  
  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  };
  
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Export as PNG (high resolution)
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to generate image");
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_')}_BookWrap_${trimSize}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Book wrap exported! Upload this to Amazon KDP.");
    }, 'image/png');
  };
  
  return (
    <div className="space-y-6">
      {/* Back Cover Layout Customization */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Layout Editor */}
        <BackCoverLayoutEditor
          layout={backCoverLayout}
          onChange={setBackCoverLayout}
        />
        
        {/* Live Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your back cover will look with the selected layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackCoverPreview
                layout={backCoverLayout}
                authorPhoto={authorPhotoUrl}
                authorBio={authorBio}
                bookDescription={backDescription}
                isbn={isbn}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Original Back Cover Preview (kept for reference) */}
      <Card className="hidden">
        <CardHeader>
          <CardTitle>Back Cover Preview (Old)</CardTitle>
          <CardDescription>
            See how your author profile and book description will appear on the back cover
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Visual Preview */}
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 bg-white" style={{ backgroundColor, color: textColor }}>
                {/* Book Description */}
                <div className="mb-6">
                  <p className="text-sm leading-relaxed" style={{ fontSize: `${fontSize}pt` }}>
                    {backDescription || "Your book description will appear here..."}
                  </p>
                </div>
                
                {/* Author Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-start gap-4">
                    {authorPhotoUrl ? (
                      <img
                        src={authorPhotoUrl}
                        alt={authorName}
                        className="w-20 h-20 rounded-full object-cover border-2"
                        style={{ borderColor: textColor }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2" style={{ borderColor: textColor }}>
                        <span className="text-xs text-muted-foreground">Photo</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2" style={{ fontSize: `${fontSize + 2}pt` }}>
                        About the Author
                      </h4>
                      <p className="text-xs leading-relaxed" style={{ fontSize: `${fontSize - 2}pt` }}>
                        {authorBio || "Your author bio will appear here..."}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* ISBN Placeholder */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <div className="font-mono">{isbn || "ISBN: XXXX-XXXX-XXXX"}</div>
                    </div>
                    <div className="w-24 h-16 border-2 flex items-center justify-center" style={{ borderColor: textColor }}>
                      <span className="text-[8px]">BARCODE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Info Panel */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">What You're Seeing</h4>
                <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span><strong>Book Description:</strong> Pulled from your AI analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span><strong>Author Photo:</strong> From your profile ({authorPhotoUrl ? "✓ Added" : "⚠ Missing"})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span><strong>Author Bio:</strong> From your profile ({authorBio ? "✓ Added" : "⚠ Missing"})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span><strong>ISBN & Barcode:</strong> Will be added to final wrap</span>
                  </li>
                </ul>
              </div>
              
              {(!authorPhotoUrl || !authorBio) && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">Complete Your Profile</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    {!authorPhotoUrl && !authorBio ? "Add your photo and bio to create a professional back cover." :
                     !authorPhotoUrl ? "Add your photo to complete the back cover." :
                     "Add your bio to complete the back cover."}
                  </p>
                  
                  {!authorPhotoUrl && (
                    <div className="mb-3">
                      <Label className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2 block">Upload Author Photo</Label>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File size must be under 5MB");
                              return;
                            }
                            // Validate dimensions (min 300x300)
                            const img = new Image();
                            img.onload = () => {
                              if (img.width < 300 || img.height < 300) {
                                toast.error("Image must be at least 300x300 pixels");
                                return;
                              }
                              // Upload to storage and update state
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const dataUrl = e.target?.result as string;
                                setAuthorPhotoUrl(dataUrl);
                                toast.success("Photo uploaded! Don't forget to save your changes.");
                              };
                              reader.readAsDataURL(file);
                            };
                            img.src = URL.createObjectURL(file);
                          }
                        }}
                        className="text-sm"
                      />
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Min 300x300px, max 5MB (JPG, PNG, GIF)
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/profile'}
                    className="w-full"
                  >
                    {!authorBio ? "Go to Profile to Add Bio" : "View Full Profile"}
                  </Button>
                </div>
              )}
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Customization Options</h4>
                <p className="text-sm text-muted-foreground">
                  Below you can customize colors, fonts, and layout. The preview will update in real-time as you make changes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Book Wrap Designer</CardTitle>
          <CardDescription>
            Create your complete paperback cover (front + spine + back)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Trim Size</Label>
              <Select value={trimSize} onValueChange={(v) => setTrimSize(v as TrimSize)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5x8">5" × 8"</SelectItem>
                  <SelectItem value="5.5x8.5">5.5" × 8.5"</SelectItem>
                  <SelectItem value="6x9">6" × 9" (Most Popular)</SelectItem>
                  <SelectItem value="7x10">7" × 10"</SelectItem>
                  <SelectItem value="8.5x11">8.5" × 11"</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Paper Type</Label>
              <Select value={paperType} onValueChange={(v) => setPaperType(v as PaperType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White Paper</SelectItem>
                  <SelectItem value="cream">Cream Paper</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Dimensions Info */}
          <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
            <div className="font-semibold">Calculated Dimensions:</div>
            <div>Spine Width: {dimensions.spineWidth.toFixed(3)}" ({pageCount} pages)</div>
            <div>Total Wrap: {dimensions.totalWidth.toFixed(2)}" × {dimensions.totalHeight.toFixed(2)}" (with bleed)</div>
            <div className="text-xs text-muted-foreground mt-2">
              Red lines show spine boundaries. Gray area is bleed (will be trimmed).
            </div>
          </div>
          
          {/* Back Cover Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Back Cover Description</Label>
              <Textarea
                value={backDescription}
                onChange={(e) => setBackDescription(e.target.value)}
                placeholder="Enter the book description for the back cover..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Author Bio (Optional)</Label>
              <Textarea
                value={authorBio}
                onChange={(e) => setAuthorBio(e.target.value)}
                placeholder="Brief author biography for back cover..."
                rows={3}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          {/* Styling */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Font Size: {fontSize}pt</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={8}
                max={14}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
          
          {/* Canvas Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(1, zoom + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(0.3)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30 overflow-auto max-h-[600px]">
              <canvas
                ref={canvasRef}
                style={{
                  width: `${zoom * 100}%`,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
                className="border shadow-lg"
              />
            </div>
          </div>
          
          {/* Export */}
          <div className="flex justify-end gap-2">
            <Button onClick={handleExport} size="lg">
              <Download className="w-5 h-5 mr-2" />
              Export Print-Ready Cover
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
