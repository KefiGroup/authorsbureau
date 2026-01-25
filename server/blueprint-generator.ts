import { invokeLLM } from "./_core/llm";
import { StoryBlueprint } from "../drizzle/schema";

/**
 * Generate comprehensive story blueprint markdown from collected data
 */
export async function generateBlueprintContent(blueprint: StoryBlueprint, authorName?: string): Promise<string> {
  // Check if this is non-fiction and use different prompt
  if (blueprint.projectType === 'non_fiction') {
    return generateNonFictionBlueprint(blueprint, authorName);
  }
  
  const prompt = `You are an expert story development coach. Generate a comprehensive story blueprint document in PLAIN TEXT format (NO markdown symbols like ##, **, *, etc.) based on the following data collected from an author:

**Project Type:** ${blueprint.projectType}
**Working Title:** ${blueprint.workingTitle || "Untitled"}
**Target Length:** ${blueprint.targetLength || "Not specified"}
**Target Pages:** ${blueprint.targetPages || "Not specified"}
**Target Structure:** ${blueprint.targetPages ? `${blueprint.targetPages} pages in 6" x 9" format, 10-15 chapters (AI will determine optimal structure based on content)` : "Not specified"}
**Primary Genre:** ${blueprint.primaryGenre || "Not specified"}
**Secondary Genre:** ${blueprint.secondaryGenre || "Not specified"}

**Core Premise:** ${blueprint.corePremise || "Not provided"}
**Time Period:** ${blueprint.timePeriod || "Not specified"}
**Location:** ${blueprint.location || "Not specified"}
**Point of View:** ${blueprint.pointOfView || "Not specified"}

**Protagonist Data:** ${JSON.stringify(blueprint.protagonistData, null, 2)}
**Supporting Characters:** ${JSON.stringify(blueprint.supportingCharacters, null, 2)}
**Plot Structure:** ${JSON.stringify(blueprint.plotStructure, null, 2)}
**Setting Data:** ${JSON.stringify(blueprint.settingData, null, 2)}
**Audience Data:** ${JSON.stringify(blueprint.audienceData, null, 2)}
**Thematic Elements:** ${JSON.stringify(blueprint.thematicElements, null, 2)}

${blueprint.finalCheckpointData ? `**Author Preferences:**
${JSON.stringify(JSON.parse(blueprint.finalCheckpointData), null, 2)}

IMPORTANT: Incorporate the author's preferences throughout the blueprint:
- Use the specified tone and voice
- Follow the preferred writing style
- Structure the book into 10-15 chapters based on what makes the most sense for the content
- Include the special elements (case studies, exercises, charts, etc.)
- Integrate the call-to-action strategy
` : ''}

Generate a professional, comprehensive story blueprint with the following sections.

**IMPORTANT FORMATTING RULES:**
- DO NOT mention total word count anywhere in the blueprint
- DO NOT calculate or show "X words" or "X,000 words"
- ONLY show page count and chapter range (10-15 chapters)
- Focus on narrative structure, not word count metrics

# Story Blueprint

## Cover Page
- Working Title
- Author Name: ${authorName || "[Author Name Placeholder]"}
- Genre Classification
- Target Structure: ${blueprint.targetPages || "Not specified"} pages in 6" x 9" format
- Chapter Count: 10-15 chapters (AI will determine optimal structure based on content)
- Date Created: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Premise Statement
Generate a compelling one-paragraph summary of the story based on the collected data.

## Character Profiles

### Protagonist
Detailed profile including name, key traits, goal, obstacle, and character arc.

### Supporting Characters
Summaries of each supporting character with their role and relationship to the protagonist.

## Setting Overview
- Time Period Context
- Location Descriptions
- World-Building Notes (if applicable)

## Plot Outline

### Three-Act Structure
Break down the story into three acts with key plot points:
- **Act 1 (Setup):** Inciting incident and initial conflict
- **Act 2 (Confrontation):** Rising action and complications
- **Act 3 (Resolution):** Climax and resolution

### Key Plot Points
Identify 5-7 major turning points in the story.

## Audience & Market Analysis
- Target Reader Profile
- Comparable Titles
- Unique Selling Points

## Amazon KDP Bestseller Strategy
Analyze the book concept and suggest 3-5 specific Amazon KDP categories where this book has the HIGHEST chance of becoming a #1 bestseller. Focus on categories with LOW SALES BARRIERS (not just book count). Use BSR-based analysis:

1. **5-6 level deep categories** - Specific sub-categories (e.g., "Books > Self-Help > Personal Transformation > Happiness > Gratitude") not broad categories
2. **Low daily sales requirement** - Categories where the current #1 book has a BSR indicating modest daily sales (e.g., BSR 50,000-100,000 = 3-8 sales/day)
3. **Achievable sales targets** - Calculate realistic targets like "20-33 sales in 24hr to beat leader" or "30-50 sales in 24hr for safer margin"
4. **Perfect content match** - Categories that legitimately fit the book's genre, themes, and target audience

For each suggested category, provide:
- Full category path (5-6 levels deep)
- Current leader's estimated BSR range (e.g., "50,000-80,000")
- Minimum sales target to beat leader (daily sales + 30%)
- Why this category has low competition and high feasibility
- Competitiveness score (1-10, where 10 = easiest to rank)

## Preliminary Keyword Suggestions
Suggest 7 highly targeted keywords based on the suggested categories

## Thematic Guide
- Central Themes
- Symbolic Elements
- Emotional Arc

## Writing Guidelines
Provide 3-5 specific writing tips tailored to this story's genre and style.

---

Make the blueprint professional, actionable, and inspiring. IMPORTANT: Use PLAIN TEXT only - NO markdown symbols (##, **, *, etc.). Use line breaks and indentation for structure instead.`;

  const response = await invokeLLM({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert story development coach who helps authors create comprehensive story blueprints. Generate professional, actionable, and inspiring blueprints in PLAIN TEXT format (NO markdown symbols like ##, **, *, etc.). Use line breaks and indentation for structure.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Generate non-fiction book blueprint with educational structure
 */
async function generateNonFictionBlueprint(blueprint: StoryBlueprint, authorName?: string): Promise<string> {
  const targetPages = blueprint.targetPages || 150;
  const wordsPerPage = 250; // Standard 6x9 format
  const targetWords = targetPages * wordsPerPage;
  const minChapters = 10;
  const maxChapters = 15;
  const wordsPerChapter = Math.floor(targetWords / ((minChapters + maxChapters) / 2));

  const prompt = `You are an expert non-fiction book development coach specializing in educational content structure. Generate a comprehensive book blueprint in PLAIN TEXT format (NO markdown symbols like ##, **, *, etc.) based on the following data:

**Project Type:** Non-Fiction Educational Book
**Working Title:** ${blueprint.workingTitle || "Untitled"}
**Target Pages:** ${targetPages} pages (6" x 9" format)
**Target Word Count:** ${targetWords.toLocaleString()} words total
**Words Per Chapter:** Approximately ${wordsPerChapter.toLocaleString()} words per chapter
**Chapter Count:** ${minChapters}-${maxChapters} chapters
**Primary Genre:** ${blueprint.primaryGenre || "Not specified"}
**Secondary Genre:** ${blueprint.secondaryGenre || "Not specified"}

**Core Topic/Premise:** ${blueprint.corePremise || "Not provided"}
**Target Audience:** ${JSON.stringify(blueprint.audienceData, null, 2)}
**Thematic Elements:** ${JSON.stringify(blueprint.thematicElements, null, 2)}

${blueprint.finalCheckpointData ? `**Author Preferences:**
${JSON.stringify(JSON.parse(blueprint.finalCheckpointData), null, 2)}

IMPORTANT: Incorporate the author's preferences throughout the blueprint:
- Use the specified tone and voice
- Follow the preferred writing style
- Include the special elements (case studies, exercises, charts, etc.)
- Integrate the call-to-action strategy
` : ''}

Generate a professional, comprehensive non-fiction book blueprint with the following sections.

**CRITICAL PAGE COUNT ENFORCEMENT:**
- Total book MUST be exactly ${targetPages} pages (${targetWords.toLocaleString()} words)
- Each chapter should be approximately ${wordsPerChapter.toLocaleString()} words
- DO NOT exceed the target page count
- Structure content to fit within the page limit

**IMPORTANT FORMATTING RULES:**
- Use PLAIN TEXT only - NO markdown symbols (##, **, *, etc.)
- Use line breaks and indentation for structure
- Focus on educational progression, not narrative storytelling

# Non-Fiction Book Blueprint

## Cover Page
- Working Title
- Author Name: ${authorName || "[Author Name Placeholder]"}
- Genre Classification
- Target Structure: ${targetPages} pages in 6" x 9" format
- Chapter Count: ${minChapters}-${maxChapters} chapters
- Total Word Count: ${targetWords.toLocaleString()} words
- Words Per Chapter: ~${wordsPerChapter.toLocaleString()} words
- Date Created: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Book Overview
Generate a compelling one-paragraph summary of what readers will learn from this book.

## Target Audience Profile
- Demographics (age, profession, income level)
- Current challenges and pain points
- Goals and aspirations
- Reading preferences

## Learning Objectives
List 5-7 specific, measurable outcomes readers will achieve after reading this book.

## Chapter-by-Chapter Outline

For each of the ${minChapters}-${maxChapters} chapters, provide:
1. **Chapter Title** (compelling and benefit-driven)
2. **Chapter Purpose** (what readers will learn)
3. **Key Concepts** (3-5 main ideas to cover)
4. **Teaching Progression** (how concepts build on each other)
5. **Practical Elements** (exercises, case studies, examples)
6. **Word Count Target** (~${wordsPerChapter.toLocaleString()} words)

Ensure chapters follow a logical educational progression:
- Introduction chapters (1-2): Foundation and context
- Core teaching chapters (3-${maxChapters - 2}): Main concepts and frameworks
- Application chapters (${maxChapters - 1}-${maxChapters}): Implementation and next steps

## Content Structure Guidelines

### Front Matter (included in page count)
- Title Page
- Copyright Page
- Dedication (optional)
- Table of Contents
- Introduction/Preface

### Main Content
- ${minChapters}-${maxChapters} educational chapters
- Each chapter includes:
  * Opening hook or story
  * Core teaching content
  * Examples and case studies
  * Practical exercises or action steps
  * Chapter summary

### Back Matter (included in page count)
- Conclusion
- Call to Action
- About the Author
- Resources/Bibliography (if applicable)

## Amazon KDP Bestseller Strategy
Analyze the book concept and suggest 3-5 specific Amazon KDP categories where this book has the HIGHEST chance of becoming a #1 bestseller. Focus on categories with LOW SALES BARRIERS:

1. **5-6 level deep categories** - Specific sub-categories
2. **Low daily sales requirement** - Categories where #1 has BSR 50,000-100,000 (3-8 sales/day)
3. **Achievable sales targets** - Calculate realistic targets (20-50 sales in 24hr)
4. **Perfect content match** - Categories that fit the book's topic and audience

For each category, provide:
- Full category path (5-6 levels deep)
- Current leader's estimated BSR range
- Minimum sales target to beat leader
- Why this category has low competition
- Competitiveness score (1-10, where 10 = easiest)

## Keyword Strategy
Suggest 7 highly targeted keywords based on:
- Topic relevance
- Search volume
- Competition level
- Category alignment

## Unique Value Proposition
- What makes this book different from competitors?
- Why should readers choose this book?
- What unique insights or frameworks does it offer?

## Writing Guidelines
Provide 5-7 specific writing tips for non-fiction educational content:
- Tone and voice recommendations
- How to balance theory and practice
- Storytelling techniques for non-fiction
- How to make complex concepts accessible
- Engagement strategies

---

Make the blueprint professional, actionable, and inspiring. Remember: PLAIN TEXT only, NO markdown symbols.`;

  const response = await invokeLLM({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert non-fiction book development coach who helps authors create comprehensive educational book blueprints. Generate professional, actionable blueprints in PLAIN TEXT format (NO markdown symbols). Focus on educational structure, learning progression, and strict adherence to page count targets.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content : "";
}
