import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Konva from 'konva';

interface BookWrapVisualEditorKonvaProps {
  bookId: string;
}

// KDP 6"×9" book dimensions at 300 DPI
const DPI = 300;
const CANVAS_WIDTH = Math.round(14.084 * DPI); // 4225px
const CANVAS_HEIGHT = Math.round(10.417 * DPI); // 3125px

interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  image?: HTMLImageElement;
  rotation?: number;
}

export function BookWrapVisualEditorKonva({ bookId }: BookWrapVisualEditorKonvaProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; text: string } | null>(null);

  // Load KDP template
  useEffect(() => {
    const img = new window.Image();
    img.src = '/kdp-template.png';
    img.onload = () => {
      setTemplateImage(img);
      toast.success('Visual editor ready!');
    };
    img.onerror = () => {
      toast.error('Failed to load KDP template');
    };
  }, []);

  const handleAddText = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: CANVAS_WIDTH / 2 - 100,
      y: CANVAS_HEIGHT / 2,
      text: 'Double-click to edit',
      fontSize: 48,
      rotation: 0,
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
    toast.success('Text added! Double-click to edit.');
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const newElement: CanvasElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          x: CANVAS_WIDTH / 2 - img.width / 2,
          y: CANVAS_HEIGHT / 2 - img.height / 2,
          width: img.width,
          height: img.height,
          image: img,
          rotation: 0,
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
        toast.success('Image added!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Position on right side (front cover area)
        // Front cover starts at approximately 9.575" from left
        const frontCoverX = Math.round(9.575 * DPI);
        const frontCoverY = Math.round(0.709 * DPI); // Top margin
        const frontCoverWidth = Math.round(6 * DPI); // 6" width
        const frontCoverHeight = Math.round(9 * DPI); // 9" height

        const newElement: CanvasElement = {
          id: `cover-${Date.now()}`,
          type: 'image',
          x: frontCoverX,
          y: frontCoverY,
          width: frontCoverWidth,
          height: frontCoverHeight,
          image: img,
          rotation: 0,
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
        toast.success('Front cover uploaded!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) {
      toast.error('No element selected');
      return;
    }
    setElements(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
    toast.success('Element deleted');
  };

  const handleExport = () => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL({
      pixelRatio: 1, // Already at 300 DPI
      mimeType: 'image/png',
    });

    const link = document.createElement('a');
    link.download = `book-wrap-${bookId}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Book wrap exported!');
  };

  const handleTextDoubleClick = (id: string) => {
    const element = elements.find((el) => el.id === id);
    if (element && element.type === 'text') {
      setEditingText({ id, text: element.text || '' });
    }
  };

  const handleTextSave = () => {
    if (!editingText) return;
    setElements(
      elements.map((el) =>
        el.id === editingText.id ? { ...el, text: editingText.text } : el
      )
    );
    setEditingText(null);
    toast.success('Text updated!');
  };

  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, x: node.x(), y: node.y() } : el
      )
    );
  };

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    setElements(
      elements.map((el) =>
        el.id === id
          ? {
              ...el,
              x: node.x(),
              y: node.y(),
              width: el.width ? Math.max(5, node.width() * scaleX) : undefined,
              height: el.height ? Math.max(5, node.height() * scaleY) : undefined,
              rotation: node.rotation(),
            }
          : el
      )
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Book Wrap Visual Editor</h2>
          <p className="text-muted-foreground">
            Design your complete book wrap for 6"×9" paperback with KDP specifications
          </p>
        </div>

        {/* Prominent Canva Instructions */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎨</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-2">Design Your Cover in Canva First!</h3>
              <p className="text-sm text-gray-700 mb-3">
                For best results, create your complete 6"×9" book cover design in Canva before uploading here.
                This tool is for positioning your finished design on the KDP template.
              </p>
              <div className="bg-white rounded p-3 mb-3 text-sm">
                <p className="font-semibold mb-1">📐 Canva Settings:</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Create custom size: <strong>1800 × 2700 pixels</strong> (6" × 9" at 300 DPI)</li>
                  <li>• Design your front cover with title, author name, and imagery</li>
                  <li>• Download as PNG (highest quality)</li>
                </ul>
              </div>
              <a 
                href="https://www.canva.com/create/book-covers/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-purple-600 hover:bg-purple-700">
                  🚀 Open Canva Book Cover Designer
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <label>
            <Button variant="outline" asChild>
              <span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCover}
                  className="hidden"
                />
                Upload Front Cover
              </span>
            </Button>
          </label>

          <Button onClick={handleAddText} variant="outline">
            Add Text
          </Button>

          {/* Removed Add Image and Delete Selected - users should design in Canva */}

          <Button onClick={handleExport} className="ml-auto">
            Export Book Wrap
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to Use:</h3>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li><strong>Step 1:</strong> Design your complete 6"×9" book cover in <a href="https://www.canva.com" target="_blank" className="text-primary underline">Canva</a> or your preferred design tool</li>
            <li><strong>Step 2:</strong> Click "Upload Front Cover" to add your cover to the right side of the template</li>
            <li><strong>Step 3:</strong> (Optional) Click "Add Text" to add simple text elements like title or author name</li>
            <li><strong>Step 4:</strong> Drag and resize elements to position them correctly</li>
            <li><strong>Step 5:</strong> Click "Export Book Wrap" to download your print-ready PNG file for KDP</li>
            <li className="text-xs italic mt-2">💡 Tip: The pink template shows safe zones, spine area, and bleed marks for proper KDP formatting</li>
          </ul>
        </div>

        <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
          <Stage
            ref={stageRef}
            width={Math.min(CANVAS_WIDTH, 1200)}
            height={Math.min(CANVAS_HEIGHT, (1200 * CANVAS_HEIGHT) / CANVAS_WIDTH)}
            scaleX={Math.min(1200 / CANVAS_WIDTH, 1)}
            scaleY={Math.min(1200 / CANVAS_WIDTH, 1)}
            onClick={(e) => {
              // Deselect when clicking on empty area
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              {/* KDP Template Background */}
              {templateImage && (
                <KonvaImage
                  image={templateImage}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  listening={false}
                />
              )}

              {/* User Elements */}
              {elements.map((element) => {
                if (element.type === 'text') {
                  return (
                    <KonvaText
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      text={element.text}
                      fontSize={element.fontSize}
                      fill="black"
                      draggable
                      rotation={element.rotation || 0}
                      onClick={() => setSelectedId(element.id)}
                      onDblClick={() => handleTextDoubleClick(element.id)}
                      onDragEnd={(e) => handleDragEnd(element.id, e)}
                      onTransformEnd={(e) => handleTransformEnd(element.id, e)}
                    />
                  );
                } else if (element.type === 'image' && element.image) {
                  return (
                    <KonvaImage
                      key={element.id}
                      id={element.id}
                      image={element.image}
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      draggable
                      rotation={element.rotation || 0}
                      onClick={() => setSelectedId(element.id)}
                      onDragEnd={(e) => handleDragEnd(element.id, e)}
                      onTransformEnd={(e) => handleTransformEnd(element.id, e)}
                    />
                  );
                }
                return null;
              })}

              {/* Transformer for selected element */}
              {selectedId && (
                <TransformerComponent
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Text Edit Dialog */}
      <Dialog open={!!editingText} onOpenChange={() => setEditingText(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Text</DialogTitle>
          </DialogHeader>
          <Input
            value={editingText?.text || ''}
            onChange={(e) =>
              setEditingText(editingText ? { ...editingText, text: e.target.value } : null)
            }
            placeholder="Enter text..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingText(null)}>
              Cancel
            </Button>
            <Button onClick={handleTextSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Transformer component for selected elements
function TransformerComponent({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string | null) => void;
}) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = transformerRef.current.getStage();
      if (stage) {
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    }
  }, [selectedId]);

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Limit minimum size
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
