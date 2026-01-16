import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "../lib/trpc";
import { BarChart, TrendingUp, CheckCircle, AlertCircle, Star } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("algorithm");

  const { data: accuracyMetrics, isLoading } = trpc.analytics.getAccuracyMetrics.useQuery();

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and view algorithm performance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="algorithm">Algorithm Accuracy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="algorithm" className="mt-6">
            <div className="grid gap-6">
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : accuracyMetrics && accuracyMetrics.length > 0
                        ? `${(accuracyMetrics.reduce((sum, m) => sum + (m.avgRating || 0), 0) / accuracyMetrics.length / 5 * 100).toFixed(1)}%`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on your feedback
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : accuracyMetrics
                        ? accuracyMetrics.reduce((sum, m) => sum + (m.totalFeedback || 0), 0)
                        : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommendations rated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : accuracyMetrics && accuracyMetrics.length > 0
                        ? `${(accuracyMetrics.reduce((sum, m) => sum + (m.usageRate || 0), 0) / accuracyMetrics.length).toFixed(1)}%`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommendations used
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics by Feature */}
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Performance by Feature</CardTitle>
                  <CardDescription>
                    See how accurate our AI recommendations are for each feature
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading metrics...</div>
                  ) : !accuracyMetrics || accuracyMetrics.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No feedback data yet. Start rating AI recommendations to see accuracy metrics.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {accuracyMetrics.map((metric: any) => {
                        const accuracyPercent = ((metric.avgRating || 0) / 5) * 100;
                        const isGood = accuracyPercent >= 80;
                        const isOk = accuracyPercent >= 60;

                        return (
                          <div key={metric.recommendationType} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">
                                  {metric.recommendationType.replace("_", " ")}
                                </span>
                                {isGood ? (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Excellent
                                  </Badge>
                                ) : isOk ? (
                                  <Badge variant="secondary">Good</Badge>
                                ) : (
                                  <Badge variant="outline">Needs Improvement</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {metric.totalFeedback} ratings • {metric.usageRate?.toFixed(0)}% used
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Progress value={accuracyPercent} className="flex-1" />
                              <span className="text-sm font-medium w-12 text-right">
                                {accuracyPercent.toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{(metric.avgRating || 0).toFixed(1)} / 5.0 average rating</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transparency Statement */}
              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps us improve our AI algorithms and provide better recommendations for all authors. Here's how it works:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span><strong>Confidence Scores:</strong> Each AI recommendation includes a confidence score showing how certain we are about its quality.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span><strong>Feedback Loop:</strong> When you rate recommendations, we track accuracy and adjust our algorithms accordingly.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span><strong>Success Patterns:</strong> We analyze which recommendations lead to bestseller success and prioritize similar patterns.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span><strong>Continuous Improvement:</strong> Our algorithms learn from every book published, becoming more accurate over time.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Account settings coming soon. For now, manage your author profile from the Profile page.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Preference settings coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
