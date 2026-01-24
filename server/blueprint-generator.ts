import { invokeLLM } from "./_core/llm";
import { StoryBlueprint } from "../drizzle/schema";

/**
 * Generate comprehensive story blueprint markdown from collected data
 */
export async function generateBlueprintContent(blueprint: StoryBlueprint): Promise<string> {
  const prompt = `You are an expert story development coach. Generate a comprehensive story blueprint document in PLAIN TEXT format (NO markdown symbols like ##, **, *, etc.) based on the following data collected from an author:

**Project Type:** ${blueprint.projectType}
**Working Title:** ${blueprint.workingTitle || "Untitled"}
**Target Length:** ${blueprint.targetLength || "Not specified"}
**Target Pages:** ${blueprint.targetPages || "Not specified"}
**Target Word Count:** ${blueprint.targetPages ? (() => {
  const totalWords = blueprint.targetPages * 250;
  const chapterContent = totalWords - 2500;
  let chapters = 10;
  if (blueprint.targetPages > 175) chapters = 13;
  if (blueprint.targetPages > 225) chapters = 16;
  if (blueprint.targetPages > 275) chapters = 20;
  const wordsPerChapter = Math.round(chapterContent / chapters);
  return `${totalWords} words (${chapters} chapters × ${wordsPerChapter} words, based on 6" x 9" format)`;
})() : "Not specified"}
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
- Plan for the requested chapter length
- Include the special elements (case studies, exercises, charts, etc.)
- Integrate the call-to-action strategy
` : ''}

Generate a professional, comprehensive story blueprint with the following sections:

# Story Blueprint

## Cover Page
- Working Title
- Author Name
- Genre Classification
- Target Word Count: ${blueprint.targetPages ? (() => {
  const totalWords = blueprint.targetPages * 250;
  const chapterContent = totalWords - 2500;
  let chapters = 10;
  if (blueprint.targetPages > 175) chapters = 13;
  if (blueprint.targetPages > 225) chapters = 16;
  if (blueprint.targetPages > 275) chapters = 20;
  const wordsPerChapter = Math.round(chapterContent / chapters);
  return `${totalWords} words (${chapters} chapters × ${wordsPerChapter} words)`;
})() : "Not specified"} (for ${blueprint.targetPages || "N/A"} pages in 6" x 9" format)
- Date Created

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
Analyze the book concept and suggest 3-5 specific Amazon KDP categories (both Kindle and Paperback) where this book has the HIGHEST chance of becoming a #1 bestseller. Focus on:
1. LOW-COMPETITION categories (fewer than 1,000 books)
2. Categories where the #1 book has modest sales (achievable ranking)
3. Specific sub-categories rather than broad categories
4. Categories that perfectly match the book's genre and themes

For each suggested category, explain:
- Why this category is a good fit
- Estimated competition level (Low/Medium/High)
- What makes this book competitive in this category

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
