import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

interface ComingSoonProps {
  featureName?: string;
  description?: string;
}

export default function ComingSoon({ 
  featureName = "This Feature", 
  description = "We're working hard to bring you this exciting new feature. Check back soon!" 
}: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">Coming Soon</CardTitle>
          <CardDescription className="text-lg">
            {featureName} is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {description}
          </p>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">What's Available Now:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                AI-Powered Book Writing (2-Day Program)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Amazon KDP Publishing Tools
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                AI Book Cover Generator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Professional Manuscript Export
              </li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
