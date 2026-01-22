import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Loader2, BookOpen, CheckCircle, RefreshCw } from "lucide-react";


export default function ReviewChapterOutline() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const [, navigate] = useLocation();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch blueprint data
  const { data: blueprint, isLoading: blueprintLoading } = trpc.blueprint.get.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Fetch or generate chapter outline
  const { data: outline, isLoading: outlineLoading, refetch: refetchOutline } = trpc.manuscript.getChapterOutline.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Generate chapter outline mutation
  const generateOutline = trpc.manuscript.generateChapterOutline.useMutation({
    onSuccess: () => {
      setIsGenerating(false);
      setError(null);
      refetchOutline();
      // Outline generated successfully
    },
    onError: (error) => {
      setIsGenerating(false);
      const errorMsg = error.message || "Failed to generate outline";
      setError(errorMsg);
      console.error("Error generating outline:", errorMsg);
      alert(`Error: ${errorMsg}`);
    },
  });

  // Approve outline mutation
  const approveOutline = trpc.manuscript.approveChapterOutline.useMutation({
    onSuccess: () => {
      // Outline approved, navigating to next step
      navigate(`/book-structure/${blueprintId}`);
    },
    onError: (error) => {
      console.error("Error approving outline:", error.message);
    },
  });

  // Auto-generate outline if it doesn't exist
  useEffect(() => {
    if (blueprint && !outline && !outlineLoading && !isGenerating) {
      setIsGenerating(true);
      generateOutline.mutate({ blueprintId: Number(blueprintId) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint, outline, outlineLoading, blueprintId, isGenerating]);

  const handleRegenerateOutline = () => {
    setIsGenerating(true);
    generateOutline.mutate({ blueprintId: Number(blueprintId) });
  };

  const handleApproveOutline = () => {
    approveOutline.mutate({ blueprintId: Number(blueprintId) });
  };

  if (blueprintLoading || outlineLoading || isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">
            {isGenerating ? "Generating chapter outline..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Blueprint not found</p>
          <Button onClick={() => navigate("/")} className="mt-4 w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Review Chapter Outline
              </h1>
              <p className="text-gray-600 mt-2">
                {blueprint.workingTitle || "Your Book"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/start-writing/${blueprintId}`)}
            >
              Back to Blueprint
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Instructions */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            What's Next?
          </h2>
          <p className="text-blue-800">
            Based on your blueprint, I've created a detailed chapter-by-chapter outline for your book.
            Review the outline below and click <strong>"Approve Outline"</strong> when you're ready to proceed
            to book structure setup. You can also regenerate the outline if you'd like different chapter organization.
          </p>
        </Card>

        {/* Chapter Outline */}
        {outline && (outline.outline as any)?.chapters && (outline.outline as any).chapters.length > 0 ? (
          <div className="space-y-4 mb-8">
            {(outline.outline as any).chapters.map((chapter: any, index: number) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {chapter.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {chapter.summary}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No outline available. Click "Regenerate Outline" to create one.</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRegenerateOutline}
            disabled={isGenerating || generateOutline.isPending}
          >
            {generateOutline.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Regenerate Outline
              </>
            )}
          </Button>
          <Button
            size="lg"
            onClick={handleApproveOutline}
            disabled={!outline || approveOutline.isPending}
          >
            {approveOutline.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Outline
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
