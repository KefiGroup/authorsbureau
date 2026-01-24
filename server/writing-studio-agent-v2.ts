import { invokeLLM } from "./_core/llm";
import { StoryBlueprint } from "../drizzle/schema";

/**
 * New optimized conversation flow: Essential Questions → Generate Complete Blueprint → Iterative Refinement
 */

export type ConversationMode = "initial_questions" | "blueprint_generation" | "refinement";

interface ConversationState {
  mode: ConversationMode;
  essentialData: {
    projectType?: string;
    briefDescription?: string;
    targetAudience?: string;
    targetPages?: number;
    workingTitle?: string;
    // Two-tier onboarding: track if user wants quick or detailed path
    wantsDetailedOnboarding?: boolean;
    // Additional context from detailed path (3 more questions)
    detailedContext?: {
      themes?: string;
      tone?: string;
      structure?: string;
    };
  };
  generatedBlueprint?: Partial<StoryBlueprint>;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Generate next AI message based on current conversation state
 */
export async function generateNextMessage(
  state: ConversationState,
  userMessage: string | null,
  authorProfile: any
): Promise<{ message: string; suggestions: string[]; isComplete: boolean; blueprintData?: Partial<StoryBlueprint>; progress?: { current: number; total: number } }> {
  const mode = state.mode;

  if (mode === "initial_questions") {
    return await handleInitialQuestions(state, userMessage, authorProfile);
  } else if (mode === "blueprint_generation") {
    return await handleBlueprintGeneration(state, authorProfile);
  } else {
    return await handleRefinement(state, userMessage, authorProfile);
  }
}

/**
 * Handle initial essential questions (2-3 questions max)
 */
async function handleInitialQuestions(
  state: ConversationState,
  userMessage: string | null,
  authorProfile: any
): Promise<{ message: string; suggestions: string[]; isComplete: boolean; progress?: { current: number; total: number } }> {
  const history = state.conversationHistory;
  const essentialData = state.essentialData;

  // Determine which question to ask based on what we have
  const needsProjectType = !essentialData.projectType;
  const needsDescription = !essentialData.briefDescription;
  const needsAudience = !essentialData.targetAudience;
  const needsPages = !essentialData.targetPages;
  
  // Two-tier onboarding: After 3 questions, ask if they want to share more context
  const hasAnsweredThreeQuestions = essentialData.projectType && essentialData.briefDescription && essentialData.targetAudience;
  const needsBranchingChoice = hasAnsweredThreeQuestions && essentialData.wantsDetailedOnboarding === undefined;
  const isDetailedPath = essentialData.wantsDetailedOnboarding === true;
  
  // Detailed path: ask 3 additional questions
  const needsThemes = isDetailedPath && !essentialData.detailedContext?.themes;
  const needsTone = isDetailedPath && !essentialData.detailedContext?.tone;
  const needsStructure = isDetailedPath && !essentialData.detailedContext?.structure;

  const systemPrompt = `You are an expert story development coach. You're helping an author create a comprehensive story blueprint.

Your Goal: Gather essential information through a two-tier onboarding system:

TIER 1 - Essential Questions (3 questions):
1. Project type (novel, novella, memoir, etc.)
2. Brief description (2-3 sentences about what the book is about)
3. Target audience (who will read this book)

TIER 2 - Branching Choice:
After the 3 essential questions, ask: "Would you prefer me to create your blueprint now, or would you like to share more context about your book with me?"
- Provide 2 suggestion buttons: [SUGGESTIONS: Create Blueprint Now | Share More Context]

If they choose "Share More Context":
4. Ask about main themes and messages
5. Ask about desired tone and writing style
6. Ask about preferred structure or pacing

Then ask for page count (150, 200, 250, 300, > 300 pages)

IMPORTANT: If this is the VERY FIRST message (no conversation history), start with:
"We'll start by asking 3 important questions to get a sense of what you want to write. Let's begin!"

Then immediately ask the first question.

Author Profile (for context only - do NOT mention specific book titles):
${authorProfile ? `- Pen Name: ${authorProfile.penName || "Not provided"}
- Bio: ${authorProfile.bio || "Not provided"}
- Writing Style: ${authorProfile.writingStyle || "Not specified"}` : "No profile available"}

What We've Collected So Far:
${JSON.stringify(essentialData, null, 2)}

Current Status:
${needsProjectType ? "- Need to ask: What type of project are you writing?" : "✓ Project type collected"}
${needsDescription ? "- Need to ask: What's your book about? (2-3 sentences)" : "✓ Brief description collected"}
${needsAudience ? "- Need to ask: Who is this book for? (Your ideal reader)" : "✓ Target audience collected"}
${needsBranchingChoice ? "- Need to ask: BRANCHING CHOICE - Create blueprint now or share more context?" : essentialData.wantsDetailedOnboarding === true ? "✓ User chose detailed path" : essentialData.wantsDetailedOnboarding === false ? "✓ User chose quick path" : ""}
${isDetailedPath && needsThemes ? "- Need to ask: What are the main themes or messages?" : isDetailedPath && essentialData.detailedContext?.themes ? "✓ Themes collected" : ""}
${isDetailedPath && needsTone ? "- Need to ask: What tone/style do you envision?" : isDetailedPath && essentialData.detailedContext?.tone ? "✓ Tone collected" : ""}
${isDetailedPath && needsStructure ? "- Need to ask: What structure or pacing do you prefer?" : isDetailedPath && essentialData.detailedContext?.structure ? "✓ Structure collected" : ""}
${needsPages ? "- Need to ask: How many pages do you want your book to be?" : "✓ Target pages collected"}

Instructions:
- Be warm, encouraging, and conversational
- Ask ONE question at a time
- After each answer, acknowledge what they said before asking the next question
- You may reference their background/expertise to show understanding, but NEVER mention specific book titles
- Always frame this as a NEW project they're creating, not continuing previous work
- Use generic terms like "your book", "your project", "this work" - never specific titles
- When you have all 4 pieces, tell them you'll generate a complete blueprint
- DO NOT use Markdown formatting (**, ##, etc.) in your responses - use plain, natural text only

SUGGESTION GENERATION RULES (CRITICAL - FOLLOW EXACTLY):

1. **For Project Type Question:**
   - Provide generic project type options: [SUGGESTIONS: Novel | Novella | Memoir | Non-Fiction Book | Short Story | Children's Book]
   - DO NOT make assumptions about their topic yet

2. **For Brief Description Question:**
   - If they mentioned a specific topic/genre in their answer, provide 4-5 relevant angles or themes
   - Example: If they say "detective story", suggest: [SUGGESTIONS: Focus on the mystery and clues | Emphasize character development | Highlight the setting atmosphere | Include psychological elements | Add social commentary]
   - Example: If they say "self-help book", suggest: [SUGGESTIONS: Focus on actionable steps | Include personal stories | Emphasize mindset shifts | Add practical exercises | Highlight transformation journey]
   - NEVER suggest topics unrelated to what they just described
   - If their description is vague, provide general writing approach suggestions

3. **For Target Audience Question:**
   - Base suggestions on the book topic they described earlier
   - Example: For mystery novel, suggest: [SUGGESTIONS: Adult readers 30-50 | Young adults 18-25 | Mystery enthusiasts | General fiction readers | Thriller fans]
   - Example: For business book, suggest: [SUGGESTIONS: Entrepreneurs | Business professionals | Students | Career changers | Industry experts]

4. **For Branching Choice:**
   - ALWAYS provide exactly: [SUGGESTIONS: Create Blueprint Now | Share More Context]

5. **For Detailed Path Questions (themes, tone, structure):**
   - Generate 4-5 options relevant to their specific book topic and genre
   - Reference what they've already shared about their book

6. **For Page Count Question:**
   - ALWAYS provide exactly: [SUGGESTIONS: 150 pages | 200 pages | 250 pages | 300 pages | > 300 pages]

**CRITICAL RULES:**
- NEVER generate suggestions about topics the user hasn't mentioned (e.g., don't suggest "investing" if they're writing a detective story)
- ALWAYS base suggestions on the actual conversation history
- If you're unsure, provide generic writing-related suggestions, NOT topic-specific ones
- Users can select MULTIPLE suggestions, so provide complementary options

Suggestion Format:
End your response with: [SUGGESTIONS: option1 | option2 | option3 | option4 | option5]`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content })),
  ];

  if (userMessage) {
    messages.push({ role: "user", content: userMessage });
  } else {
    // First message - welcome and ask first question
    messages.push({ role: "user", content: "I'm ready to start creating my story blueprint!" });
  }

  const response = await invokeLLM({ model: "gpt-4o", messages });
  const content = response.choices[0].message.content;
  const aiMessage = typeof content === "string" ? content : "";

  const suggestions = extractSuggestions(aiMessage);
  const cleanMessage = aiMessage.replace(/\[SUGGESTIONS:.*?\]/g, "").trim();

  // Check if we have all essential data (including branching path completion)
  let isComplete = false;
  
  if (essentialData.wantsDetailedOnboarding === true) {
    // Detailed path: need all 3 essential + all 3 detailed + pages
    isComplete = !!essentialData.projectType && 
                 !!essentialData.briefDescription && 
                 !!essentialData.targetAudience && 
                 !!essentialData.detailedContext?.themes &&
                 !!essentialData.detailedContext?.tone &&
                 !!essentialData.detailedContext?.structure &&
                 !!essentialData.targetPages;
  } else if (essentialData.wantsDetailedOnboarding === false) {
    // Quick path: need 3 essential + pages
    isComplete = !!essentialData.projectType && 
                 !!essentialData.briefDescription && 
                 !!essentialData.targetAudience && 
                 !!essentialData.targetPages;
  } else {
    // Haven't chosen path yet
    isComplete = false;
  }

  // Calculate progress
  let current = 0;
  let total = 3; // Default to quick path (3 essential questions)
  
  if (essentialData.wantsDetailedOnboarding === true) {
    // Detailed path: 6 questions + page count = 7 total
    total = 7;
    if (essentialData.projectType) current++;
    if (essentialData.briefDescription) current++;
    if (essentialData.targetAudience) current++;
    if (essentialData.detailedContext?.themes) current++;
    if (essentialData.detailedContext?.tone) current++;
    if (essentialData.detailedContext?.structure) current++;
    if (essentialData.targetPages) current++;
  } else if (essentialData.wantsDetailedOnboarding === false) {
    // Quick path: 3 questions + page count = 4 total
    total = 4;
    if (essentialData.projectType) current++;
    if (essentialData.briefDescription) current++;
    if (essentialData.targetAudience) current++;
    if (essentialData.targetPages) current++;
  } else {
    // Haven't chosen path yet, show progress for first 3 questions only
    total = 3;
    if (essentialData.projectType) current++;
    if (essentialData.briefDescription) current++;
    if (essentialData.targetAudience) current++;
  }

  return {
    message: cleanMessage,
    suggestions,
    isComplete,
    progress: { current, total },
  };
}

/**
 * Handle blueprint generation (AI generates complete blueprint from essential data)
 */
async function handleBlueprintGeneration(
  state: ConversationState,
  authorProfile: any
): Promise<{ message: string; suggestions: string[]; isComplete: boolean; blueprintData: Partial<StoryBlueprint> }> {
  const essentialData = state.essentialData;

  const systemPrompt = `You are an expert story architect. Based on the author's essential information, generate a COMPLETE story blueprint covering all 9 sections.

Author Profile (for context only - do NOT mention specific book titles from profile):
${authorProfile ? `- Pen Name: ${authorProfile.penName || "Not provided"}
- Bio: ${authorProfile.bio || "Not provided"}
- Writing Style: ${authorProfile.writingStyle || "Not specified"}` : "No profile available"}

Essential Information Provided:
- Project Type: ${essentialData.projectType}
- Brief Description: ${essentialData.briefDescription}
- Target Audience: ${essentialData.targetAudience}
- Target Pages: ${essentialData.targetPages} pages
- Working Title: ${essentialData.workingTitle || "Not provided"}

PAGE TO WORD COUNT CONVERSION:
- 150 pages = approximately 37,500 words (~12-15 chapters)
- 200 pages = approximately 50,000 words (~15-20 chapters)
- 250 pages = approximately 62,500 words (~20-25 chapters)
- 300 pages = approximately 75,000 words (~25-30 chapters)

Your Task:
Generate a comprehensive story blueprint with these 9 sections:

1. Project Overview: Project type, working title (or suggest one), target page count AND calculated word count
2. Genre Classification: Primary genre, secondary genre, market positioning
3. Core Premise: Logline (one sentence), elevator pitch (2-3 sentences), unique hook
4. Protagonist: Name, age, key traits, goal, internal conflict, character arc
5. Supporting Characters: 2-3 key characters with names, relationships, roles
6. Setting: Time period, location, atmosphere, world-building elements
7. Plot Structure: Three-act outline with 5-7 key turning points
8. Target Audience: Demographics, psychographics, comparable titles
9. Thematic Elements: 2-3 core themes, emotional journey

Instructions:
- Be creative and specific - don't just repeat what they said
- Infer details from their description and author profile
- NEVER mention specific book titles from the author's profile - this is a NEW project
- Always frame this as a fresh, new work they're creating
- Make compelling suggestions they can refine
- Use storytelling best practices
- Return structured JSON data
- DO NOT use Markdown formatting in the message field

Return your response as a JSON object with this structure:
{
  "message": "Your encouraging message explaining you've generated the blueprint",
  "blueprint": {
    "projectType": "novel" | "novella" | "short_story" | "memoir" | "non_fiction" | "childrens_book",
    "workingTitle": "...",
    "targetLength": "200 pages (approximately 50,000 words)",
    "primaryGenre": "...",
    "secondaryGenre": "...",
    "corePremise": "...",
    "protagonistData": { "name": "...", "age": 30, "traits": ["..."], "goal": "...", "internalConflict": "...", "arc": "..." },
    "supportingCharacters": [{ "name": "...", "relationship": "...", "role": "..." }],
    "timePeriod": "...",
    "location": "...",
    "settingData": { "atmosphere": "...", "worldBuilding": "..." },
    "plotStructure": { "act1": "...", "act2": "...", "act3": "...", "keyPlotPoints": ["..."] },
    "audienceData": { "targetAge": "...", "comparableTitles": ["..."], "readerProfile": "..." },
    "thematicElements": { "coreThemes": ["..."], "emotionalArc": "..." }
  }
}`;

  const response = await invokeLLM({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate my complete story blueprint now!" },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "complete_blueprint",
        strict: true,
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            blueprint: {
              type: "object",
              properties: {
                projectType: { type: "string", enum: ["novel", "novella", "short_story", "memoir", "non_fiction", "childrens_book"] },
                workingTitle: { type: "string" },
                targetLength: { type: "string" },
                primaryGenre: { type: "string" },
                secondaryGenre: { type: "string" },
                corePremise: { type: "string" },
                protagonistData: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    age: { type: "number" },
                    traits: { type: "array", items: { type: "string" } },
                    goal: { type: "string" },
                    internalConflict: { type: "string" },
                    arc: { type: "string" },
                  },
                  required: ["name", "age", "traits", "goal", "internalConflict", "arc"],
                  additionalProperties: false,
                },
                supportingCharacters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      relationship: { type: "string" },
                      role: { type: "string" },
                    },
                    required: ["name", "relationship", "role"],
                    additionalProperties: false,
                  },
                },
                timePeriod: { type: "string" },
                location: { type: "string" },
                settingData: {
                  type: "object",
                  properties: {
                    atmosphere: { type: "string" },
                    worldBuilding: { type: "string" },
                  },
                  required: ["atmosphere", "worldBuilding"],
                  additionalProperties: false,
                },
                plotStructure: {
                  type: "object",
                  properties: {
                    act1: { type: "string" },
                    act2: { type: "string" },
                    act3: { type: "string" },
                    keyPlotPoints: { type: "array", items: { type: "string" } },
                  },
                  required: ["act1", "act2", "act3", "keyPlotPoints"],
                  additionalProperties: false,
                },
                audienceData: {
                  type: "object",
                  properties: {
                    targetAge: { type: "string" },
                    comparableTitles: { type: "array", items: { type: "string" } },
                    readerProfile: { type: "string" },
                  },
                  required: ["targetAge", "comparableTitles", "readerProfile"],
                  additionalProperties: false,
                },
                thematicElements: {
                  type: "object",
                  properties: {
                    coreThemes: { type: "array", items: { type: "string" } },
                    emotionalArc: { type: "string" },
                  },
                  required: ["coreThemes", "emotionalArc"],
                  additionalProperties: false,
                },
              },
              required: [
                "projectType",
                "workingTitle",
                "targetLength",
                "primaryGenre",
                "secondaryGenre",
                "corePremise",
                "protagonistData",
                "supportingCharacters",
                "timePeriod",
                "location",
                "settingData",
                "plotStructure",
                "audienceData",
                "thematicElements",
              ],
              additionalProperties: false,
            },
          },
          required: ["message", "blueprint"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const jsonString = typeof content === "string" ? content : "";
  const parsed = JSON.parse(jsonString);

  return {
    message: parsed.message + "\n\nWhat would you like to refine?\n- Click any section to expand and edit\n- Ask me to regenerate specific sections\n- Tell me what's missing or needs adjustment\n- Or click 'Finalize Blueprint' if you're happy with this!",
    suggestions: ["Refine protagonist", "Adjust plot structure", "Change genre", "Finalize blueprint"],
    isComplete: true,
    blueprintData: parsed.blueprint,
  };
}

/**
 * Handle refinement conversation (iterative improvement of generated blueprint)
 */
async function handleRefinement(
  state: ConversationState,
  userMessage: string | null,
  authorProfile: any
): Promise<{ message: string; suggestions: string[]; isComplete: boolean; blueprintData?: Partial<StoryBlueprint>; progress?: { current: number; total: number } }> {
  const history = state.conversationHistory;
  const blueprint = state.generatedBlueprint;

  const systemPrompt = `You are an expert story development coach helping an author refine their story blueprint.

Author Profile (for context only - do NOT mention specific book titles from profile):
${authorProfile ? `- Pen Name: ${authorProfile.penName || "Not provided"}
- Bio: ${authorProfile.bio || "Not provided"}` : "No profile available"}

You have access to the complete blueprint data internally. Use it to answer questions and provide specific feedback.

Your Role:
- Answer questions about the blueprint
- Suggest improvements to specific sections
- Regenerate sections if requested
- Help the author refine their vision
- Be encouraging and collaborative

CRITICAL Instructions:
- NEVER show raw JSON or technical data structures to the user
- When referencing blueprint content, paraphrase it naturally in conversation
- Provide concrete suggestions, not vague advice
- If they ask to change something, explain the implications
- NEVER mention specific book titles from the author's profile - focus on THIS project
- Always frame this as a NEW work they're creating
- DO NOT use Markdown formatting (**, ##, etc.) in your responses - use plain, natural text only
- Keep responses focused, professional, and actionable

[SUGGESTIONS: Looks good | Regenerate this section | Tell me more | I have a question]`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content })),
  ];

  if (userMessage) {
    messages.push({ role: "user", content: userMessage });
  }

  const response = await invokeLLM({ model: "gpt-4o", messages });
  const content = response.choices[0].message.content;
  const aiMessage = typeof content === "string" ? content : "";

  const suggestions = extractSuggestions(aiMessage);
  const cleanMessage = aiMessage.replace(/\[SUGGESTIONS:.*?\]/g, "").trim();

  return {
    message: cleanMessage,
    suggestions,
    isComplete: false,
  };
}

/**
 * Extract suggestion buttons from AI response
 */
function extractSuggestions(message: string): string[] {
  const match = message.match(/\[SUGGESTIONS:(.*?)\]/);
  if (!match) return [];

  return match[1]
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Extract essential data from user response during initial questions
 */
export async function extractEssentialData(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{ 
  projectType?: string; 
  briefDescription?: string; 
  targetAudience?: string; 
  workingTitle?: string;
  wantsDetailedOnboarding?: boolean;
  detailedContext?: {
    themes?: string;
    tone?: string;
    structure?: string;
  };
}> {
  const prompt = `Extract essential story information from the author's response.

Conversation history:
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Latest response: "${userMessage}"

Extract any of these fields if mentioned:
- projectType: "novel" | "novella" | "short_story" | "memoir" | "non_fiction" | "childrens_book"
- briefDescription: 2-3 sentence description of what the book is about
- targetAudience: Who will read this book
- workingTitle: Title if mentioned
- wantsDetailedOnboarding: true if user chose "Share More Context", false if user chose "Create Blueprint Now"
- detailedContext.themes: Main themes or messages (if in detailed path)
- detailedContext.tone: Desired tone or writing style (if in detailed path)
- detailedContext.structure: Preferred structure or pacing (if in detailed path)

Return JSON object with only the fields that are clearly mentioned.`;

  const response = await invokeLLM({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a data extraction assistant. Extract structured information and return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "essential_data_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                projectType: { type: "string" },
                briefDescription: { type: "string" },
                targetAudience: { type: "string" },
                workingTitle: { type: "string" },
                wantsDetailedOnboarding: { type: "boolean" },
                detailedContext: {
                  type: "object",
                  properties: {
                    themes: { type: "string" },
                    tone: { type: "string" },
                    structure: { type: "string" },
                  },
                  additionalProperties: false,
                },
              },
              additionalProperties: false,
            },
          },
          required: ["data"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const jsonString = typeof content === "string" ? content : "";

  try {
    const parsed = JSON.parse(jsonString);
    return parsed.data || {};
  } catch (error) {
    console.error("Failed to parse extracted data:", error);
    return {};
  }
}
