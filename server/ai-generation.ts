import { invokeLLM } from "./_core/llm";

/**
 * Generate a complete book outline based on the SUCKcess Story framework
 */
export async function generateBookOutline(storyData: {
  disasterMoment: string;
  transformation: string;
  currentState: string;
  lessonLearned: string;
  targetAudience: string;
  uniqueAngle: string;
}) {
  const prompt = `You are an expert book coach specializing in the SUCKcess Theory framework - helping people transform their disasters into published books.

Based on the following information about the author's story, generate a complete book outline following the 8-chapter SUCKcess Theory structure:

**Author's Disaster Moment:** ${storyData.disasterMoment}

**Transformation Journey:** ${storyData.transformation}

**Current State:** ${storyData.currentState}

**Core Lesson:** ${storyData.lessonLearned}

**Target Audience:** ${storyData.targetAudience}

**Unique Angle:** ${storyData.uniqueAngle}

Generate a comprehensive book outline that includes:

1. **3 compelling book title suggestions** that capture the transformation journey
2. **8 chapter outlines** based on the SUCKcess Theory framework:
   - Chapter 1: Start by Sucking - The Disaster
   - Chapter 2: Understanding Myself - Self-Discovery
   - Chapter 3: Choosing My Path - The Decision
   - Chapter 4: Knowing My Niche - Finding My Angle
   - Chapter 5: Cultivating My Circle - Building Community
   - Chapter 6: Evolving Through Crisis - The Transformation
   - Chapter 7: Seeing the Future - Visualization
   - Chapter 8: Serving Others - The Mission

For each chapter, provide:
- A compelling chapter title
- 3-4 key points to cover
- Suggested stories or examples to include
- Emotional arc for that chapter

3. **Target Reader Profile** - who will benefit most from this book
4. **Core Message** - the one thing readers should remember

Format the response in clear markdown with headers and bullet points.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert book coach specializing in transformation stories and the SUCKcess Theory framework. You help authors structure their personal journeys into compelling, publishable books."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : "";
}

/**
 * Generate a personalized SUCKcess Story Profile based on quiz responses
 */
export async function generateSuckcessProfile(quizData: {
  name: string;
  biggestChallenge: string;
  currentStatus: string;
  desiredImpact: string;
  writingExperience: string;
}) {
  const challengeLabels: Record<string, string> = {
    career: "Career setback or job loss",
    health: "Health crisis or chronic illness",
    relationship: "Divorce or relationship breakdown",
    business: "Business failure or financial loss",
    personal: "Personal tragedy or loss",
    other: "Major life challenge"
  };

  const statusLabels: Record<string, string> = {
    struggling: "Still struggling, seeking answers",
    recovering: "In recovery, making progress",
    transformed: "Fully transformed, want to help others",
    thriving: "Thriving and ready to share my story"
  };

  const impactLabels: Record<string, string> = {
    inspire: "Inspire others facing similar challenges",
    teach: "Teach practical strategies for transformation",
    heal: "Help others heal from their pain",
    empower: "Empower people to take action"
  };

  const experienceLabels: Record<string, string> = {
    never: "Never written before",
    beginner: "Written blogs or social posts",
    intermediate: "Written articles or short pieces",
    experienced: "Written books or long-form content"
  };

  const challenge = challengeLabels[quizData.biggestChallenge] || quizData.biggestChallenge;
  const status = statusLabels[quizData.currentStatus] || quizData.currentStatus;
  const impact = impactLabels[quizData.desiredImpact] || quizData.desiredImpact;
  const experience = experienceLabels[quizData.writingExperience] || quizData.writingExperience;

  const prompt = `Generate a personalized SUCKcess Story Profile for ${quizData.name}.

**Their Challenge:** ${challenge}
**Current Status:** ${status}
**Desired Impact:** ${impact}
**Writing Experience:** ${experience}

Create a warm, encouraging profile that:

1. **Identifies their SUCKcess Story Type** (give it a compelling name like "The Phoenix Rising" or "The Comeback Champion")
2. **Explains their transformation journey** and why their story matters
3. **Maps their story to the 8-Step SUCKcess Framework:**
   - Step 1: Start by Sucking - Embrace Your Disaster
   - Step 2: Understand Yourself - Deep Self-Discovery
   - Step 3: Choose Your Path - Define Your Direction
   - Step 4: Know Your Niche - Find Your Unique Angle
   - Step 5: Cultivate Your Circle - Build Your Community
   - Step 6: Evolve Through Crisis - Transform the Pain
   - Step 7: See It Before It Happens - Visualize Your Impact
   - Step 8: Serve With Your Story - Share Your Transformation

For each step, provide 2-3 sentences of personalized guidance based on their specific challenge and status.

4. **Recommended Book Structure** (4 parts, 8 chapters total)
5. **Next Steps** - 3 concrete actions they should take

End with the SUCKcess Theory quote: "We do not succeed in spite of our disasters. We succeed because of them." - Pauline Teo

Format in markdown with clear headers and an encouraging, empowering tone.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a compassionate book coach who specializes in helping people discover and write their transformation stories using the SUCKcess Theory framework. Your tone is warm, encouraging, and empowering."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : "";
}

/**
 * Generate a chapter draft based on outline and context
 */
export async function generateChapterDraft(params: {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterOutline: string;
  previousChapterSummary?: string;
  authorVoiceNotes?: string;
}) {
  const prompt = `You are a professional ghostwriter helping an author write their transformation story.

**Book Title:** ${params.bookTitle}
**Chapter ${params.chapterNumber}:** ${params.chapterTitle}

**Chapter Outline:**
${params.chapterOutline}

${params.previousChapterSummary ? `**Previous Chapter Summary:**\n${params.previousChapterSummary}\n` : ""}

${params.authorVoiceNotes ? `**Author's Voice/Style Notes:**\n${params.authorVoiceNotes}\n` : ""}

Write a complete first draft of this chapter (approximately 2000-2500 words) that:

1. Opens with a compelling hook that draws readers in
2. Follows the outline provided while adding vivid details and emotional depth
3. Uses storytelling techniques: show don't tell, sensory details, dialogue where appropriate
4. Maintains a personal, authentic voice
5. Connects to the SUCKcess Theory framework naturally
6. Ends with a transition to the next chapter

Write in first person, present tense for vivid storytelling, then past tense for reflection. Use short paragraphs for readability. Be vulnerable and honest - this is a transformation story.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert ghostwriter specializing in memoir and transformation stories. You write with emotional depth, authenticity, and compelling narrative structure."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : "";
}
