import { invokeLLM } from "./_core/llm";

/**
 * Optimized book listing metadata for Amazon KDP
 */
export interface OptimizedListing {
  title: string;
  subtitle?: string;
  description: string;
  keywords: string[];
  authorBio: string;
  seriesName?: string;
}

/**
 * Generate optimized book title for Amazon search
 */
export async function generateOptimizedTitle(params: {
  originalTitle: string;
  genre: string;
  targetAudience: string;
  mainBenefit: string;
  keywords: string[];
}): Promise<{ title: string; subtitle: string; reasoning: string }> {
  const prompt = `You are an Amazon KDP title optimization expert. Create a bestseller-optimized title and subtitle.

**Original Title:** "${params.originalTitle}"
**Genre:** ${params.genre}
**Target Audience:** ${params.targetAudience}
**Main Benefit:** ${params.mainBenefit}
**Keywords to Include:** ${params.keywords.join(", ")}

**Requirements:**
1. Title should be attention-grabbing and include primary keyword
2. Subtitle should clarify the benefit and include secondary keywords
3. Total length: Title (60 chars max) + Subtitle (140 chars max)
4. Follow Amazon bestseller title patterns for the genre
5. Be specific about the transformation or outcome
6. Use power words that drive clicks

**Output Format (JSON):**
\`\`\`json
{
  "title": "Optimized Main Title",
  "subtitle": "Benefit-Driven Subtitle with Keywords",
  "reasoning": "Explanation of optimization strategy"
}
\`\`\``;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Amazon KDP title optimization expert." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("[Title Optimizer] Failed to generate title:", error);
    throw new Error("Failed to generate optimized title. Please try again.");
  }
}

/**
 * Generate conversion-optimized book description for Amazon
 */
export async function generateOptimizedDescription(params: {
  title: string;
  genre: string;
  targetAudience: string;
  keyBenefits: string[];
  outline: string;
  authorCredentials?: string;
}): Promise<{ description: string; htmlDescription: string }> {
  const prompt = `You are an Amazon KDP copywriting expert. Write a high-converting book description.

**Book Title:** "${params.title}"
**Genre:** ${params.genre}
**Target Audience:** ${params.targetAudience}
**Key Benefits:** ${params.keyBenefits.join(", ")}
**Book Outline:** ${params.outline}
${params.authorCredentials ? `**Author Credentials:** ${params.authorCredentials}` : ''}

**Requirements:**
1. Hook: Start with a compelling question or problem statement
2. Promise: Clearly state the transformation readers will experience
3. Proof: Include credibility indicators (author background, methodology)
4. Preview: Highlight 3-5 key takeaways or chapters
5. Call-to-Action: End with urgency and clear next step
6. Length: 2000-4000 characters (Amazon's sweet spot)
7. Format: Use short paragraphs, bullet points, and bold text for scannability
8. SEO: Naturally incorporate relevant keywords

**Output Format (JSON):**
\`\`\`json
{
  "description": "Plain text version",
  "htmlDescription": "HTML formatted version with <b>, <i>, <br>, <ul>, <li> tags"
}
\`\`\``;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Amazon KDP copywriting expert who writes descriptions that convert browsers into buyers." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("[Description Optimizer] Failed to generate description:", error);
    throw new Error("Failed to generate optimized description. Please try again.");
  }
}

/**
 * Research and generate optimal keywords for Amazon KDP
 */
export async function generateOptimizedKeywords(params: {
  title: string;
  genre: string;
  targetAudience: string;
  mainTopics: string[];
}): Promise<{ keywords: string[]; reasoning: string }> {
  const prompt = `You are an Amazon KDP keyword research expert. Generate 7 optimal keywords for this book.

**Book Title:** "${params.title}"
**Genre:** ${params.genre}
**Target Audience:** ${params.targetAudience}
**Main Topics:** ${params.mainTopics.join(", ")}

**Requirements:**
1. Amazon allows 7 keyword phrases (each can be multiple words)
2. Focus on buyer-intent keywords (what people search when ready to buy)
3. Include long-tail keywords (3-5 words) for easier ranking
4. Avoid overly competitive single words
5. Mix of high-volume and low-competition keywords
6. Don't repeat words already in title/subtitle
7. Research actual Amazon search terms in this genre

**Output Format (JSON):**
\`\`\`json
{
  "keywords": [
    "keyword phrase 1",
    "keyword phrase 2",
    "keyword phrase 3",
    "keyword phrase 4",
    "keyword phrase 5",
    "keyword phrase 6",
    "keyword phrase 7"
  ],
  "reasoning": "Explanation of keyword strategy"
}
\`\`\``;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Amazon KDP keyword research expert." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("[Keyword Optimizer] Failed to generate keywords:", error);
    throw new Error("Failed to generate optimized keywords. Please try again.");
  }
}

/**
 * Generate complete optimized listing for Amazon KDP
 */
export async function generateCompleteListing(params: {
  originalTitle: string;
  genre: string;
  targetAudience: string;
  mainBenefit: string;
  keyBenefits: string[];
  outline: string;
  authorName: string;
  authorBio?: string;
}): Promise<OptimizedListing> {
  // Generate title and subtitle
  const titleResult = await generateOptimizedTitle({
    originalTitle: params.originalTitle,
    genre: params.genre,
    targetAudience: params.targetAudience,
    mainBenefit: params.mainBenefit,
    keywords: params.keyBenefits.slice(0, 3) // Use top 3 benefits as keywords
  });

  // Generate keywords
  const keywordResult = await generateOptimizedKeywords({
    title: titleResult.title,
    genre: params.genre,
    targetAudience: params.targetAudience,
    mainTopics: params.keyBenefits
  });

  // Generate description
  const descriptionResult = await generateOptimizedDescription({
    title: `${titleResult.title}: ${titleResult.subtitle}`,
    genre: params.genre,
    targetAudience: params.targetAudience,
    keyBenefits: params.keyBenefits,
    outline: params.outline,
    authorCredentials: params.authorBio
  });

  // Generate author bio if not provided
  let authorBio = params.authorBio || "";
  if (!authorBio) {
    const bioPrompt = `Write a brief, credible author bio (2-3 sentences) for ${params.authorName}, author of "${titleResult.title}" in the ${params.genre} genre. Focus on expertise and authority in this topic.`;
    
    const bioResponse = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional author bio writer." },
        { role: "user", content: bioPrompt }
      ]
    });

    const bioContent = bioResponse.choices[0]?.message?.content;
    authorBio = typeof bioContent === 'string' ? bioContent : `${params.authorName} is an author and expert in ${params.genre}.`;
  }

  return {
    title: titleResult.title,
    subtitle: titleResult.subtitle,
    description: descriptionResult.htmlDescription, // Use HTML version for Amazon
    keywords: keywordResult.keywords,
    authorBio: authorBio
  };
}
