import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Loader2, BookOpen, ArrowRight, ChevronLeft } from "lucide-react";

export default function BookStructureSelection() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const [, navigate] = useLocation();

  // Fetch blueprint data
  const { data: blueprint, isLoading: blueprintLoading } = trpc.blueprint.get.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // Fetch existing structure selections
  const { data: existingStructure, isLoading: structureLoading } = trpc.manuscript.getBookStructure.useQuery(
    { blueprintId: Number(blueprintId) },
    { enabled: !!blueprintId }
  );

  // State for checkboxes (initialize with defaults or existing values)
  const [hasPrologue, setHasPrologue] = useState(false);
  const [hasDedication, setHasDedication] = useState(false);
  const [hasAcknowledgements, setHasAcknowledgements] = useState(false);
  const [hasEpilogue, setHasEpilogue] = useState(false);
  const [hasAuthorBio, setHasAuthorBio] = useState(true); // Default true
  const [hasAlsoBy, setHasAlsoBy] = useState(false);
  const [hasNewsletter, setHasNewsletter] = useState(false);

  // Update state when existing structure is loaded
  useEffect(() => {
    if (existingStructure) {
      setHasPrologue(existingStructure.hasPrologue);
      setHasDedication(existingStructure.hasDedication);
      setHasAcknowledgements(existingStructure.hasAcknowledgements);
      setHasEpilogue(existingStructure.hasEpilogue);
      setHasAuthorBio(existingStructure.hasAuthorBio);
      setHasAlsoBy(existingStructure.hasAlsoBy);
      setHasNewsletter(existingStructure.hasNewsletter);
    }
  }, [existingStructure]);

  // Save structure mutation
  const saveStructure = trpc.manuscript.saveBookStructure.useMutation({
    onSuccess: () => {
      // Navigate to manuscript generation page (to be created)
      navigate(`/generate-manuscript/${blueprintId}`);
    },
    onError: (error) => {
      alert(`Error saving structure: ${error.message}`);
    },
  });

  const handleContinue = () => {
    saveStructure.mutate({
      blueprintId: Number(blueprintId),
      hasPrologue,
      hasDedication,
      hasAcknowledgements,
      hasEpilogue,
      hasAuthorBio,
      hasAlsoBy,
      hasNewsletter,
    });
  };

  if (blueprintLoading || structureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-700">Blueprint not found</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: "prologue",
      label: "Prologue",
      description: "An opening section that sets the stage before Chapter 1. Often used to provide backstory, establish mood, or show a key event from the past.",
      checked: hasPrologue,
      onChange: setHasPrologue,
    },
    {
      id: "dedication",
      label: "Dedication",
      description: "A short page dedicating the book to someone special (family, mentor, friend). Typically 1-2 sentences.",
      checked: hasDedication,
      onChange: setHasDedication,
    },
    {
      id: "acknowledgements",
      label: "Acknowledgements",
      description: "Thank the people who helped make your book possible (editors, beta readers, supporters). Usually 1-2 paragraphs.",
      checked: hasAcknowledgements,
      onChange: setHasAcknowledgements,
    },
    {
      id: "epilogue",
      label: "Epilogue",
      description: "A closing section after the final chapter. Shows what happens to characters after the main story ends, or provides final reflections.",
      checked: hasEpilogue,
      onChange: setHasEpilogue,
    },
    {
      id: "authorBio",
      label: "Author Bio",
      description: "A brief biography about you (the author). Helps readers connect with you and builds credibility. Recommended for all books.",
      checked: hasAuthorBio,
      onChange: setHasAuthorBio,
    },
    {
      id: "alsoBy",
      label: '"Also By" Page',
      description: "List your other published books. Great for cross-promotion if you have multiple titles. Skip if this is your first book.",
      checked: hasAlsoBy,
      onChange: setHasAlsoBy,
    },
    {
      id: "newsletter",
      label: "Newsletter Signup",
      description: "Invite readers to join your email list. Essential for building a loyal audience and marketing future books.",
      checked: hasNewsletter,
      onChange: setHasNewsletter,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Back button clicked, blueprintId:', blueprintId);
                console.log('Navigating to:', `/review-outline/${blueprintId}`);
                navigate(`/review-outline/${blueprintId}`);
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Outline
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Book Structure Selection
              </h1>
              <p className="text-sm text-gray-600 mt-1">{blueprint.workingTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Instructions */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Customize Your Book Structure</h2>
          <p className="text-blue-800">
            Select the optional sections you want to include in your book. The AI will generate content for each selected section based on your blueprint and chapter outline. You can always edit the generated content later.
          </p>
        </Card>

        {/* Checkboxes */}
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={section.id}
                  checked={section.checked}
                  onCheckedChange={(checked) => section.onChange(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={section.id}
                    className="text-base font-semibold text-gray-900 cursor-pointer block mb-1"
                  >
                    {section.label}
                  </label>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={saveStructure.isPending}
          >
            {saveStructure.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Manuscript Generation
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
