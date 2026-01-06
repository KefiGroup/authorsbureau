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
  bookDescription: string;
  pageCount: number;
  isbn?: string;
}

export function BookWrapDesigner({
  frontCoverUrl,
  bookTitle,
  authorName,
  bookDescription,
  pageCount,
  isbn,
}: BookWrapDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Design settings
  const [trimSize, setTrimSize] = useState<TrimSize>('6x9');
  const [paperType, setPaperType] = useState<PaperType>('white');
  const [backDescription, setBackDescription] = useState(bookDescription);
  const [authorBio, setAuthorBio] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(11);
  const [zoom, setZoom] = useState(0.3); // Start zoomed out to see full wrap
  
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
