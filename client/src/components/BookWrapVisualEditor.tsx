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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [cursorStyle, setCursorStyle] = useState<'default' | 'move' | 'crosshair'>('crosshair');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
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

  // Helper to draw resize handles
  const drawResizeHandles = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const handleSize = 12;
    const handles = [
      { x: x, y: y }, // nw
      { x: x + width / 2, y: y }, // n
      { x: x + width, y: y }, // ne
      { x: x + width, y: y + height / 2 }, // e
      { x: x + width, y: y + height }, // se
      { x: x + width / 2, y: y + height }, // s
      { x: x, y: y + height }, // sw
      { x: x, y: y + height / 2 }, // w
    ];
    
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    handles.forEach(handle => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  };

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
      
      // Track image loading
      const imageElements = elements.filter(el => el.type === 'image');
      let imagesLoaded = 0;
      const totalImages = imageElements.length;
      
      // Function to draw selection and handles after all content is rendered
      const drawSelectionAndHandles = () => {
        const selected = elements.find(el => el.id === selectedElement);
        if (!selected) return;
        
        if (selected.type === 'image') {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          ctx.strokeRect(selected.x, selected.y, selected.width, selected.height);
          drawResizeHandles(ctx, selected.x, selected.y, selected.width, selected.height);
        } else if (selected.type === 'text') {
          ctx.font = `${selected.fontSize || 24}px ${selected.fontFamily || 'Arial'}`;
          const metrics = ctx.measureText(selected.content);
          const boxX = selected.x - 5;
          const boxY = selected.y - (selected.fontSize || 24);
          const boxWidth = metrics.width + 10;
          const boxHeight = (selected.fontSize || 24) + 10;
          
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
          drawResizeHandles(ctx, boxX, boxY, boxWidth, boxHeight);
        }
      };
      
      // Draw all elements
      elements.forEach(element => {
        if (element.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = element.content;
          img.onload = () => {
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
            imagesLoaded++;
            // When all images are loaded, draw selection and handles on top
            if (imagesLoaded === totalImages) {
              drawSelectionAndHandles();
            }
          };
          img.onerror = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              drawSelectionAndHandles();
            }
          };
        } else if (element.type === 'text') {
          ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
          ctx.fillStyle = element.color || '#000000';
          ctx.fillText(element.content, element.x, element.y);
        }
      });
      
      // If no images, draw selection immediately
      if (totalImages === 0) {
        drawSelectionAndHandles();
      }
    };
  };

  // Re-render when elements or selection changes
  useEffect(() => {
    if (templateLoaded) {
      renderCanvas();
    }
  }, [elements, selectedElement, templateLoaded]);

  // Add native double-click listener (React's onDoubleClick doesn't work reliably on canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('useEffect: canvas ref not available');
      return;
    }

    console.log('useEffect: Adding native dblclick listener, elements count:', elements.length);

    const handleNativeDoubleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      console.log('Native double-click at:', x, y);

      // Check if double-clicked on a text element
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        if (element.type === 'text') {
          // Measure actual text width
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          
          ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
          const metrics = ctx.measureText(element.content);
          
          // Text hit box
          const textBoxX = element.x - 5;
          const textBoxY = element.y - (element.fontSize || 24);
          const textBoxWidth = metrics.width + 10;
          const textBoxHeight = (element.fontSize || 24) + 10;
          
          console.log('Checking element:', element.id, 'box:', textBoxX, textBoxY, textBoxWidth, textBoxHeight);
          
          if (
            x >= textBoxX &&
            x <= textBoxX + textBoxWidth &&
            y >= textBoxY &&
            y <= textBoxY + textBoxHeight
          ) {
            console.log('Hit! Opening edit dialog');
            setEditingElement(element.id);
            setEditText(element.content);
            toast.info("Edit the text and click Save Changes");
            return;
          }
        }
      }
      console.log('No text element hit');
    };

    canvas.addEventListener('dblclick', handleNativeDoubleClick);
    return () => canvas.removeEventListener('dblclick', handleNativeDoubleClick);
  }, [elements]);

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

  // Handle canvas double-click for text editing
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    console.log('Double-click at:', x, y);

    // Check if double-clicked on a text element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.type === 'text') {
        // Measure actual text width
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        const metrics = ctx.measureText(element.content);
        
        // Text hit box: x to x+textWidth, y-fontSize to y+10
        const textBoxX = element.x - 5;
        const textBoxY = element.y - (element.fontSize || 24);
        const textBoxWidth = metrics.width + 10;
        const textBoxHeight = (element.fontSize || 24) + 10;
        
        console.log('Checking element:', element.id, 'box:', textBoxX, textBoxY, textBoxWidth, textBoxHeight);
        
        if (
          x >= textBoxX &&
          x <= textBoxX + textBoxWidth &&
          y >= textBoxY &&
          y <= textBoxY + textBoxHeight
        ) {
          console.log('Hit! Opening edit dialog');
          setEditingElement(element.id);
          setEditText(element.content);
          toast.info("Edit the text and click Save Changes");
          return;
        }
      }
    }
    console.log('No text element hit');
  };

  // Save edited text
  const saveEditedText = () => {
    if (!editingElement) return;

    setElements(elements.map(el =>
      el.id === editingElement
        ? { ...el, content: editText }
        : el
    ));

    setEditingElement(null);
    setEditText("");
    toast.success("Text updated successfully!");
  };

  // Check if mouse is over a resize handle
  const getResizeHandle = (x: number, y: number, element: CanvasElement): string | null => {
    const handleSize = 12;
    const handles = [
      { name: 'nw', x: element.x, y: element.y },
      { name: 'n', x: element.x + element.width / 2, y: element.y },
      { name: 'ne', x: element.x + element.width, y: element.y },
      { name: 'e', x: element.x + element.width, y: element.y + element.height / 2 },
      { name: 'se', x: element.x + element.width, y: element.y + element.height },
      { name: 's', x: element.x + element.width / 2, y: element.y + element.height },
      { name: 'sw', x: element.x, y: element.y + element.height },
      { name: 'w', x: element.x, y: element.y + element.height / 2 },
    ];

    for (const handle of handles) {
      if (
        x >= handle.x - handleSize &&
        x <= handle.x + handleSize &&
        y >= handle.y - handleSize &&
        y <= handle.y + handleSize
      ) {
        return handle.name;
      }
    }
    return null;
  };

  // Handle mouse down for dragging or resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    // Check if clicking on resize handle
    const handle = getResizeHandle(x, y, element);
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });
      return;
    }

    // Otherwise, start dragging
    setIsDragging(true);
    setCursorStyle('move');
    setDragOffset({
      x: x - element.x,
      y: y - element.y,
    });
  };

  // Handle mouse move for dragging or resizing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle resizing
    if (isResizing && selectedElement && resizeHandle) {
      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = element.x;
      let newY = element.y;

      // Calculate new dimensions based on handle
      if (resizeHandle.includes('e')) newWidth = Math.max(20, resizeStart.width + dx);
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(20, resizeStart.width - dx);
        newX = element.x + (resizeStart.width - newWidth);
      }
      if (resizeHandle.includes('s')) newHeight = Math.max(20, resizeStart.height + dy);
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, resizeStart.height - dy);
        newY = element.y + (resizeStart.height - newHeight);
      }

      setElements(elements.map(el =>
        el.id === selectedElement
          ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
          : el
      ));
      return;
    }

    // Handle dragging
    if (isDragging && selectedElement) {
      setElements(elements.map(el => 
        el.id === selectedElement
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el
      ));
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setCursorStyle('crosshair');
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
              className={isDragging ? 'cursor-move' : selectedElement ? 'cursor-pointer' : 'cursor-crosshair'}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Editing Dialog */}
      <Dialog open={!!editingElement} onOpenChange={() => setEditingElement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Text</DialogTitle>
            <DialogDescription>
              Edit the text content for this element.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-text">Text Content</Label>
              <Textarea
                id="edit-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Enter text..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingElement(null)}>
              Cancel
            </Button>
            <Button onClick={saveEditedText}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
