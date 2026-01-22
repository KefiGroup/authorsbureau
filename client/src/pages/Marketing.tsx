import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Rocket, 
  Mail, 
  Share2, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Copy,
  ExternalLink,
  Sparkles,
  Target,
  Megaphone,
  Pencil,
  Save,
  X
} from "lucide-react";

export default function Marketing() {
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [campaignType, setCampaignType] = useState<"launch" | "promotion" | "relaunch">("launch");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's books
  const { data: books, isLoading: booksLoading } = trpc.book.getMyBooks.useQuery();

  // Selected book details
  const selectedBook = books?.find((b: any) => b.id === selectedBookId);

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Marketing Campaign Builder</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create automated marketing campaigns to boost your book sales and reach more readers
          </p>
        </div>

        {/* Book Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Book to Market</CardTitle>
            <CardDescription>Choose which book you want to create a marketing campaign for</CardDescription>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="text-muted-foreground">Loading your books...</div>
            ) : books && books.length > 0 ? (
              <div className="space-y-4">
                <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a book..." />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book: any) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title || "Untitled Book"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedBook && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-lg mb-1">{selectedBook.title}</h3>
                    {selectedBook.subtitle && (
                      <p className="text-sm text-muted-foreground mb-2">{selectedBook.subtitle}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        {selectedBook.genre || "Genre not detected"}
                      </Badge>
                      {selectedBook.workflowStep === "export" && (
                        <Badge variant="default" className="bg-green-600">
                          Ready to Market
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't created any books yet.</p>
                <Button onClick={() => (window.location.href = "/ready-to-publish")}>
                  <Rocket className="mr-2 h-4 w-4" />
                  Create Your First Book
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Builder (only show if book selected) */}
        {selectedBook && (
          <>
            {/* Campaign Type Selection */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Campaign Type</CardTitle>
                <CardDescription>Choose the type of marketing campaign you want to run</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setCampaignType("launch")}
                    className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary ${
                      campaignType === "launch" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Rocket className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">Book Launch</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive campaign for new book releases with pre-launch buzz and launch day push
                    </p>
                  </button>

                  <button
                    onClick={() => setCampaignType("promotion")}
                    className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary ${
                      campaignType === "promotion" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Target className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">Promotion</h3>
                    <p className="text-sm text-muted-foreground">
                      Limited-time promotion to boost sales of existing books (price drops, giveaways)
                    </p>
                  </button>

                  <button
                    onClick={() => setCampaignType("relaunch")}
                    className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary ${
                      campaignType === "relaunch" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <TrendingUp className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">Re-launch</h3>
                    <p className="text-sm text-muted-foreground">
                      Revitalize older books with updated covers, new reviews, and fresh marketing angles
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Tools Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="social">
                  <Share2 className="h-4 w-4 mr-2" />
                  Social Media
                </TabsTrigger>
                <TabsTrigger value="ads">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Amazon Ads
                </TabsTrigger>
                <TabsTrigger value="promotions">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Book Promos
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <CampaignOverview campaignType={campaignType} book={selectedBook} />
              </TabsContent>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-6">
                <EmailSequenceBuilder campaignType={campaignType} book={selectedBook} />
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-6">
                <SocialMediaGenerator campaignType={campaignType} book={selectedBook} />
              </TabsContent>

              {/* Amazon Ads Tab */}
              <TabsContent value="ads" className="space-y-6">
                <AmazonAdsAssistant book={selectedBook} />
              </TabsContent>

              {/* Book Promotions Tab */}
              <TabsContent value="promotions" className="space-y-6">
                <BookPromotionSites book={selectedBook} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// Campaign Overview Component
function CampaignOverview({ campaignType, book }: { campaignType: string; book: any }) {
  const strategies = {
    launch: [
      "Build pre-launch email list with landing page",
      "Create social media countdown (7 days before launch)",
      "Reach out to book bloggers and reviewers",
      "Submit to BookBub, Freebooksy for launch day visibility",
      "Run Amazon Ads targeting similar books",
      "Price at $0.99 for first 3 days to maximize downloads",
      "Ask early readers for honest reviews on launch day",
    ],
    promotion: [
      "Drop price to $0.99 or FREE for limited time",
      "Submit to all major book promotion sites",
      "Create urgency with countdown timers in emails",
      "Run targeted Facebook/Instagram ads to genre readers",
      "Boost Amazon Ads budget during promotion period",
      "Cross-promote with other authors in your genre",
      "Update book description to highlight limited-time offer",
    ],
    relaunch: [
      "Update cover design to modern standards",
      "Revise book description with stronger hooks",
      "Gather new reviews from ARC readers",
      "Create \"Updated Edition\" announcement",
      "Re-submit to book promotion sites as \"new release\"",
      "Run retargeting ads to previous visitors",
      "Bundle with other books in series for increased value",
    ],
  };

  const timeline = {
    launch: [
      { day: "30 days before", task: "Create landing page and start building email list" },
      { day: "14 days before", task: "Send ARCs to reviewers and bloggers" },
      { day: "7 days before", task: "Start social media countdown campaign" },
      { day: "3 days before", task: "Send pre-launch email to subscribers" },
      { day: "Launch day", task: "Send launch email, post on social media, activate ads" },
      { day: "3 days after", task: "Follow-up email thanking early supporters" },
      { day: "7 days after", task: "Share early reviews and testimonials" },
    ],
    promotion: [
      { day: "7 days before", task: "Submit to book promotion sites (BookBub, Freebooksy)" },
      { day: "3 days before", task: "Send teaser email about upcoming promotion" },
      { day: "Promo day 1", task: "Drop price, send announcement email, activate ads" },
      { day: "Promo day 2", task: "Post on social media with urgency messaging" },
      { day: "Promo day 3", task: "Final reminder email before price returns to normal" },
      { day: "After promo", task: "Thank you email to new readers" },
    ],
    relaunch: [
      { day: "30 days before", task: "Update cover and book description" },
      { day: "21 days before", task: "Send ARCs for updated edition reviews" },
      { day: "14 days before", task: "Announce re-launch to existing readers" },
      { day: "7 days before", task: "Create \"What's New\" content for social media" },
      { day: "Re-launch day", task: "Send email, post on social, activate ads" },
      { day: "7 days after", task: "Share new reviews and reader feedback" },
    ],
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Strategy</CardTitle>
          <CardDescription>
            Recommended tactics for your {campaignType} campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {strategies[campaignType as keyof typeof strategies].map((strategy, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <span className="text-sm">{strategy}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Timeline
          </CardTitle>
          <CardDescription>Suggested schedule for maximum impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline[campaignType as keyof typeof timeline].map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-32 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {item.day}
                  </Badge>
                </div>
                <p className="text-sm">{item.task}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Budget Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Amazon Ads</span>
              <span className="font-semibold">$50-100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Book Promotion Sites</span>
              <span className="font-semibold">$30-80</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Social Media Ads (optional)</span>
              <span className="font-semibold">$20-50</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">Total Estimated Budget</span>
              <span className="text-lg font-bold text-primary">$100-230</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ROI: With proper execution, expect 3-5x return on marketing investment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Email Sequence Builder Component
function EmailSequenceBuilder({ campaignType, book }: { campaignType: "launch" | "promotion" | "relaunch"; book: any }) {
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailType, setEmailType] = useState<"prelaunch" | "launch" | "postlaunch">("launch");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const generateEmail = trpc.marketing.generateEmailSequence.useMutation({
    onSuccess: (data: { emailContent: string }) => {
      setGeneratedEmail(data.emailContent);
      setOriginalEmail(data.emailContent);
      setEditedEmail(data.emailContent);
      setIsEditingEmail(false);
      toast.success("Email generated successfully!");
      setGeneratingEmail(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate email");
      setGeneratingEmail(false);
    },
  });

  const handleGenerateEmail = () => {
    setGeneratingEmail(true);
    generateEmail.mutate({
      bookId: book.id.toString(),
      emailType,
      campaignType,
    });
  };

  const copyToClipboard = () => {
    const contentToCopy = isEditingEmail ? editedEmail : generatedEmail;
    navigator.clipboard.writeText(contentToCopy);
    toast.success("Email copied to clipboard!");
  };

  const handleStartEdit = () => {
    setEditedEmail(generatedEmail);
    setIsEditingEmail(true);
  };

  const handleSaveEdit = () => {
    setGeneratedEmail(editedEmail);
    setIsEditingEmail(false);
    toast.success("Email saved successfully!");
  };

  const handleCancelEdit = () => {
    setEditedEmail(generatedEmail);
    setIsEditingEmail(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Email Sequence Generator</CardTitle>
          <CardDescription>
            Generate professional marketing emails tailored to your book and campaign type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Type</Label>
            <Select value={emailType} onValueChange={(v: any) => setEmailType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prelaunch">Pre-Launch Teaser</SelectItem>
                <SelectItem value="launch">Launch Announcement</SelectItem>
                <SelectItem value="postlaunch">Post-Launch Thank You</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateEmail} disabled={generatingEmail} className="w-full">
            {generatingEmail ? (
              <>Generating Email...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Email with AI
              </>
            )}
          </Button>

          {generatedEmail && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Generated Email</Label>
                <div className="flex gap-2">
                  {!isEditingEmail ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleStartEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="default" size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                value={isEditingEmail ? editedEmail : generatedEmail}
                onChange={(e) => isEditingEmail && setEditedEmail(e.target.value)}
                readOnly={!isEditingEmail}
                rows={15}
                className={`font-mono text-sm ${
                  isEditingEmail ? 'border-blue-500 ring-2 ring-blue-200' : ''
                }`}
              />
              <p className="text-xs text-muted-foreground">
                {isEditingEmail
                  ? 'Editing mode: Make your changes and click Save'
                  : 'Click Edit to modify the email content'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Marketing Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Subject line should be under 50 characters for mobile optimization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Include a clear call-to-action (CTA) button linking to your Amazon page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Personalize with reader's name if your email platform supports it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Send emails at 10 AM or 2 PM for highest open rates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Test on mobile devices before sending to your full list</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Social Media Generator Component
function SocialMediaGenerator({ campaignType, book }: { campaignType: "launch" | "promotion" | "relaunch"; book: any }) {
  const [generatingPost, setGeneratingPost] = useState(false);
  const [platform, setPlatform] = useState<"twitter" | "facebook" | "instagram">("twitter");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPost, setEditedPost] = useState("");
  const [originalPost, setOriginalPost] = useState("");

  const generatePost = trpc.marketing.generateSocialPost.useMutation({
    onSuccess: (data: { postContent: string }) => {
      setGeneratedPost(data.postContent);
      setOriginalPost(data.postContent);
      setEditedPost(data.postContent);
      setIsEditingPost(false);
      toast.success("Social media post generated!");
      setGeneratingPost(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate post");
      setGeneratingPost(false);
    },
  });

  const handleGeneratePost = () => {
    setGeneratingPost(true);
    generatePost.mutate({
      bookId: book.id.toString(),
      platform,
      campaignType,
    });
  };

  const copyToClipboard = () => {
    const contentToCopy = isEditingPost ? editedPost : generatedPost;
    navigator.clipboard.writeText(contentToCopy);
    toast.success("Post copied to clipboard!");
  };

  const handleStartEdit = () => {
    setEditedPost(generatedPost);
    setIsEditingPost(true);
  };

  const handleSaveEdit = () => {
    setGeneratedPost(editedPost);
    setIsEditingPost(false);
    toast.success("Post saved successfully!");
  };

  const handleCancelEdit = () => {
    setEditedPost(generatedPost);
    setIsEditingPost(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Social Media Post Generator</CardTitle>
          <CardDescription>
            Create engaging social media posts optimized for each platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter/X (280 characters)</SelectItem>
                <SelectItem value="facebook">Facebook (longer format)</SelectItem>
                <SelectItem value="instagram">Instagram (with hashtags)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGeneratePost} disabled={generatingPost} className="w-full">
            {generatingPost ? (
              <>Generating Post...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Post with AI
              </>
            )}
          </Button>

          {generatedPost && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Generated Post</Label>
                <div className="flex gap-2">
                  {!isEditingPost ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleStartEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="default" size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                value={isEditingPost ? editedPost : generatedPost}
                onChange={(e) => isEditingPost && setEditedPost(e.target.value)}
                readOnly={!isEditingPost}
                rows={8}
                className={`font-sans text-sm ${
                  isEditingPost ? 'border-blue-500 ring-2 ring-blue-200' : ''
                }`}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Character count: {(isEditingPost ? editedPost : generatedPost).length}</span>
                {platform === "twitter" && (isEditingPost ? editedPost : generatedPost).length > 280 && (
                  <span className="text-destructive">Exceeds Twitter limit!</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isEditingPost
                  ? 'Editing mode: Make your changes and click Save'
                  : 'Click Edit to modify the post content'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Strategy Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Post consistently: 1-2 times per day during campaign period</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use eye-catching book cover images in every post</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Include relevant hashtags: #bookstagram #amreading #newrelease</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Engage with comments and shares to boost algorithm visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tag other authors and book bloggers to expand reach</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Amazon Ads Assistant Component
function AmazonAdsAssistant({ book }: { book: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Amazon Ads Campaign Setup</CardTitle>
          <CardDescription>
            Step-by-step guide to creating effective Amazon advertising campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Recommended Campaign Settings</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-muted/50 rounded">
                <span className="font-medium">Campaign Type:</span>
                <span>Sponsored Products</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded">
                <span className="font-medium">Targeting:</span>
                <span>Automatic + Manual (Product/Keyword)</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded">
                <span className="font-medium">Daily Budget:</span>
                <span>$5-10 (start small, scale up)</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded">
                <span className="font-medium">Bid Strategy:</span>
                <span>Dynamic bids - down only</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded">
                <span className="font-medium">Default Bid:</span>
                <span>$0.30-0.50 per click</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Suggested Keywords to Target</h3>
            <div className="flex flex-wrap gap-2">
              {book.kindleKeywords?.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              )) || <span className="text-sm text-muted-foreground">No keywords generated yet</span>}
            </div>
            {!book.kindleKeywords && (
              <p className="text-xs text-muted-foreground mt-2">
                Generate keywords in the Amazon KDP Optimization step first
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Competitor Books to Target</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Find bestselling books in your genre and target their product pages with your ads
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a
                href={`https://www.amazon.com/s?k=${encodeURIComponent(book.detectedGenre || "books")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Search Amazon for Similar Books
              </a>
            </Button>
          </div>

          <Button className="w-full" asChild>
            <a
              href="https://advertising.amazon.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Amazon Advertising Console
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amazon Ads Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Run automatic campaigns first to discover which keywords convert</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Check campaign performance every 3-5 days, adjust bids accordingly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Negative match keywords that get clicks but no sales</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Aim for ACoS (Advertising Cost of Sales) under 50% for profitability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Increase bids on high-converting keywords to maximize visibility</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Book Promotion Sites Component
function BookPromotionSites({ book }: { book: any }) {
  const promotionSites = [
    {
      name: "BookBub",
      url: "https://www.bookbub.com/partners",
      cost: "$50-500",
      reach: "2M+ readers",
      bestFor: "Major launches, price drops to $0.99 or FREE",
      requirements: "25+ reviews, 4.0+ rating",
    },
    {
      name: "Freebooksy",
      url: "https://www.freebooksy.com/",
      cost: "$40-100",
      reach: "500K+ readers",
      bestFor: "FREE promotions",
      requirements: "10+ reviews",
    },
    {
      name: "Bargain Booksy",
      url: "https://www.bargainbooksy.com/",
      cost: "$40-80",
      reach: "300K+ readers",
      bestFor: "$0.99-2.99 promotions",
      requirements: "10+ reviews",
    },
    {
      name: "BookSends",
      url: "https://booksends.com/",
      cost: "$20-50",
      reach: "150K+ readers",
      bestFor: "All price points",
      requirements: "5+ reviews",
    },
    {
      name: "Robin Reads",
      url: "https://www.robinreads.com/",
      cost: "$25-60",
      reach: "200K+ readers",
      bestFor: "Genre-specific promotions",
      requirements: "10+ reviews, 3.5+ rating",
    },
    {
      name: "eReader News Today",
      url: "https://www.ereadernewstoday.com/",
      cost: "$30-70",
      reach: "250K+ readers",
      bestFor: "All genres",
      requirements: "10+ reviews",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Promotion Sites</CardTitle>
          <CardDescription>
            Submit your book to these sites for maximum visibility during promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotionSites.map((site, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{site.name}</h3>
                  <Badge variant="outline">{site.cost}</Badge>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Reach:</span> {site.reach}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Best for:</span> {site.bestFor}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Requirements:</span> {site.requirements}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={site.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit {site.name}
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Submission Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Submit to 3-5 sites simultaneously for maximum impact</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Schedule promotions 7-14 days in advance (most sites require lead time)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Stack promotions on the same day for bestseller list momentum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Ensure your book meets review requirements before submitting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Track results: note which sites drive the most sales for future campaigns</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
