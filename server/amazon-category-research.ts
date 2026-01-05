import { invokeLLM } from "./_core/llm";

/**
 * Amazon category data with competitiveness scoring
 */
export interface CategoryAnalysis {
  category: string;
  subcategory?: string;
  competitivenessScore: number; // 1-10, lower is better (easier to rank)
  estimatedMonthlySearches: string;
  topSellerRequirement: string;
  reasoning: string;
  recommended: boolean;
}

/**
 * Research and analyze Amazon categories for a book
 * Finds the "smartest" categories (least competitive but high traffic)
 */
export async function researchAmazonCategories(params: {
  title: string;
  genre: string;
  keywords: string[];
  targetAudience: string;
  bookContent?: string;
}): Promise<CategoryAnalysis[]> {
  const prompt = `You are an Amazon KDP category research expert. Analyze and recommend the best categories for this book to become a bestseller.

**Book Information:**
- Title: "${params.title}"
- Genre: ${params.genre}
- Keywords: ${params.keywords.join(", ") || "(will be extracted from content)"}
- Target Audience: ${params.targetAudience}
${params.bookContent ? `- Book Content/Description: ${params.bookContent.substring(0, 500)}...` : ""}

**Task:**
Recommend 5-8 Amazon KDP categories that are the "smartest" choices for this book. Smart categories are:
1. **Relevant** to the book's content and genre
2. **Less competitive** (easier to rank as bestseller)
3. **High traffic** (good search volume)
4. **Specific enough** to dominate (avoid overly broad categories)

For each category, provide:
1. Full category path (e.g., "Books > Business & Money > Investing > Stocks")
2. Competitiveness score (1-10, where 1 = easiest to rank, 10 = extremely competitive)
3. Estimated monthly searches (Low/Medium/High/Very High)
4. Top seller requirement (estimated sales needed to hit #1)
5. Why this category is a smart choice
6. Whether you recommend it (true/false)

**Output Format (JSON):**
\`\`\`json
[
  {
    "category": "Books > Business & Money > Investing",
    "subcategory": "Stocks",
    "competitivenessScore": 4,
    "estimatedMonthlySearches": "High",
    "topSellerRequirement": "50-100 sales/day",
    "reasoning": "Moderately competitive but highly relevant. Good traffic with achievable ranking requirements.",
    "recommended": true
  }
]
\`\`\`

Provide your analysis as a JSON array.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Amazon KDP category research expert who helps authors find the best categories to become bestsellers." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    const categories: CategoryAnalysis[] = JSON.parse(jsonContent);
    
    // Sort by competitiveness score (lower is better)
    return categories.sort((a, b) => a.competitivenessScore - b.competitivenessScore);
  } catch (error) {
    console.error("[Category Research] Failed to analyze categories:", error);
    throw new Error("Failed to research Amazon categories. Please try again.");
  }
}

/**
 * Get detailed competitive analysis for a specific category
 */
export async function analyzeCategoryCompetition(params: {
  category: string;
  subcategory?: string;
  bookTitle: string;
  genre: string;
}): Promise<{
  competitivenessScore: number;
  topCompetitors: string[];
  rankingStrategy: string;
  estimatedTimeToRank: string;
  keySuccessFactors: string[];
}> {
  const fullCategory = params.subcategory 
    ? `${params.category} > ${params.subcategory}`
    : params.category;

  const prompt = `Analyze the competitive landscape for this Amazon KDP category.

**Category:** ${fullCategory}
**Book Title:** "${params.bookTitle}"
**Genre:** ${params.genre}

**Provide:**
1. Competitiveness score (1-10)
2. Top 3-5 current bestsellers in this category (titles)
3. Recommended ranking strategy
4. Estimated time to reach top 10 with proper marketing
5. Key success factors for this category

**Output Format (JSON):**
\`\`\`json
{
  "competitivenessScore": 5,
  "topCompetitors": ["Book Title 1", "Book Title 2", "Book Title 3"],
  "rankingStrategy": "Focus on launch week sales velocity with email list + Amazon ads targeting long-tail keywords",
  "estimatedTimeToRank": "2-4 weeks with consistent marketing",
  "keySuccessFactors": ["Strong book cover", "Compelling description", "Early reviews", "Keyword optimization"]
}
\`\`\``;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Amazon bestseller strategist." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("[Category Analysis] Failed to analyze competition:", error);
    throw new Error("Failed to analyze category competition. Please try again.");
  }
}

/**
 * Recommend optimal category combination (Amazon allows 2 categories)
 */
export async function recommendCategoryCombination(
  categories: CategoryAnalysis[]
): Promise<{
  primary: CategoryAnalysis;
  secondary: CategoryAnalysis;
  reasoning: string;
}> {
  // Filter to recommended categories only
  const recommended = categories.filter(c => c.recommended);
  
  if (recommended.length < 2) {
    throw new Error("Not enough recommended categories to create a combination");
  }

  // Sort by competitiveness (lower is better)
  const sorted = [...recommended].sort((a, b) => a.competitivenessScore - b.competitivenessScore);
  
  // Pick the two least competitive categories
  const primary = sorted[0];
  const secondary = sorted[1];

  const reasoning = `Selected "${primary.category}" as primary (competitiveness: ${primary.competitivenessScore}/10) and "${secondary.category}" as secondary (competitiveness: ${secondary.competitivenessScore}/10). This combination maximizes your chances of ranking as a bestseller in at least one category while maintaining relevance to your book's content.`;

  return {
    primary,
    secondary,
    reasoning
  };
}
