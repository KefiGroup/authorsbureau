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
  format?: 'kindle' | 'paperback'; // Specify format for correct category tree
}): Promise<CategoryAnalysis[]> {
  const prompt = `You are an Amazon KDP category research expert. Analyze and recommend the best categories for this book to become a bestseller.

**Book Information:**
- Title: "${params.title}"
- Genre: ${params.genre}
- Keywords: ${params.keywords.join(", ") || "(will be extracted from content)"}
- Target Audience: ${params.targetAudience}
${params.bookContent ? `- Book Content/Description: ${params.bookContent.substring(0, 500)}...` : ""}

**Format:** ${params.format === 'kindle' ? 'Kindle eBook (use "Kindle Store > Kindle eBooks > ..." category paths)' : 'Paperback (use "Books > ..." category paths)'}

**PRIMARY GOAL:** Find ULTRA-LOW-COMPETITION "hidden gem" categories where the author can become a #1 BESTSELLER with just **30 books sold in 24 hours** (or less).

**Task:**
Recommend 5-8 Amazon KDP categories that are the "smartest" choices for this ${params.format || 'book'}. Prioritize categories in this order:
1. **ULTRA-LOW COMPETITION FIRST** - Categories where 30 sales or fewer in 24 hours can hit #1 (competitiveness score 1-3)
2. **Relevant** to the book's content and genre
3. **Decent traffic** - At least 500-1000 monthly searches (avoid dead categories)
4. **Specific/niche enough** to dominate (avoid overly broad categories like "Business" or "Self-Help")

**CRITICAL:** Avoid competitive categories (score 7+). Focus on niche subcategories 3-4 levels deep in the category tree.

For each category, provide:
1. Full category path ${params.format === 'kindle' ? '(e.g., "Kindle Store > Kindle eBooks > Business & Investing > Investing > Options Trading > Day Trading")' : '(e.g., "Books > Business & Money > Investing > Options Trading > Day Trading")'} - **MUST be 3-4 levels deep for low competition**
2. Competitiveness score (1-10, where 1 = easiest to rank, 10 = extremely competitive) - **Target 1-4 only**
3. Estimated monthly searches (provide numeric range like "600-1,200/mo")
4. Top seller requirement (estimated sales in 24 hours needed to hit #1, format as "~15-30 sales in 24hr") - **Target categories requiring 30 sales or fewer in 24 hours**
5. Why this category is a LOW-COMPETITION smart choice for becoming #1 bestseller
6. Whether you recommend it (true/false) - **Only recommend if competitiveness ≤ 4**

**Output Format (JSON):**
\`\`\`json
[
  {
    "category": "${params.format === 'kindle' ? 'Kindle Store > Kindle eBooks > Business & Investing > Investing' : 'Books > Business & Money > Investing'}",
    "subcategory": "Stocks",
    "competitivenessScore": 4,
    "estimatedMonthlySearches": "High",
    "topSellerRequirement": "~20-30 sales in 24hr",
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
