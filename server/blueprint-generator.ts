import { invokeLLM } from "./_core/llm";
import { StoryBlueprint } from "../drizzle/schema";

/**
 * Generate comprehensive story blueprint markdown from collected data
 */
export async function generateBlueprintContent(blueprint: StoryBlueprint): Promise<string> {
  const prompt = `You are an expert story development coach. Generate a comprehensive story blueprint document in markdown format based on the following data collected from an author:

**Project Type:** ${blueprint.projectType}
**Working Title:** ${blueprint.workingTitle || "Untitled"}
**Target Length:** ${blueprint.targetLength || "Not specified"}
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

Generate a professional, comprehensive story blueprint with the following sections:

# Story Blueprint

## Cover Page
- Working Title
- Author Name
- Genre Classification
- Target Word Count
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
- Suggested Amazon Categories
- Preliminary Keyword Suggestions

## Thematic Guide
- Central Themes
- Symbolic Elements
- Emotional Arc

## Writing Guidelines
Provide 3-5 specific writing tips tailored to this story's genre and style.

---

Make the blueprint professional, actionable, and inspiring. Use markdown formatting with headers, bullet points, and emphasis where appropriate.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert story development coach who helps authors create comprehensive story blueprints. Generate professional, actionable, and inspiring blueprints in markdown format.",
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
