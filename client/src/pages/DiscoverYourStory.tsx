import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Mail,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

export default function DiscoverYourStory() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Form state
  const [quizData, setQuizData] = useState({
    name: "",
    email: "",
    biggestChallenge: "",
    currentStatus: "",
    desiredImpact: "",
    writingExperience: ""
  });

  const [suckcessProfile, setSuckcessProfile] = useState("");

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const challenges = [
    { value: "career", label: "Career setback or job loss", icon: "💼" },
    { value: "health", label: "Health crisis or chronic illness", icon: "🏥" },
    { value: "relationship", label: "Divorce or relationship breakdown", icon: "💔" },
    { value: "business", label: "Business failure or financial loss", icon: "📉" },
    { value: "personal", label: "Personal tragedy or loss", icon: "😢" },
    { value: "other", label: "Other major life challenge", icon: "🌪️" }
  ];

  const currentStatuses = [
    { value: "struggling", label: "Still struggling, seeking answers" },
    { value: "recovering", label: "In recovery, making progress" },
    { value: "transformed", label: "Fully transformed, want to help others" },
    { value: "thriving", label: "Thriving and ready to share my story" }
  ];

  const impacts = [
    { value: "inspire", label: "Inspire others facing similar challenges" },
    { value: "teach", label: "Teach practical strategies for transformation" },
    { value: "heal", label: "Help others heal from their pain" },
    { value: "empower", label: "Empower people to take action" }
  ];

  const experiences = [
    { value: "never", label: "Never written before" },
    { value: "beginner", label: "Written blogs or social posts" },
    { value: "intermediate", label: "Written articles or short pieces" },
    { value: "experienced", label: "Written books or long-form content" }
  ];

  const handleGenerateProfile = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const challengeLabel = challenges.find(c => c.value === quizData.biggestChallenge)?.label || "";
      const statusLabel = currentStatuses.find(s => s.value === quizData.currentStatus)?.label || "";
      const impactLabel = impacts.find(i => i.value === quizData.desiredImpact)?.label || "";
      
      setSuckcessProfile(`# Your SUCKcess Story Profile

Hi ${quizData.name}! 👋

Based on your responses, here's your personalized SUCKcess Story roadmap:

## Your Transformation Journey

**Your Challenge:** ${challengeLabel}

**Current Status:** ${statusLabel}

**Desired Impact:** ${impactLabel}

## Your SUCKcess Story Type: **The Phoenix Rising**

You've faced significant adversity and are on a journey of transformation. Your story has the power to inspire countless others who are facing similar challenges.

## Your 8-Step SUCKcess Roadmap:

### 1. Start by Sucking - Embrace Your Disaster
Your challenge was real and painful. That's your starting point - and it's perfect. Every master was once a disaster.

### 2. Understand Yourself - Deep Self-Discovery
Take time to understand who you were before, during, and after your challenge. What patterns emerged? What did you learn about yourself?

### 3. Choose Your Path - Define Your Direction
You're choosing to transform your pain into purpose. That decision is the turning point of your story.

### 4. Know Your Niche - Find Your Unique Angle
Your specific experience with ${challengeLabel.toLowerCase()} gives you unique insights that others need.

### 5. Cultivate Your Circle - Build Your Community
Connect with others who have faced similar challenges. Your tribe is waiting for your story.

### 6. Evolve Through Crisis - Transform the Pain
Use your challenge as fuel for growth. The crisis that broke you is also what will make you.

### 7. See It Before It Happens - Visualize Your Impact
Imagine your book in the hands of someone who needs it. See them finding hope through your words.

### 8. Serve With Your Story - Share Your Transformation
Your story isn't just about you - it's about everyone you'll help. That's your SUCKcess.

## Your Next Steps:

1. **Start Writing:** Use our AI Writing Studio to begin crafting your SUCKcess story
2. **Join the Community:** Connect with other SUCKcess authors on similar journeys
3. **Get Guidance:** Access our 2-Day Program to complete your manuscript

## Recommended Book Structure:

- **Part 1:** The Disaster (Chapters 1-2) - Your challenge and its impact
- **Part 2:** The Journey (Chapters 3-5) - Your transformation process
- **Part 3:** The Breakthrough (Chapters 6-7) - Your insights and lessons
- **Part 4:** The Mission (Chapter 8) - How you're helping others now

---

**"We do not succeed in spite of our disasters. We succeed because of them."**  
— Pauline Teo

Your disaster is not the end. It's the beginning of your SUCKcess story.

Ready to write your book?
`);
      setShowResults(true);
      toast.success("Your SUCKcess Story Profile is ready!");
    } catch (error) {
      toast.error("Failed to generate profile. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <Badge className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Free SUCKcess Story Discovery
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            What's Your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              SUCKcess Story?
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your unique transformation journey and get a personalized roadmap to turn your story into a published book
          </p>
        </div>

        {!showResults ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step 1: Name & Email */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Let's Get Started</CardTitle>
                  <CardDescription>
                    First, tell us a bit about yourself
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={quizData.name}
                      onChange={(e) => setQuizData({...quizData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={quizData.email}
                      onChange={(e) => setQuizData({...quizData, email: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground">
                      We'll send your personalized SUCKcess Story Profile to this email
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={!quizData.name.trim() || !quizData.email.trim()}
                    >
                      Next Question <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Biggest Challenge */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Biggest Challenge</CardTitle>
                  <CardDescription>
                    Every SUCKcess story begins with a challenge. What was yours?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={quizData.biggestChallenge}
                    onValueChange={(value) => setQuizData({...quizData, biggestChallenge: value})}
                  >
                    <div className="grid gap-4">
                      {challenges.map((challenge) => (
                        <div key={challenge.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                          <RadioGroupItem value={challenge.value} id={challenge.value} />
                          <Label htmlFor={challenge.value} className="flex-1 cursor-pointer flex items-center gap-3">
                            <span className="text-2xl">{challenge.icon}</span>
                            <span>{challenge.label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!quizData.biggestChallenge}
                    >
                      Next Question <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Current Status */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Where Are You Now?</CardTitle>
                  <CardDescription>
                    What's your current status in your transformation journey?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={quizData.currentStatus}
                    onValueChange={(value) => setQuizData({...quizData, currentStatus: value})}
                  >
                    <div className="grid gap-4">
                      {currentStatuses.map((status) => (
                        <div key={status.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                          <RadioGroupItem value={status.value} id={status.value} />
                          <Label htmlFor={status.value} className="flex-1 cursor-pointer">
                            {status.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(4)}
                      disabled={!quizData.currentStatus}
                    >
                      Next Question <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Desired Impact */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Desired Impact</CardTitle>
                  <CardDescription>
                    How do you want your story to help others?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={quizData.desiredImpact}
                    onValueChange={(value) => setQuizData({...quizData, desiredImpact: value})}
                  >
                    <div className="grid gap-4">
                      {impacts.map((impact) => (
                        <div key={impact.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                          <RadioGroupItem value={impact.value} id={impact.value} />
                          <Label htmlFor={impact.value} className="flex-1 cursor-pointer">
                            {impact.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(5)}
                      disabled={!quizData.desiredImpact}
                    >
                      Next Question <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Writing Experience */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Writing Experience</CardTitle>
                  <CardDescription>
                    Have you written before? (Don't worry - everyone starts somewhere!)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={quizData.writingExperience}
                    onValueChange={(value) => setQuizData({...quizData, writingExperience: value})}
                  >
                    <div className="grid gap-4">
                      {experiences.map((exp) => (
                        <div key={exp.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                          <RadioGroupItem value={exp.value} id={exp.value} />
                          <Label htmlFor={exp.value} className="flex-1 cursor-pointer">
                            {exp.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(4)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button 
                      onClick={handleGenerateProfile}
                      disabled={isGenerating || !quizData.writingExperience}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Your Profile...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Get My SUCKcess Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <CardTitle className="text-2xl">Your SUCKcess Story Profile is Ready!</CardTitle>
                    <CardDescription>Check your email for the full report</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <Streamdown>{suckcessProfile}</Streamdown>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <CardContent className="p-8 text-center space-y-6">
                <h3 className="text-2xl font-bold">Ready to Write Your SUCKcess Story?</h3>
                <p className="text-muted-foreground">
                  Join our AI-powered 2-Day Program and transform your story into a published book
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/writing-studio">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Start Writing Now
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => {
                    setShowResults(false);
                    setCurrentStep(1);
                    setQuizData({
                      name: "",
                      email: "",
                      biggestChallenge: "",
                      currentStatus: "",
                      desiredImpact: "",
                      writingExperience: ""
                    });
                  }}>
                    Take Quiz Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
