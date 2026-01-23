import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RewriteVariationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manuscriptId: number;
  currentContent: string;
  chapterTitle: string;
  blueprintId: number;
  onSelectVariation: (content: string) => void;
}

export function RewriteVariationsModal({
  open,
  onOpenChange,
  manuscriptId,
  currentContent,
  chapterTitle,
  blueprintId,
  onSelectVariation,
}: RewriteVariationsModalProps) {
  const [editInstructions, setEditInstructions] = useState("");
  const [variations, setVariations] = useState<Array<{
    id: number;
    approach: string;
    label: string;
    description: string;
    content: string;
  }> | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);

  const generateMutation = trpc.manuscript.generateRewriteVariations.useMutation({
    onSuccess: (data) => {
      setVariations(data.variations);
      toast.success("3 variations generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate variations: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!editInstructions.trim()) {
      toast.error("Please enter edit instructions");
      return;
    }

    generateMutation.mutate({
      manuscriptId,
      editInstructions,
      currentContent,
      chapterTitle,
      blueprintId,
    });
  };

  const handleSelectVariation = () => {
    if (selectedVariationId === null || !variations) {
      toast.error("Please select a variation");
      return;
    }

    const selected = variations.find((v) => v.id === selectedVariationId);
    if (selected) {
      onSelectVariation(selected.content);
      toast.success(`${selected.label} variation applied!`);
      onOpenChange(false);
      // Reset state
      setEditInstructions("");
      setVariations(null);
      setSelectedVariationId(null);
    }
  };

  const handleRegenerate = () => {
    setVariations(null);
    setSelectedVariationId(null);
    handleGenerate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Request Chapter Rewrite - 3 Variations
          </DialogTitle>
          <DialogDescription>
            Describe how you'd like to improve this chapter. We'll generate 3 creative variations for you to choose from.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edit Instructions Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Edit Instructions</label>
            <Textarea
              placeholder="Example: Make this more engaging, add more concrete examples, simplify the language..."
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              rows={3}
              disabled={generateMutation.isPending || variations !== null}
            />
          </div>

          {/* Generate Button */}
          {!variations && (
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !editInstructions.trim()}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating 3 Variations...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate 3 Variations
                </>
              )}
            </Button>
          )}

          {/* Variations Display */}
          {variations && (
            <div className="space-y-4">
              <Tabs defaultValue="1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {variations.map((variation) => (
                    <TabsTrigger
                      key={variation.id}
                      value={variation.id.toString()}
                      className="relative"
                    >
                      {variation.label}
                      {selectedVariationId === variation.id && (
                        <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {variations.map((variation) => (
                  <TabsContent key={variation.id} value={variation.id.toString()} className="space-y-3">
                    <Card className="p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground">{variation.description}</p>
                    </Card>

                    <Card className="p-6 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {variation.content.split('\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>

                    <Button
                      variant={selectedVariationId === variation.id ? "default" : "outline"}
                      onClick={() => setSelectedVariationId(variation.id)}
                      className="w-full"
                    >
                      {selectedVariationId === variation.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Selected
                        </>
                      ) : (
                        `Select ${variation.label} Variation`
                      )}
                    </Button>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={generateMutation.isPending}
                  className="flex-1"
                >
                  Regenerate 3 New Variations
                </Button>
                <Button
                  onClick={handleSelectVariation}
                  disabled={selectedVariationId === null}
                  className="flex-1"
                >
                  Apply Selected Variation
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
