import { invokeLLM } from "./_core/llm";

/**
 * Amazon category data with competitiveness scoring
 */
export interface CategoryAnalysis {
  category: string;
  subcategory?: string;
  competitivenessScore: number; // 1-10, lower is better (easier to rank)
  estimatedMonthlySearches: string;
  currentLeaderBSR?: string; // Current #1 book's BSR range
  minimumSalesTarget?: string; // Minimum sales needed (leader + 30%)
  saferSalesTarget?: string; // Safer sales target (leader + 100%)
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
  const prompt = `ROLE:
You are an Amazon KDP category-intelligence agent. Your job is to identify the lowest-competition Amazon ${params.format === 'kindle' ? 'Kindle' : 'Paperback'} categories where this book can legitimately compete for a bestseller ranking. Be Creative, yet legitimate fitting into the bestseller BSR with the MOST confidence.

INPUT:
**Book Information:**
- Title: "${params.title}"
- Genre: ${params.genre}
- Keywords: ${params.keywords.join(", ") || "(will be extracted from content)"}
- Target Audience: ${params.targetAudience}
${params.bookContent ? `- Full Book Manuscript: ${params.bookContent.substring(0, 1000)}...` : ""}

**Format:** ${params.format === 'kindle' ? 'Kindle eBook (use "Kindle Store > Kindle eBooks > ..." category paths)' : 'Paperback (use "Books > ..." category paths)'}

TASKS (EXECUTE IN THIS ORDER):

1️⃣ CONTENT CLASSIFICATION
Analyze the manuscript and classify it across:
- Primary subject matter
- Secondary themes
- Reader intent (academic / practical / reflective / instructional)
- Level (general / student / professional / academic)
Output a concise taxonomy profile of the book.

2️⃣ AMAZON CATEGORY MATCHING
Using Amazon KDP's actual category structure (not theoretical ones):
- **CRITICAL: ONLY return categories that are 5-6 levels deep. DO NOT return shallow 2-3 level categories.**
- Examples of CORRECT depth:
  * "Books > Self-Help > Personal Transformation > Happiness > Gratitude"
  * "Books > Politics & Social Sciences > Philosophy > Epistemology > Theory of Knowledge"
  * "Books > Health, Fitness & Dieting > Mental Health > Anxiety Disorders > Phobias"
- Be CREATIVE about category matching while staying 100% legitimate
- **ABSOLUTE RULE: NEVER recommend these categories regardless of content:**
  * Books > Business & Money (any subcategory)
  * Books > Self-Help > Success (any subcategory)
  * Books > Computers & Technology > AI & Machine Learning
  * Any category with "Business", "Entrepreneurship", "Leadership" in the path
- Only include categories that:
  * Are EXACTLY 5-6 levels deep (count the > symbols)
  * Match the book's content creatively yet legitimately
  * Exist in Amazon KDP's actual taxonomy

3️⃣ COMPETITION INTELLIGENCE & BSR CALCULATION
For EACH eligible category, calculate sales needed using this methodology:

**Step 1:** Identify the current bestselling book's overall Kindle Store BSR (not subcategory rank)

**Step 2:** Convert BSR to daily sales using this table:
- BSR 1-100 → 500-5,000 sales/day
- BSR 101-1,000 → 80-500 sales/day
- BSR 1,001-5,000 → 30-80 sales/day
- BSR 5,001-10,000 → 20-30 sales/day
- BSR 10,001-25,000 → 10-20 sales/day
- BSR 25,001-50,000 → 6-12 sales/day
- BSR 50,001-100,000 → 3-8 sales/day
- BSR 100,001-200,000 → 1-4 sales/day
- BSR 200,000+ → 0-2 sales/day

**Step 3:** Calculate "beat the leader" targets:
- Minimum plan: current bestseller's daily sales + 30%
- Safer plan: current bestseller's daily sales + 100% (double)

**Step 4:** Check top 5 books (not just the bestseller) - the lowest BSR among top 5 is the real target

**Step 5:** Only showcase competition level as:
- Very Low: <10 sales/day needed

Use historical Amazon category behavior patterns (not speculation).

4️⃣ BESTSELLER FEASIBILITY SCORING
Score each category on a 0–100 scale, where:
- 100 = extremely easy to become bestseller
- 0 = unrealistic
Factors to weigh:
- Category depth
- Typical sales velocity
- Presence of active launches
- Academic vs commercial dominance

5️⃣ FINAL RECOMMENDATION
Output ONLY:

**Top 6 BEST categories to target for bestseller status** (user will select 3)
For each category, you MUST include ALL of these fields:
- Full Amazon category path (MUST be 5-6 levels deep)
- Current leader BSR (e.g., "50,000-80,000")
- Minimum sales target in 24hr (leader + 30%, e.g., "20-33 sales in 24hr")
- Safer sales target in 24hr (leader + 100%, e.g., "30-50 sales in 24hr")
- Top seller requirement (e.g., "20-50 sales in 24hr for bestseller chance")
- Feasibility score (0-100)
- Why this category is strategically soft

**DO NOT include "Categories to AVOID" section. Only return usable categories.**
**DO NOT skip any fields. All BSR calculation fields are REQUIRED.**

RULES:
- Do NOT invent categories
- Do NOT recommend Business, Self-Help, or AI categories unless competition is demonstrably low
- Use tables + bullet points format
- Be precise. No marketing language.

OUTPUT FORMAT:
- Do NOT invent categories
- Do NOT recommend Business, Self-Help, or AI categories unless competition is demonstrably low
- Prioritize legitimacy + ease, not prestige
- Assume the author wants a repeatable bestseller system
- If historical bestseller examples are provided, reverse-engineer the category logic

**Output Format (JSON):**
\`\`\`json
[
  {
    "category": "${params.format === 'kindle' ? 'Kindle Store > Kindle eBooks > Education & Reference > Study Guides' : 'Books > Education & Reference > Study Guides'}",
    "subcategory": "Test Preparation",
    "competitivenessScore": 85,
    "estimatedMonthlySearches": "1,200-2,000/mo",
    "currentLeaderBSR": "50,000-80,000",
    "minimumSalesTarget": "20-33 sales in 24hr (leader + 30%)",
    "saferSalesTarget": "30-50 sales in 24hr (leader + 100%)",
    "topSellerRequirement": "20-50 sales in 24hr for bestseller chance",
    "reasoning": "Low competition niche with decent traffic. Category depth (4 levels) reduces competition. Strategically soft due to minimal active launches.",
    "recommended": true
  }
]
\`\`\`

Provide your analysis as a JSON array. Focus on categories with competitivenessScore 7-10 (higher = easier to rank).`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Amazon KDP category-intelligence agent specializing in finding lowest-competition categories with highest chance of bestseller status. You analyze book content deeply and recommend only legitimate, achievable categories based on historical Amazon data." },
        { role: "user", content: prompt }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    let categories: CategoryAnalysis[];
    try {
      categories = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('[Category Research] Failed to parse JSON:', parseError);
      console.error('[Category Research] Raw content:', content.substring(0, 500));
      throw new Error("AI returned invalid format. Please try again.");
    }
    
    // Debug: Log the raw categories to see what AI returned
    console.log('[Category Research] Raw AI response:', JSON.stringify(categories, null, 2));
    
    // Deduplicate categories by full path (category + subcategory)
    const uniqueCategories = categories.reduce((acc, current) => {
      const fullPath = current.subcategory 
        ? `${current.category} > ${current.subcategory}`
        : current.category;
      
      // Check if this full path already exists
      const exists = acc.some(cat => {
        const existingPath = cat.subcategory
          ? `${cat.category} > ${cat.subcategory}`
          : cat.category;
        return existingPath === fullPath;
      });
      
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as CategoryAnalysis[]);
    
    // Sort by competitiveness score (higher is better - easier to rank)
    return uniqueCategories.sort((a, b) => b.competitivenessScore - a.competitivenessScore);
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
