import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Mail, Share2, Target, BarChart, Megaphone } from "lucide-react";

export default function AIMarketingStudio() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            AI Marketing Studio
          </h1>
          <p className="text-muted-foreground mt-2">
            Promote your book with AI-powered marketing campaigns and audience engagement tools
          </p>
        </div>

        {/* Marketing Tools */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Audience Targeting</CardTitle>
              <CardDescription>
                Identify and reach your ideal readers with AI-powered audience analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Create and manage email marketing campaigns to engage your reader base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Generate engaging social media content and schedule posts across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Megaphone className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Ad Campaigns</CardTitle>
              <CardDescription>
                Create and optimize Amazon Ads, Facebook Ads, and other promotional campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Track sales, reviews, rankings, and marketing performance in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              📈 <strong>Marketing Studio is under development.</strong> These tools will help you reach more readers and grow your author platform with data-driven marketing strategies.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
