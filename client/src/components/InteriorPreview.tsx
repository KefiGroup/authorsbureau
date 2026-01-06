import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface InteriorPreviewProps {
  manuscript: string;
  bookTitle: string;
  authorName: string;
}

export function InteriorPreview({ manuscript, bookTitle, authorName }: InteriorPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get preview summary
  const { data: summary, isLoading: summaryLoading } = trpc.preview.getSummary.useQuery({
    content: manuscript,
  });
  
  // Get current page preview
  const { data: pageData, isLoading: pageLoading } = trpc.preview.getPage.useQuery({
    content: manuscript,
    pageNumber: currentPage,
    bookTitle,
    authorName,
  }, {
    enabled: !!summary, // Only fetch page after summary is loaded
  });
  
  if (summaryLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing manuscript...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!summary) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Unable to generate preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Preview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Interior Preview
          </CardTitle>
          <CardDescription>
            See how your formatted manuscript will look when published
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.totalPages}</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.totalWords.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.estimatedReadTime}</div>
              <div className="text-sm text-muted-foreground">Min Read</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">6" × 9" Trim Size</Badge>
              <Badge variant="outline">12pt Font</Badge>
              <Badge variant="outline">1.5 Line Spacing</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || pageLoading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium px-4">
                Page {currentPage} of {summary.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(summary.totalPages, currentPage + 1))}
                disabled={currentPage === summary.totalPages || pageLoading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Page Preview */}
      <Card>
        <CardContent className="p-0">
          {pageLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pageData ? (
            <div className="bg-gray-100 p-8 flex justify-center">
              <iframe
                srcDoc={pageData.html}
                className="border-0 shadow-lg"
                style={{
                  width: '432px',
                  height: '648px',
                  backgroundColor: 'white',
                }}
                title={`Page ${currentPage} Preview`}
              />
            </div>
          ) : (
            <div className="text-center py-24 text-muted-foreground">
              Unable to load page preview
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Jump to Sample Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Jump</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.floor(summary.totalPages / 2))}
            >
              Middle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(summary.totalPages)}
              disabled={currentPage === summary.totalPages}
            >
              Last Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
