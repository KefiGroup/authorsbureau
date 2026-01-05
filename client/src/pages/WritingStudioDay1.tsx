import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function WritingStudioDay1() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [storyData, setStoryData] = useState({
    disasterMoment: "",
    transformation: "",
    currentState: "",
    lessonLearned: "",
    targetAudience: "",
    uniqueAngle: ""
  });

  const [aiResponse, setAiResponse] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the Writing Studio</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleGenerateOutline = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation - replace with actual tRPC call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiResponse(`# Your SUCKcess Story Outline

## Book Title Suggestions:
1. From [Disaster] to [Triumph]: My Journey
2. The [Your Unique Angle] Story
3. Rising After [Your Challenge]

## Chapter Structure (8 Chapters based on SUCKcess Theory):

### Chapter 1: Start by Sucking - The Disaster
Your story begins with: ${storyData.disasterMoment}

### Chapter 2: Understanding Myself
Deep dive into who you were before the transformation...

### Chapter 3: Choosing My Path
The moment you decided to change...

### Chapter 4: Finding My Niche
Discovering your unique approach: ${storyData.uniqueAngle}

### Chapter 5: Building My Circle
The people who supported your journey...

### Chapter 6: Evolving Through Crisis
How challenges shaped you: ${storyData.transformation}

### Chapter 7: Seeing the Future
Visualizing your success...

### Chapter 8: Serving Others
Your current mission: ${storyData.currentState}

## Target Reader Profile:
${storyData.targetAudience}

## Core Message:
${storyData.lessonLearned}
`);
      toast.success("Outline generated! Review and refine as needed.");
    } catch (error) {
      toast.error("Failed to generate outline. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/writing-studio">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Writing Studio
            </Link>
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="mb-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Day 1 of 2
              </Badge>
              <h1 className="text-4xl font-bold">Discover Your SUCKcess Story</h1>
              <p className="text-muted-foreground mt-2">
                Let's uncover your transformation journey and build your book foundation
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step 1: The Disaster Moment */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Your Disaster Moment</CardTitle>
              <CardDescription>
                Every SUCKcess story begins with a moment where you "sucked" at something or faced a major challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="disaster">What was your biggest disaster, failure, or challenge?</Label>
                <Textarea
                  id="disaster"
                  placeholder="Example: I lost my job, went through a divorce, faced a health crisis, failed in business..."
                  value={storyData.disasterMoment}
                  onChange={(e) => setStoryData({...storyData, disasterMoment: e.target.value})}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Be specific and honest. This is the foundation of your transformation story.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!storyData.disasterMoment.trim()}
                >
                  Next: Your Transformation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: The Transformation */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Your Transformation Journey</CardTitle>
              <CardDescription>
                How did you evolve from that disaster moment? What changed?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="transformation">Describe your transformation process</Label>
                <Textarea
                  id="transformation"
                  placeholder="Example: I took courses, found mentors, changed my mindset, developed new skills..."
                  value={storyData.transformation}
                  onChange={(e) => setStoryData({...storyData, transformation: e.target.value})}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current">Where are you now?</Label>
                <Textarea
                  id="current"
                  placeholder="Example: I'm now a successful entrepreneur, helping others overcome similar challenges..."
                  value={storyData.currentState}
                  onChange={(e) => setStoryData({...storyData, currentState: e.target.value})}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!storyData.transformation.trim() || !storyData.currentState.trim()}
                >
                  Next: Your Message <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Your Message & Audience */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Your Message & Audience</CardTitle>
              <CardDescription>
                What's the core lesson you want to share, and who needs to hear it?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lesson">What's the main lesson you learned?</Label>
                <Textarea
                  id="lesson"
                  placeholder="Example: Failure is not the opposite of success, it's the doorway to it..."
                  value={storyData.lessonLearned}
                  onChange={(e) => setStoryData({...storyData, lessonLearned: e.target.value})}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Who is your ideal reader?</Label>
                <Textarea
                  id="audience"
                  placeholder="Example: People who feel stuck after failure, entrepreneurs rebuilding after setbacks..."
                  value={storyData.targetAudience}
                  onChange={(e) => setStoryData({...storyData, targetAudience: e.target.value})}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)}
                  disabled={!storyData.lessonLearned.trim() || !storyData.targetAudience.trim()}
                >
                  Next: Your Unique Angle <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Generate Outline */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Your Unique Angle</CardTitle>
              <CardDescription>
                What makes your story different from others in your space?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="angle">What's your unique perspective or approach?</Label>
                <Textarea
                  id="angle"
                  placeholder="Example: I combine mindfulness with business strategy, I use humor to teach serious topics..."
                  value={storyData.uniqueAngle}
                  onChange={(e) => setStoryData({...storyData, uniqueAngle: e.target.value})}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {aiResponse && (
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Your AI-Generated Book Outline
                  </h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <Streamdown>{aiResponse}</Streamdown>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex gap-3">
                  {!aiResponse && (
                    <Button 
                      onClick={handleGenerateOutline}
                      disabled={isGenerating || !storyData.uniqueAngle.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Outline
                        </>
                      )}
                    </Button>
                  )}
                  {aiResponse && (
                    <>
                      <Button variant="outline" onClick={() => setAiResponse("")}>
                        Regenerate
                      </Button>
                      <Button onClick={() => {
                        toast.success("Day 1 complete! Ready for Day 2.");
                        setLocation("/writing-studio");
                      }}>
                        <Save className="mr-2 h-4 w-4" />
                        Save & Continue to Day 2
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Your progress is automatically saved</p>
        </div>
      </div>
    </div>
  );
}
