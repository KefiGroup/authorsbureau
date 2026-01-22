/**
 * Blueprint Transformer
 * 
 * Transforms storyBlueprint data into formats expected by downstream features
 * (ReadyToPublish, Cover Generation, KDP Optimizer, etc.)
 */

import { StoryBlueprint } from "../drizzle/schema";

/**
 * AIAnalysis interface from ReadyToPublish.tsx
 */
export interface AIAnalysis {
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
 * Transform blueprint data to AIAnalysis format for ReadyToPublish
 */
export function blueprintToAIAnalysis(blueprint: StoryBlueprint): AIAnalysis {
  // Extract word count from targetLength (e.g., "90,000 words" → 90000)
  const wordCountMatch = blueprint.targetLength?.match(/(\d+(?:,\d+)*)\s*words?/i);
  const wordCount = wordCountMatch 
    ? parseInt(wordCountMatch[1].replace(/,/g, ''), 10) 
    : 80000; // Default to 80k if not specified

  // Extract themes from thematicElements
  const themes = blueprint.thematicElements && (blueprint.thematicElements as any).centralTheme
    ? [(blueprint.thematicElements as any).centralTheme]
    : [];

  // Extract target audience from audienceData
  const targetAudience = blueprint.audienceData
    ? (blueprint.audienceData as any).targetReader || "General readers"
    : "General readers";

  // Extract tone from thematicElements
  const tone = blueprint.thematicElements
    ? (blueprint.thematicElements as any).emotionalJourney || "Engaging"
    : "Engaging";

  // Generate book description from premise and themes
  const bookDescription = generateBookDescription(blueprint);

  // Generate key benefits from unique angle
  const keyBenefits = generateKeyBenefits(blueprint);

  // Generate subtitle suggestions from premise
  const suggestedSubtitles = generateSubtitleSuggestions(blueprint);

  return {
    suggestedTitles: [blueprint.workingTitle || "Untitled"],
    suggestedSubtitles,
    detectedGenre: blueprint.primaryGenre || "General Fiction",
    themes,
    targetAudience,
    bookDescription,
    keyBenefits,
    tone,
    wordCount,
  };
}

/**
 * Generate book description from blueprint data
 */
function generateBookDescription(blueprint: StoryBlueprint): string {
  const parts: string[] = [];

  // Add core premise
  if (blueprint.corePremise) {
    parts.push(blueprint.corePremise);
  }

  // Add protagonist context
  if (blueprint.protagonistData) {
    const protag = blueprint.protagonistData as any;
    if (protag.name && protag.goal) {
      parts.push(`Follow ${protag.name} as they ${protag.goal}.`);
    }
  }

  // Add thematic context
  if (blueprint.thematicElements) {
    const thematic = blueprint.thematicElements as any;
    if (thematic.centralTheme) {
      parts.push(`A story about ${thematic.centralTheme.toLowerCase()}.`);
    }
  }

  // Add setting context
  if (blueprint.settingData) {
    const setting = blueprint.settingData as any;
    if (setting.locations && setting.locations.length > 0) {
      parts.push(`Set in ${setting.locations.join(", ")}.`);
    }
  }

  return parts.join(" ") || "A compelling story that will captivate readers.";
}

/**
 * Generate key benefits from blueprint data
 */
function generateKeyBenefits(blueprint: StoryBlueprint): string[] {
  const benefits: string[] = [];

  // Add unique angle as benefit
  if (blueprint.audienceData) {
    const audience = blueprint.audienceData as any;
    if (audience.uniqueAngle) {
      benefits.push(audience.uniqueAngle);
    }
  }

  // Add thematic benefits
  if (blueprint.thematicElements) {
    const thematic = blueprint.thematicElements as any;
    if (thematic.centralTheme) {
      benefits.push(`Explores ${thematic.centralTheme.toLowerCase()}`);
    }
  }

  // Add character-driven benefit
  if (blueprint.protagonistData) {
    const protag = blueprint.protagonistData as any;
    if (protag.name) {
      benefits.push(`Features compelling character development`);
    }
  }

  return benefits.length > 0 ? benefits : ["Engaging storytelling", "Memorable characters", "Thought-provoking themes"];
}

/**
 * Generate subtitle suggestions from blueprint data
 */
function generateSubtitleSuggestions(blueprint: StoryBlueprint): string[] {
  const subtitles: string[] = [];

  // Generate from premise
  if (blueprint.corePremise) {
    subtitles.push(blueprint.corePremise);
  }

  // Generate from themes
  if (blueprint.thematicElements) {
    const thematic = blueprint.thematicElements as any;
    if (thematic.centralTheme) {
      subtitles.push(`A Story of ${thematic.centralTheme}`);
    }
  }

  // Generate from genre and setting
  if (blueprint.primaryGenre && blueprint.settingData) {
    const setting = blueprint.settingData as any;
    if (setting.locations && setting.locations.length > 0) {
      subtitles.push(`A ${blueprint.primaryGenre} Tale Set in ${setting.locations[0]}`);
    }
  }

  return subtitles.length > 0 ? subtitles : [];
}

/**
 * Generate cover prompt from blueprint data
 */
export function blueprintToCoverPrompt(blueprint: StoryBlueprint): {
  bookTitle: string;
  genre: string;
  themes: string[];
  targetAudience: string;
  additionalContext: string;
} {
  const themes = blueprint.thematicElements && (blueprint.thematicElements as any).centralTheme
    ? [(blueprint.thematicElements as any).centralTheme]
    : [];

  const targetAudience = blueprint.audienceData
    ? (blueprint.audienceData as any).targetReader || "General readers"
    : "General readers";

  // Build additional context from setting and tone
  const contextParts: string[] = [];
  
  if (blueprint.settingData) {
    const setting = blueprint.settingData as any;
    if (setting.locations && setting.locations.length > 0) {
      contextParts.push(`Set in ${setting.locations.join(", ")}`);
    }
    if (setting.timePeriod) {
      contextParts.push(`Time period: ${setting.timePeriod}`);
    }
  }

  if (blueprint.thematicElements) {
    const thematic = blueprint.thematicElements as any;
    if (thematic.emotionalJourney) {
      contextParts.push(`Tone: ${thematic.emotionalJourney}`);
    }
  }

  if (blueprint.corePremise) {
    contextParts.push(`Story: ${blueprint.corePremise}`);
  }

  return {
    bookTitle: blueprint.workingTitle || "Untitled",
    genre: blueprint.primaryGenre || "General Fiction",
    themes,
    targetAudience,
    additionalContext: contextParts.join(". "),
  };
}

/**
 * Generate KDP metadata from blueprint data
 */
export function blueprintToKDPMetadata(blueprint: StoryBlueprint): {
  title: string;
  description: string;
  categories: string[];
  keywords: string[];
  targetAudience: string;
  comparableTitles: string[];
} {
  // Extract comparable titles from audienceData
  const comparableTitles = blueprint.audienceData
    ? (blueprint.audienceData as any).comparableTitles || []
    : [];

  // Generate keywords from themes and genre
  const keywords: string[] = [];
  
  if (blueprint.thematicElements) {
    const thematic = blueprint.thematicElements as any;
    if (thematic.centralTheme) {
      keywords.push(thematic.centralTheme);
    }
    if (thematic.recurringSymbols && Array.isArray(thematic.recurringSymbols)) {
      keywords.push(...thematic.recurringSymbols.slice(0, 3));
    }
  }

  if (blueprint.primaryGenre) {
    keywords.push(blueprint.primaryGenre);
  }

  if (blueprint.secondaryGenre) {
    keywords.push(blueprint.secondaryGenre);
  }

  // Add protagonist name if available
  if (blueprint.protagonistData) {
    const protag = blueprint.protagonistData as any;
    if (protag.traits && Array.isArray(protag.traits)) {
      keywords.push(...protag.traits.slice(0, 2));
    }
  }

  // Build categories from genres
  const categories: string[] = [];
  if (blueprint.primaryGenre) {
    categories.push(blueprint.primaryGenre);
  }
  if (blueprint.secondaryGenre) {
    categories.push(blueprint.secondaryGenre);
  }

  return {
    title: blueprint.workingTitle || "Untitled",
    description: generateBookDescription(blueprint),
    categories,
    keywords: keywords.slice(0, 7), // Amazon allows max 7 keywords
    targetAudience: blueprint.audienceData
      ? (blueprint.audienceData as any).targetReader || "General readers"
      : "General readers",
    comparableTitles,
  };
}
