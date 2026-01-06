import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Download, 
  Type, 
  Image as ImageIcon,
  Move,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // URL for images, text content for text
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface BookWrapVisualEditorProps {
  bookId: string;
  bookTitle: string;
  authorName: string;
  pageCount: number;
  onWrapGenerated: (wrapUrl: string) => void;
}

export function BookWrapVisualEditor({
  bookId,
  bookTitle,
  authorName,
  pageCount,
  onWrapGenerated,
}: BookWrapVisualEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [frontCoverUrl, setFrontCoverUrl] = useState<string | null>(null);

  // KDP template dimensions (matching the uploaded template)
  const CANVAS_WIDTH = 1408; // 14.084" at 100 DPI for display
  const CANVAS_HEIGHT = 1042; // 10.417" at 100 DPI for display
  const SCALE = 100; // Display at 100 DPI, export at 300 DPI

  // Upload cover mutation
  const uploadCoverMutation = trpc.covers.uploadCustomCover.useMutation({
    onSuccess: (result: { url: string }) => {
      setFrontCoverUrl(result.url);
      toast.success("Front cover uploaded successfully!");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // Load KDP template as background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the KDP template image
    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';
    templateImg.src = '/kdp-template.png';
    
    templateImg.onload = () => {
      setTemplateLoaded(true);
      renderCanvas();
    };

    templateImg.onerror = () => {
      // If template not found, draw basic guide lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw basic frame
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      setTemplateLoaded(true);
    };
  }, []);

  // Render canvas with all elements
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw KDP template background
    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';
    templateImg.src = '/kdp-template.png';
    templateImg.onload = () => {
      ctx.drawImage(templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw all elements
      elements.forEach(element => {
        if (element.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = element.content;
          img.onload = () => {
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
            
            // Draw selection border if selected
            if (element.id === selectedElement) {
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 3;
              ctx.strokeRect(element.x, element.y, element.width, element.height);
            }
          };
        } else if (element.type === 'text') {
          ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
          ctx.fillStyle = element.color || '#000000';
          ctx.fillText(element.content, element.x, element.y);
          
          // Draw selection border if selected
          if (element.id === selectedElement) {
            const metrics = ctx.measureText(element.content);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.strokeRect(element.x - 5, element.y - (element.fontSize || 24), metrics.width + 10, (element.fontSize || 24) + 10);
          }
        }
      });
    };
  };

  // Re-render when elements or selection changes
  useEffect(() => {
    if (templateLoaded) {
      renderCanvas();
    }
  }, [elements, selectedElement, templateLoaded]);

  // Handle front cover upload
  const handleFrontCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadCoverMutation.mutate({ 
        fileName: file.name,
        fileType: file.type,
        fileData: base64 
      });
      
      // Add to canvas immediately
      const newElement: CanvasElement = {
        id: `cover-${Date.now()}`,
        type: 'image',
        x: 800, // Position on front cover area (right side)
        y: 100,
        width: 600,
        height: 900,
        content: base64,
      };
      
      setElements([...elements, newElement]);
    };
    reader.readAsDataURL(file);
  };

  // Add text box
  const addTextBox = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      width: 200,
      height: 50,
      content: 'Double-click to edit',
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Add image
  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newElement: CanvasElement = {
        id: `img-${Date.now()}`,
        type: 'image',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        width: 200,
        height: 200,
        content: reader.result as string,
      };
      
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    };
    reader.readAsDataURL(file);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on any element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      ) {
        setSelectedElement(element.id);
        return;
      }
    }

    // Clicked on empty space
    setSelectedElement(null);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    setIsDragging(true);
    setDragOffset({
      x: x - element.x,
      y: y - element.y,
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements(elements.map(el => 
      el.id === selectedElement
        ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
        : el
    ));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedElement) return;
    setElements(elements.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
  };

  // Export canvas
  const exportCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Force a re-render and wait for all images to load
    await new Promise<void>((resolve) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      // Clear and redraw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Load template
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      templateImg.src = '/kdp-template.png';
      
      templateImg.onload = () => {
        ctx.drawImage(templateImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Load and draw all elements
        const imagePromises = elements.map((element) => {
          return new Promise<void>((resolveElement) => {
            if (element.type === 'image') {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = element.content;
              img.onload = () => {
                ctx.drawImage(img, element.x, element.y, element.width, element.height);
                resolveElement();
              };
              img.onerror = () => resolveElement();
            } else if (element.type === 'text') {
              ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
              ctx.fillStyle = element.color || '#000000';
              ctx.fillText(element.content, element.x, element.y);
              resolveElement();
            } else {
              resolveElement();
            }
          });
        });

        Promise.all(imagePromises).then(() => resolve());
      };
      
      templateImg.onerror = () => resolve();
    });

    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Export at current resolution
    const dataURL = canvas.toDataURL('image/png', 1.0);
    
    const link = document.createElement('a');
    link.download = `${bookTitle.replace(/\s+/g, '_')}_BookWrap.png`;
    link.href = dataURL;
    link.click();

    toast.success("Book wrap exported successfully!");
    onWrapGenerated(dataURL);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Book Wrap Visual Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Upload Front Cover */}
            <div>
              <Label htmlFor="front-cover-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Front Cover
                  </span>
                </Button>
              </Label>
              <Input
                id="front-cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFrontCoverUpload}
              />
            </div>

            {/* Add Text */}
            <Button variant="outline" size="sm" onClick={addTextBox}>
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>

            {/* Add Image */}
            <div>
              <Label htmlFor="add-image" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image
                  </span>
                </Button>
              </Label>
              <Input
                id="add-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={addImage}
              />
            </div>

            {/* Delete Selected */}
            {selectedElement && (
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            )}

            {/* Export */}
            <Button variant="default" size="sm" onClick={exportCanvas}>
              <Download className="w-4 h-4 mr-2" />
              Export Book Wrap
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Click "Upload Front Cover" to add your cover to the right side</li>
              <li>• Click "Add Text" or "Add Image" to add elements</li>
              <li>• Click any element to select it (blue border)</li>
              <li>• Drag selected elements to reposition them</li>
              <li>• Click "Delete Selected" to remove an element</li>
              <li>• The template shows safe zones and spine area</li>
              <li>• Click "Export Book Wrap" when done</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-auto border rounded-lg bg-gray-100" style={{ maxHeight: '70vh' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
