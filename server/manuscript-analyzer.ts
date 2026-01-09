import { invokeLLM } from "./_core/llm";

/**
 * AI analysis result from manuscript
 */
export interface ManuscriptAnalysis {
  suggestedTitles: string[];
  suggestedSubtitles: string[];
  detectedGenre: string;
  themes: string[];
  targetAudience: string;
  bookDescription: string;
  keyBenefits: string[];
  tone: string;
  wordCount: number;
}

/**
 * Analyze manuscript and extract metadata using AI
 */
export async function analyzeManuscript(params: {
  manuscript: string;
  wordCount: number;
}): Promise<ManuscriptAnalysis> {
  // Take first 5000 words for analysis (enough to understand the book)
  const words = params.manuscript.trim().split(/\s+/);
  const sampleText = words.slice(0, 5000).join(" ");

  const prompt = `You are a senior acquisitions editor at a top New York Times bestselling publishing house (think Penguin Random House, Simon & Schuster level). You have 20+ years of experience identifying bestsellers and know exactly what makes books succeed in today's market.

Your expertise includes:
- Analyzing NYT bestseller patterns and trends
- Understanding what titles grab attention and drive sales
- Recognizing market positioning opportunities
- Knowing genre-specific conventions that work
- Identifying unique angles that differentiate books

Analyze this manuscript with the eye of an elite publisher who knows how to make books bestsellers.

**Manuscript Sample (first 5000 words):**
${sampleText}

**Total Word Count:** ${params.wordCount.toLocaleString()} words

**Your Task:**
Analyze the manuscript and provide:
1. **3-5 bestseller-caliber title options** using patterns from successful books in this genre. Think: what would catch a browser's eye in a bookstore? What would trend on Amazon?
2. **3 subtitle options** that use the "promise + proof" formula top publishers use
3. **Detected genre** (be specific, e.g., "Business & Entrepreneurship" not just "Business")
4. **5-7 main themes** covered in the book
5. **Target audience** description (who is this book for?)
6. **Book description** (2-3 paragraphs, conversion-optimized for Amazon)
7. **3-5 key benefits** readers will get from this book
8. **Tone** of the writing (e.g., "Professional and authoritative", "Conversational and friendly")

**Output Format (JSON):**
\`\`\`json
{
  "suggestedTitles": ["Title Option 1", "Title Option 2", "Title Option 3"],
  "suggestedSubtitles": ["Subtitle 1", "Subtitle 2", "Subtitle 3"],
  "detectedGenre": "Specific Genre Name",
  "themes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4", "Theme 5"],
  "targetAudience": "Detailed description of who this book is for",
  "bookDescription": "2-3 paragraph compelling description optimized for Amazon",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "tone": "Description of writing tone"
}
\`\`\``;

  try {
    console.log("[Manuscript Analyzer] Starting analysis for", params.wordCount, "words");
    
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert book publishing analyst with deep knowledge of Amazon KDP optimization." },
        { role: "user", content: prompt }
      ]
    });

    console.log("[Manuscript Analyzer] LLM response received");

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      console.error("[Manuscript Analyzer] No content in LLM response:", JSON.stringify(response));
      throw new Error("LLM returned empty response");
    }

    const content = typeof messageContent === 'string' ? messageContent : '';
    console.log("[Manuscript Analyzer] Parsing JSON from response, content length:", content.length);
    
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    console.log("[Manuscript Analyzer] JSON content extracted, length:", jsonContent.length);
    
    const analysis = JSON.parse(jsonContent);
    
    // Validate required fields
    if (!analysis.suggestedTitles || !Array.isArray(analysis.suggestedTitles) || analysis.suggestedTitles.length === 0) {
      console.error("[Manuscript Analyzer] Invalid analysis structure:", JSON.stringify(analysis));
      throw new Error("Analysis missing required fields");
    }
    
    console.log("[Manuscript Analyzer] Analysis complete, titles:", analysis.suggestedTitles.length);
    
    return {
      ...analysis,
      wordCount: params.wordCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Manuscript Analyzer] Failed to analyze manuscript:", errorMessage);
    console.error("[Manuscript Analyzer] Full error:", error);
    
    // Provide more specific error messages
    if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
      throw new Error("Failed to parse AI response. The manuscript might be too complex. Please try again or contact support.");
    } else if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
      throw new Error("Analysis timed out. Your manuscript might be very long. Please try again.");
    } else if (errorMessage.includes("rate limit")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    } else {
      throw new Error("Failed to analyze manuscript. Please try again or contact support if the problem persists.");
    }
  }
}

/**
 * Generate additional title variations based on author's preferred style
 */
export async function generateMoreTitles(params: {
  manuscript: string;
  currentTitles: string[];
  preferredStyle?: string; // e.g., "more creative", "more direct", "more professional"
}): Promise<string[]> {
  const words = params.manuscript.trim().split(/\s+/);
  const sampleText = words.slice(0, 3000).join(" ");

  const prompt = `You are a senior editor at a New York Times bestselling publishing house. Based on your deep knowledge of what makes titles successful, generate 5 MORE bestseller-worthy title options.

**Manuscript Sample:**
${sampleText}

**Existing Titles:**
${params.currentTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

${params.preferredStyle ? `**Author's Style Preference:** ${params.preferredStyle}` : ''}

Generate 5 new title options that:
- Use proven bestseller title patterns (e.g., "The [Noun] of [Noun]", "How to [Benefit]", "[Number] [Things] to [Outcome]")
- Include power words that drive clicks and sales
- Are memorable and shareable
- Stand out in the genre while following successful conventions
- Would look compelling on a book cover

**Output Format (JSON):**
\`\`\`json
{
  "titles": ["New Title 1", "New Title 2", "New Title 3", "New Title 4", "New Title 5"]
}
\`\`\``;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert book title creator." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    const result = JSON.parse(jsonContent);
    return result.titles;
  } catch (error) {
    console.error("[Title Generator] Failed to generate titles:", error);
    throw new Error("Failed to generate additional titles.");
  }
}

/**
 * Refine book description based on author feedback
 */
export async function refineDescription(params: {
  originalDescription: string;
  feedback: string; // e.g., "make it more exciting", "add more specific benefits", "shorten it"
  manuscript: string;
}): Promise<string> {
  const prompt = `Refine this book description based on the author's feedback.

**Original Description:**
${params.originalDescription}

**Author's Feedback:**
${params.feedback}

**Manuscript Context:**
${params.manuscript.slice(0, 2000)}...

Generate an improved description that incorporates the feedback while maintaining conversion optimization for Amazon.

**Output Format (JSON):**
\`\`\`json
{
  "refinedDescription": "The improved description here"
}
\`\`\``;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert book description writer." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    const result = JSON.parse(jsonContent);
    return result.refinedDescription;
  } catch (error) {
    console.error("[Description Refiner] Failed to refine description:", error);
    throw new Error("Failed to refine description.");
  }
}
