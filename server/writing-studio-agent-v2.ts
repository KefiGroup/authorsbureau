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
): Promise<{ message: string; suggestions: string[]; isComplete: boolean; blueprintData?: Partial<StoryBlueprint> }> {
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
): Promise<{ message: string; suggestions: string[]; isComplete: boolean }> {
  const history = state.conversationHistory;
  const essentialData = state.essentialData;

  // Determine which question to ask based on what we have
  const needsProjectType = !essentialData.projectType;
  const needsDescription = !essentialData.briefDescription;
  const needsAudience = !essentialData.targetAudience;
  const needsPages = !essentialData.targetPages;

  const systemPrompt = `You are an expert story development coach. You're helping an author create a comprehensive story blueprint.

Your Goal: Gather 4 essential pieces of information efficiently and warmly:
1. Project type (novel, novella, memoir, etc.)
2. Brief description (2-3 sentences about what the book is about)
3. Target audience (who will read this book)
4. Target page count (how long they want the book to be)

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
${needsPages ? "- Need to ask: How many pages do you want your book to be?" : "✓ Target pages collected"}

Instructions:
- Be warm, encouraging, and conversational
- Ask ONE question at a time
- After each answer, acknowledge what they said before asking the next question
- You may reference their background/expertise to show understanding, but NEVER mention specific book titles
- Always frame this as a NEW project they're creating, not continuing previous work
- Use generic terms like "your book", "your project", "this work" - never specific titles
- When you have all 4 pieces, tell them you'll generate a complete blueprint
- Provide suggestion buttons for common answers
- For page count question, ALWAYS provide these exact suggestions: [SUGGESTIONS: 150 pages | 200 pages | 250 pages | 300 pages]
- DO NOT use Markdown formatting (**, ##, etc.) in your responses - use plain, natural text only

Suggestion Format:
End your response with: [SUGGESTIONS: option1 | option2 | option3 | option4]`;

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

  const response = await invokeLLM({ messages });
  const content = response.choices[0].message.content;
  const aiMessage = typeof content === "string" ? content : "";

  const suggestions = extractSuggestions(aiMessage);
  const cleanMessage = aiMessage.replace(/\[SUGGESTIONS:.*?\]/g, "").trim();

  // Check if we have all essential data
  const isComplete = !!essentialData.projectType && !!essentialData.briefDescription && !!essentialData.targetAudience && !!essentialData.targetPages;

  return {
    message: cleanMessage,
    suggestions,
    isComplete,
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
): Promise<{ message: string; suggestions: string[]; isComplete: boolean; blueprintData?: Partial<StoryBlueprint> }> {
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

  const response = await invokeLLM({ messages });
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
): Promise<{ projectType?: string; briefDescription?: string; targetAudience?: string; workingTitle?: string }> {
  const prompt = `Extract essential story information from the author's response.

Conversation history:
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Latest response: "${userMessage}"

Extract any of these fields if mentioned:
- projectType: "novel" | "novella" | "short_story" | "memoir" | "non_fiction" | "childrens_book"
- briefDescription: 2-3 sentence description of what the book is about
- targetAudience: Who will read this book
- workingTitle: Title if mentioned

Return JSON object with only the fields that are clearly mentioned.`;

  const response = await invokeLLM({
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
