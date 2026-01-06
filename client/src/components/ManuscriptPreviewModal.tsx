import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface ManuscriptPreviewModalProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  onDownload: () => void;
  isLoading: boolean;
}

export function ManuscriptPreviewModal({
  open,
  onClose,
  pdfUrl,
  onDownload,
  isLoading,
}: ManuscriptPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manuscript Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating preview...</p>
              </div>
            </div>
          )}

          {!isLoading && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0 rounded-md"
              title="Manuscript Preview"
            />
          )}

          {!isLoading && !pdfUrl && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No preview available</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Preview shows the first few pages. Download for the complete manuscript.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button onClick={onDownload} disabled={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              Download Full Manuscript
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
