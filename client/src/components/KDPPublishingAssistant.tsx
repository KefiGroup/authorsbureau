import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, FileText, ImageIcon, Download } from "lucide-react";
import { toast } from "sonner";

interface KDPPublishingAssistantProps {
  bookData: {
    title: string;
    subtitle?: string;
    author: string;
    description: string;
    keywords: string[];
    categories: string[];
    language?: string;
    series?: string;
    edition?: string;
    contributors?: Array<{ name: string; role: string }>;
    publishingRights?: "public-domain" | "i-own-rights";
    ageRange?: string;
    gradeRange?: string;
    manuscriptUrl?: string;
    coverUrl?: string;
    drm?: boolean;
    aiGenerated?: boolean;
    isbn?: string;
    accessibilityFeatures?: string[];
    kdpSelect?: boolean;
    territories?: "worldwide" | "individual";
    primaryMarketplace?: string;
    pricing?: {
      [marketplace: string]: {
        price: number;
        royaltyRate: 35 | 70;
      };
    };
  };
}

export function KDPPublishingAssistant({ bookData }: KDPPublishingAssistantProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Copied ${fieldName}!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="ml-auto flex-shrink-0"
    >
      {copiedField === fieldName ? (
        <>
          <Check className="w-4 h-4 mr-1 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  );

  const FieldRow = ({ label, value, fieldName, multiline = false }: { label: string; value: string; fieldName: string; multiline?: boolean }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <CopyButton text={value} fieldName={fieldName} />
      </div>
      <div className={`p-3 bg-muted rounded-md border ${multiline ? "min-h-[100px]" : ""}`}>
        <p className={`text-sm ${multiline ? "whitespace-pre-wrap" : ""}`}>{value || "(Not provided)"}</p>
      </div>
    </div>
  );

  return (
    <Card className="border-amber-500/50 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          KDP Publishing Assistant
        </CardTitle>
        <CardDescription>
          Copy and paste these fields directly into Amazon KDP - formatted exactly as KDP expects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Page 1: Details</TabsTrigger>
            <TabsTrigger value="content">Page 2: Content</TabsTrigger>
            <TabsTrigger value="pricing">Page 3: Pricing</TabsTrigger>
          </TabsList>

          {/* Page 1: eBook Details */}
          <TabsContent value="details" className="space-y-4 mt-6">
            <div className="space-y-4">
              <FieldRow label="Language" value={bookData.language || "English"} fieldName="language" />
              <FieldRow label="Book Title" value={bookData.title} fieldName="title" />
              {bookData.subtitle && <FieldRow label="Subtitle" value={bookData.subtitle} fieldName="subtitle" />}
              {bookData.series && <FieldRow label="Series" value={bookData.series} fieldName="series" />}
              {bookData.edition && <FieldRow label="Edition Number" value={bookData.edition} fieldName="edition" />}
              <FieldRow label="Author" value={bookData.author} fieldName="author" />
              
              {bookData.contributors && bookData.contributors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Contributors</label>
                  {bookData.contributors.map((contributor, index) => (
                    <FieldRow 
                      key={index}
                      label={`${contributor.role}`}
                      value={contributor.name}
                      fieldName={`contributor-${index}`}
                    />
                  ))}
                </div>
              )}

              <FieldRow 
                label="Description" 
                value={bookData.description} 
                fieldName="description" 
                multiline 
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Publishing Rights</label>
                <div className="p-3 bg-muted rounded-md border">
                  <p className="text-sm">
                    {bookData.publishingRights === "public-domain" 
                      ? "This is a public domain work" 
                      : "I own the copyright and hold the necessary publishing rights"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Keywords (7 maximum)</label>
                </div>
                <p className="text-xs text-muted-foreground">Copy each keyword individually and paste into KDP's 7 keyword fields</p>
                <div className="space-y-2">
                  {bookData.keywords.slice(0, 7).map((keyword, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <div className="flex-1 p-3 bg-muted rounded-md border">
                        <p className="text-sm">{keyword}</p>
                      </div>
                      <CopyButton text={keyword} fieldName={`keyword-${index + 1}`} />
                    </div>
                  ))}
                  {bookData.keywords.length < 7 && (
                    <p className="text-xs text-amber-600 mt-2">⚠️ You have {bookData.keywords.length} keywords. Amazon allows up to 7 keywords for maximum discoverability.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Categories (up to 3)</label>
                </div>
                <p className="text-xs text-muted-foreground">Navigate through KDP's category tree to select these exact paths</p>
                <div className="space-y-2">
                  {bookData.categories.slice(0, 3).map((category, index) => {
                    // Convert "Kindle Store > Kindle eBooks > ..." to "Kindle Books › ..."
                    const formattedCategory = category
                      .replace(/Kindle Store\s*>\s*Kindle eBooks/gi, 'Kindle Books')
                      .replace(/Books\s*>/gi, 'Books ›')
                      .replace(/\s*>\s*/g, ' › ');
                    
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                        <div className="flex-1 p-3 bg-muted rounded-md border">
                          <p className="text-sm font-mono">{formattedCategory}</p>
                        </div>
                        <CopyButton text={formattedCategory} fieldName={`category-${index + 1}`} />
                      </div>
                    );
                  })}
                  {bookData.categories.length < 2 && (
                    <p className="text-xs text-amber-600 mt-2">⚠️ You have {bookData.categories.length} category. Amazon recommends selecting at least 2 categories for better discoverability.</p>
                  )}
                </div>
              </div>

              {(bookData.ageRange || bookData.gradeRange) && (
                <div className="grid grid-cols-2 gap-4">
                  {bookData.ageRange && <FieldRow label="Age Range" value={bookData.ageRange} fieldName="ageRange" />}
                  {bookData.gradeRange && <FieldRow label="Grade Range" value={bookData.gradeRange} fieldName="gradeRange" />}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Page 2: eBook Content */}
          <TabsContent value="content" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Manuscript</label>
                <div className="p-4 bg-muted rounded-md border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Manuscript File</p>
                      <p className="text-xs text-muted-foreground">Upload this file to KDP</p>
                    </div>
                  </div>
                  {bookData.manuscriptUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={bookData.manuscriptUrl} download>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Digital Rights Management (DRM)</label>
                <div className="p-3 bg-muted rounded-md border">
                  <p className="text-sm font-medium">
                    {bookData.drm ? "Yes, apply DRM" : "No, do not apply DRM"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookData.drm 
                      ? "Enable DRM to help prevent unauthorized distribution" 
                      : "No DRM - readers can share across devices freely"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Kindle eBook Cover</label>
                <div className="p-4 bg-muted rounded-md border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Cover Image</p>
                      <p className="text-xs text-muted-foreground">Upload this file to KDP</p>
                    </div>
                  </div>
                  {bookData.coverUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={bookData.coverUrl} download>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">AI-Generated Content</label>
                <div className="p-3 bg-muted rounded-md border">
                  <p className="text-sm font-medium">
                    {bookData.aiGenerated ? "Yes" : "No"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookData.aiGenerated 
                      ? "This book contains AI-generated content" 
                      : "This book does not contain AI-generated content"}
                  </p>
                </div>
              </div>

              {bookData.isbn && (
                <FieldRow label="ISBN (optional for Kindle eBooks)" value={bookData.isbn} fieldName="isbn" />
              )}

              {bookData.accessibilityFeatures && bookData.accessibilityFeatures.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Accessibility Features</label>
                  <div className="p-3 bg-muted rounded-md border">
                    <ul className="text-sm space-y-1">
                      {bookData.accessibilityFeatures.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Page 3: Pricing & Rights */}
          <TabsContent value="pricing" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">KDP Select Enrollment</label>
                <div className="p-3 bg-muted rounded-md border">
                  <p className="text-sm font-medium">
                    {bookData.kdpSelect ? "Enroll my book in KDP Select" : "Do not enroll in KDP Select"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookData.kdpSelect 
                      ? "Exclusive to Amazon for 90 days - earn more royalties and bonuses" 
                      : "Available on all platforms - not exclusive to Amazon"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Territories</label>
                <div className="p-3 bg-muted rounded-md border">
                  <p className="text-sm font-medium">
                    {bookData.territories === "worldwide" 
                      ? "All territories (worldwide rights)" 
                      : "Individual territories"}
                  </p>
                </div>
              </div>

              {bookData.primaryMarketplace && (
                <FieldRow 
                  label="Primary Marketplace" 
                  value={bookData.primaryMarketplace} 
                  fieldName="primaryMarketplace" 
                />
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Pricing & Royalty</label>
                <div className="p-4 bg-muted rounded-md border">
                  <p className="text-sm font-medium mb-3">Recommended Pricing Strategy:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Royalty Rate:</span>
                      <span className="font-medium">70%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recommended Price (Amazon.com):</span>
                      <span className="font-medium">$2.99 - $9.99</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Tip: Price between $2.99-$9.99 to qualify for 70% royalty rate. Books priced outside this range receive 35% royalty.
                    </p>
                  </div>
                </div>
              </div>

              {bookData.pricing && Object.keys(bookData.pricing).length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Marketplace Pricing</label>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">Marketplace</th>
                          <th className="text-right p-3">Price</th>
                          <th className="text-right p-3">Royalty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(bookData.pricing).map(([marketplace, data]) => (
                          <tr key={marketplace} className="border-t">
                            <td className="p-3">{marketplace}</td>
                            <td className="text-right p-3">${data.price.toFixed(2)}</td>
                            <td className="text-right p-3">{data.royaltyRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> After setting your price on Amazon.com, KDP will automatically calculate equivalent prices for other marketplaces based on current exchange rates.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
