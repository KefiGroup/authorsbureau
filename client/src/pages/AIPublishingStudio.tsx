import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, BookOpen, FileCheck, Package, TrendingUp } from "lucide-react";

export default function AIPublishingStudio() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            AI Publishing Studio
          </h1>
          <p className="text-muted-foreground mt-2">
            Transform your manuscript into a professional publication ready for distribution
          </p>
        </div>

        {/* Publishing Workflow Steps */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Manuscript Review</CardTitle>
              <CardDescription>
                AI-powered editing and formatting checks to ensure your manuscript meets publishing standards
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
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Cover Design</CardTitle>
              <CardDescription>
                AI-generated book covers with professional templates and customization options
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
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Format & Export</CardTitle>
              <CardDescription>
                Generate publication-ready files for Kindle, print, and other platforms
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
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>ISBN & Metadata</CardTitle>
              <CardDescription>
                Manage ISBNs, categories, keywords, and other publishing metadata
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
                <Rocket className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>
                Publish directly to Amazon KDP, IngramSpark, and other platforms
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
              🚀 <strong>Publishing Studio is under development.</strong> These features will help you transform your finished manuscript into a professionally published book across multiple platforms.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
