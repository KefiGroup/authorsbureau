import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function Marketing() {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-16">
        <Card className="border-2">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Marketing Tools</CardTitle>
            <CardDescription className="text-base mt-4">
              Promote your book and reach more readers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-lg font-semibold mb-2">Coming Soon</p>
              <p className="text-muted-foreground">
                Marketing tools and promotional features are currently in development.
                Check back soon for book promotion strategies, social media templates,
                and reader engagement tools.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
