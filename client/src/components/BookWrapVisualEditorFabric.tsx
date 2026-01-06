import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
const { Canvas, FabricImage, IText, util } = fabric;
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
// import { trpc } from '@/lib/trpc';
import { Upload, Type, Image as ImageIcon, Trash2, Download } from 'lucide-react';

interface BookWrapVisualEditorFabricProps {
  bookId: string;
}

export function BookWrapVisualEditorFabric({ bookId }: BookWrapVisualEditorFabricProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<InstanceType<typeof Canvas> | null>(null);
  const [isReady, setIsReady] = useState(false);

  // File uploads handled directly via FileReader

  // KDP Template dimensions for 6"×9" book with 128 pages
  // Overall: 14.084" × 10.417" (with bleed)
  // At 300 DPI: 4225px × 3125px
  const CANVAS_WIDTH = 4225;
  const CANVAS_HEIGHT = 3125;

  // Initialize Fabric.js canvas
  useEffect(() => {
    console.log('[FABRIC INIT] useEffect triggered');
    console.log('[FABRIC INIT] canvasRef.current:', canvasRef.current);
    console.log('[FABRIC INIT] fabricCanvasRef.current:', fabricCanvasRef.current);
    
    if (!canvasRef.current) {
      console.error('[FABRIC INIT] No canvas ref!');
      return;
    }
    
    if (fabricCanvasRef.current) {
      console.log('[FABRIC INIT] Canvas already initialized, skipping');
      return;
    }

    console.log('[FABRIC INIT] Creating new Canvas...');
    let canvas: InstanceType<typeof Canvas>;
    try {
      canvas = new Canvas(canvasRef.current, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#ffffff',
      });
      console.log('[FABRIC INIT] Canvas created successfully:', canvas);

      fabricCanvasRef.current = canvas;
      console.log('[FABRIC INIT] Canvas stored in ref');
    } catch (error) {
      console.error('[FABRIC INIT] Error creating canvas:', error);
      toast.error('Failed to initialize canvas');
      return;
    }

    // Load KDP template as background
    console.log('[FABRIC INIT] Loading KDP template...');
    const templateUrl = '/kdp-template.png';
    FabricImage.fromURL(templateUrl, {
      crossOrigin: 'anonymous',
    }).then((img) => {
      console.log('[FABRIC INIT] Template loaded:', img);
      if (!img) {
        console.error('[FABRIC INIT] Template image is null');
        return;
      }
      
      // Scale template to fit canvas
      const scaleX = CANVAS_WIDTH / (img.width || 1);
      const scaleY = CANVAS_HEIGHT / (img.height || 1);
      console.log('[FABRIC INIT] Template scale:', { scaleX, scaleY });
      
      img.set({
        scaleX,
        scaleY,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });

      canvas.backgroundImage = img;
      canvas.renderAll();
      setIsReady(true);
      console.log('[FABRIC INIT] Template set as background, editor ready');
      toast.success('Visual editor ready!');
    }).catch((error) => {
      console.error('[FABRIC INIT] Failed to load template:', error);
      toast.error('Failed to load template');
      setIsReady(true); // Allow editing even if template fails
    });

    return () => {
      console.log('[FABRIC INIT] Cleanup: disposing canvas');
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Add text box
  const handleAddText = () => {
    console.log('[DEBUG] handleAddText called');
    const canvas = fabricCanvasRef.current;
    console.log('[DEBUG] Canvas ref:', canvas);
    if (!canvas) {
      console.error('[DEBUG] Canvas not initialized!');
      toast.error('Canvas not ready');
      return;
    }

    const text = new IText('Double-click to edit', {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      fontSize: 48,
      fontFamily: 'Arial',
      fill: '#000000',
      editable: true,
    });
    console.log('[DEBUG] Text object created:', text);

    canvas.add(text);
    console.log('[DEBUG] Text added to canvas. Total objects:', canvas.getObjects().length);
    canvas.setActiveObject(text);
    canvas.renderAll();
    console.log('[DEBUG] Canvas rendered');
    toast.success('Text added! Double-click to edit');
  };

  // Add image
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    toast.info('Loading image...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target?.result as string;
      
      FabricImage.fromURL(dataURL, {
        crossOrigin: 'anonymous',
      }).then((img) => {
        if (!img || !fabricCanvasRef.current) return;

        // Scale image to reasonable size (max 800px width/height)
        const maxSize = 800;
        const scale = Math.min(maxSize / (img.width || 1), maxSize / (img.height || 1), 1);
        
        img.set({
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          scaleX: scale,
          scaleY: scale,
        });

        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
        toast.success('Image added!');
      }).catch((error) => {
        console.error('Failed to load image:', error);
        toast.error('Failed to load image');
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Upload front cover
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    toast.info('Loading front cover...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target?.result as string;
      
      FabricImage.fromURL(dataURL, {
        crossOrigin: 'anonymous',
      }).then((img) => {
        if (!img || !fabricCanvasRef.current) return;

        // Front cover dimensions: 6" × 9" at 300 DPI = 1800px × 2700px
        // Position on right side of wrap
        const coverWidth = 1800;
        const coverHeight = 2700;
        
        // Calculate position (right side, centered vertically with bleed)
        const left = CANVAS_WIDTH - coverWidth - 200; // 200px from right edge (bleed area)
        const top = (CANVAS_HEIGHT - coverHeight) / 2;
        
        img.set({
          left,
          top,
          scaleX: coverWidth / (img.width || 1),
          scaleY: coverHeight / (img.height || 1),
        });

        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
        toast.success('Front cover added!');
      }).catch((error) => {
        console.error('Failed to load cover:', error);
        toast.error('Failed to load cover');
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Delete selected element
  const handleDeleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      toast.error('No element selected');
      return;
    }

    canvas.remove(activeObject);
    canvas.renderAll();
    toast.success('Element deleted');
  };

  // Export book wrap
  const handleExport = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      // Export as PNG
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1, // Already at 300 DPI size
      });

      // Download
      const link = document.createElement('a');
      link.download = `book-wrap-${bookId}.png`;
      link.href = dataURL;
      link.click();

      toast.success('Book wrap exported!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export book wrap');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Book Wrap Visual Editor</h2>
          <p className="text-muted-foreground mt-1">
            Design your complete book wrap for 6"×9" paperback with KDP specifications
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadCover}
              className="hidden"
            />
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Front Cover
              </span>
            </Button>
          </label>

          <Button variant="outline" onClick={handleAddText}>
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </Button>

          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
            />
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image
              </span>
            </Button>
          </label>

          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>

          <Button onClick={handleExport} disabled={!isReady}>
            <Download className="w-4 h-4 mr-2" />
            Export Book Wrap
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
          <p className="font-semibold">How to Use:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Click "Upload Front Cover" to add your cover to the right side</li>
            <li>Click "Add Text" or "Add Image" to add elements anywhere</li>
            <li>Click any element to select it (shows resize handles)</li>
            <li>Double-click text to edit it directly</li>
            <li>Drag elements to reposition them</li>
            <li>Drag corner handles to resize elements</li>
            <li>Drag rotation handle (top) to rotate elements</li>
            <li>The template shows safe zones, spine area, and bleed marks</li>
            <li>Click "Export Book Wrap" when done to download print-ready PNG</li>
          </ul>
        </div>

        {/* Canvas Container */}
        <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
          <div style={{ width: 'fit-content', margin: '0 auto' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
