import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Edit, CheckCircle2, Circle } from "lucide-react";
import { Streamdown } from "streamdown";

// Function to strip markdown formatting symbols
function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remove headers (##, ###, etc.)
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold (**text**)
    .replace(/\*(.+?)\*/g, '$1') // Remove italic (*text*)
    .replace(/__(.+?)__/g, '$1') // Remove bold (__text__)
    .replace(/_(.+?)_/g, '$1') // Remove italic (_text_)
    .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough (~~text~~)
    .replace(/`(.+?)`/g, '$1') // Remove inline code (`text`)
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/^>\s+/gm, '') // Remove blockquote markers
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links [text](url)
    .trim();
}

interface BlueprintSection {
  id: string;
  title: string;
  content: string;
  isComplete: boolean;
}

interface BlueprintPreviewProps {
  sections: BlueprintSection[];
  isGenerating: boolean;
  onEdit?: (sectionId: string) => void;
  onExport?: (format: "pdf" | "markdown") => void;
  className?: string;
}

export function BlueprintPreview({
  sections,
  isGenerating,
  onEdit,
  onExport,
  className,
}: BlueprintPreviewProps) {
  const completedCount = sections.filter((s) => s.isComplete).length;
  const totalCount = sections.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className={className}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Story Blueprint</h3>
          </div>
          
          {onExport && !isGenerating && completedCount > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("markdown")}
              >
                <Download className="h-4 w-4 mr-1" />
                Markdown
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("pdf")}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} sections complete
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Blueprint Content */}
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-6 space-y-6">
          {sections.length === 0 && !isGenerating && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Your story blueprint will appear here as you complete the conversation.
              </p>
            </div>
          )}

          {sections.map((section) => (
            <div key={section.id} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <h4 className="font-semibold text-lg">{section.title}</h4>
                </div>
                
                {onEdit && section.isComplete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(section.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Section Content */}
              {section.content && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {stripMarkdown(section.content)}
                </div>
              )}

              {!section.content && section.isComplete && (
                <p className="text-sm text-muted-foreground italic">
                  Section completed. Content will be generated in final blueprint.
                </p>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Generating your comprehensive story blueprint...
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
