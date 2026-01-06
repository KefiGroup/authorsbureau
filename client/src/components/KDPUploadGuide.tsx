import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, FileText, Image as ImageIcon, BookOpen, CheckCircle2 } from "lucide-react";

interface KDPUploadGuideProps {
  onClose: () => void;
}

export function KDPUploadGuide({ onClose }: KDPUploadGuideProps) {
  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              🎉 Your Book is Ready for Amazon KDP!
            </h3>
            <p className="text-sm text-green-800">
              Follow these steps to upload your book and start selling on Amazon.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">How to Upload to Amazon KDP</h4>

        {/* Step 1: Create KDP Account */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-2">Sign in to Amazon KDP</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  If you haven't already, create your KDP account (it's free).
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to KDP Dashboard
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Create New Title */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-2">Create a New Title</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Click <strong>"+ Kindle eBook"</strong> or <strong>"+ Paperback"</strong> on your KDP dashboard.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>For eBook: Choose "Kindle eBook"</li>
                  <li>For print book: Choose "Paperback"</li>
                  <li>You can publish both formats for the same book</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Fill in Book Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-2">Enter Book Details</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the information from your <strong>kdp_metadata.txt</strong> file:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Title & Subtitle:</strong> Copy from metadata file</li>
                  <li><strong>Author Name:</strong> Your pen name</li>
                  <li><strong>Description:</strong> Paste optimized description</li>
                  <li><strong>Keywords:</strong> Enter all 7 keywords</li>
                  <li><strong>Categories:</strong> Select recommended categories</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Upload Manuscript */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-2">Upload Manuscript & Cover</h5>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>For eBook:</strong> Upload <code className="bg-muted px-1 py-0.5 rounded">manuscript.epub</code>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>For Paperback:</strong> Upload <code className="bg-muted px-1 py-0.5 rounded">manuscript.pdf</code> (interior) and <code className="bg-muted px-1 py-0.5 rounded">cover.png</code> (cover)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ImageIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Cover Image:</strong> Upload <code className="bg-muted px-1 py-0.5 rounded">cover.png</code> or <code className="bg-muted px-1 py-0.5 rounded">book_wrap.png</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Set Pricing */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                5
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-2">Set Your Pricing</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the pricing recommendation from your metadata file.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>$2.99 or higher:</strong> Earn 70% royalty (recommended)</li>
                  <li><strong>Below $2.99:</strong> Earn 35% royalty</li>
                  <li>KDP will show your estimated earnings per sale</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 6: Preview & Publish */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                6
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-2">Preview & Publish</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Before publishing:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use KDP's online previewer to check formatting</li>
                  <li>Review all book details for accuracy</li>
                  <li>Click <strong>"Publish Your Kindle eBook"</strong> or <strong>"Publish Your Paperback"</strong></li>
                  <li>Your book will be live on Amazon within 24-72 hours</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h5 className="font-semibold mb-2">📚 Helpful Resources</h5>
          <div className="space-y-2 text-sm">
            <a
              href="https://kdp.amazon.com/en_US/help/topic/G200635650"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              KDP Publishing Guide (Official)
            </a>
            <a
              href="https://kdp.amazon.com/en_US/help/topic/G201834340"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Formatting Guidelines
            </a>
            <a
              href="https://authorcentral.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Amazon Author Central (Update Author Page)
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button asChild>
          <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to KDP Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}
