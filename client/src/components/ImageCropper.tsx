import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropCompleteCallback = useCallback(
    (_croppedArea: CroppedArea, croppedAreaPx: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPx);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    const imageElement = new Image();
    imageElement.src = image;

    await new Promise((resolve) => {
      imageElement.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to cropped area size
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Draw cropped image
    ctx.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop & Adjust Photo</DialogTitle>
          <DialogDescription>
            Zoom and reposition your photo to get the perfect crop
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-96 bg-gray-100 rounded-lg">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Drag to reposition • Scroll or use slider to zoom
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={createCroppedImage}>
            Save Cropped Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
