import { invokeLLM } from "./_core/llm";
import { StoryBlueprint } from "../drizzle/schema";
import * as db from "./db";

/**
 * Conversation sections for story development
 */
export const CONVERSATION_SECTIONS = [
  "project_type",
  "genre_selection",
  "premise_development",
  "protagonist_creation",
  "supporting_characters",
  "setting_details",
  "plot_structure",
  "audience_identification",
  "thematic_elements",
  "completion_review",
] as const;

export type ConversationSection = (typeof CONVERSATION_SECTIONS)[number];

interface ConversationState {
  currentSection: ConversationSection;
  completedSections: string[];
  collectedData: Partial<StoryBlueprint>;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Generate next AI message based on current conversation state
 */
export async function generateNextMessage(
  state: ConversationState,
  userMessage: string | null,
  authorProfile: any
): Promise<{ message: string; suggestions: string[]; isComplete: boolean }> {
  const section = state.currentSection;
  const history = state.conversationHistory;

  // Build context-aware system prompt
  const systemPrompt = buildSystemPrompt(section, authorProfile, state.collectedData);
  console.log("[WritingStudio] System prompt length:", systemPrompt.length);
  console.log("[WritingStudio] History length:", history.length);

  // Build conversation messages
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content })),
  ];
  console.log("[WritingStudio] Total messages before adding user message:", messages.length);

  // Add user message if provided
  if (userMessage) {
    messages.push({ role: "user", content: userMessage });
  }

  // Generate AI response
  try {
    console.log("[WritingStudio] Calling invokeLLM with messages:", JSON.stringify(messages, null, 2));
    const response = await invokeLLM({
      messages,
    });
    console.log("[WritingStudio] LLM response received:", JSON.stringify(response, null, 2));

    if (!response || !response.choices || response.choices.length === 0) {
      console.error("Invalid LLM response:", JSON.stringify(response));
      throw new Error("Invalid response from LLM");
    }

    const content = response.choices[0].message.content;
    const aiMessage = typeof content === "string" ? content : "";
    
    if (!aiMessage) {
      throw new Error("Empty message from LLM");
    }

    // Extract suggestions from AI response (look for suggestions in format: [SUGGESTIONS: option1 | option2 | option3])
    const suggestions = extractSuggestions(aiMessage);
    const cleanMessage = aiMessage.replace(/\[SUGGESTIONS:.*?\]/g, "").trim();

    // Check if section is complete
    const isComplete = checkSectionComplete(section, state.collectedData);

    return {
      message: cleanMessage,
      suggestions,
      isComplete,
    };
  } catch (error) {
    console.error("Error in generateNextMessage:", error);
    throw error;
  }
}

/**
 * Build context-aware system prompt based on current section and author profile
 */
function buildSystemPrompt(
  section: ConversationSection,
  authorProfile: any,
  collectedData: Partial<StoryBlueprint>
): string {
  const basePrompt = `You are an expert story development coach helping an author create a comprehensive story blueprint. You are conversational, encouraging, and ask thoughtful questions to draw out the author's vision.

**Author Profile:**
${authorProfile ? `- Pen Name: ${authorProfile.penName || "Not provided"}
- Bio: ${authorProfile.bio || "Not provided"}
- Previous Works: ${authorProfile.previousWorks || "None listed"}
- Writing Style: ${authorProfile.writingStyle || "Not specified"}` : "No profile available"}

**Current Section:** ${section.replace(/_/g, " ").toUpperCase()}

**Previously Collected Data:**
${JSON.stringify(collectedData, null, 2)}

`;

  const sectionPrompts: Record<ConversationSection, string> = {
    project_type: `Ask the author what type of project they're working on. Options include: novel, novella, short story, memoir, non-fiction, children's book. Be warm and encouraging. After they respond, ask about their working title (if they have one) and target word count.

At the end of your response, provide 3-4 quick suggestion buttons in this format:
[SUGGESTIONS: Novel | Novella | Short Story | Memoir]`,

    genre_selection: `Help the author identify their primary and secondary genres. Reference their project type (${collectedData.projectType || "not specified"}) and ask thoughtful questions about the story's tone, setting, and themes to guide genre selection. Be specific - instead of just "fiction," help them narrow down to thriller, romance, sci-fi, etc.

[SUGGESTIONS: Thriller | Romance | Science Fiction | Fantasy | Mystery]`,

    premise_development: `Guide the author to articulate their core premise in 1-2 sentences. Ask: What is the central conflict? What makes this story unique? What emotional journey will readers experience? Help them refine until it's compelling and clear.

[SUGGESTIONS: Tell me more | That sounds interesting | I need help refining this]`,

    protagonist_creation: `Help the author develop their protagonist. Ask about: name, age, key personality traits, what they want (goal), what stands in their way (obstacle), and how they'll change (character arc). Make this feel like a creative conversation, not an interrogation.

[SUGGESTIONS: Strong and determined | Flawed but relatable | Mysterious outsider | Reluctant hero]`,

    supporting_characters: `Ask about 2-3 key supporting characters. For each, explore: their relationship to the protagonist, their role in the story, and what makes them memorable. Keep it focused on characters who truly matter to the plot.

[SUGGESTIONS: Mentor figure | Love interest | Antagonist | Loyal friend]`,

    setting_details: `Explore the story's setting. Ask about time period, location, and any unique world-building elements. How does the setting influence the story? What atmosphere or mood does it create? For contemporary stories, focus on specific locations. For speculative fiction, dig into world-building rules.

[SUGGESTIONS: Contemporary | Historical | Fantasy World | Futuristic]`,

    plot_structure: `Help the author outline their plot using the three-act structure. Ask about: the inciting incident (Act 1), major complications and rising action (Act 2), and the climax/resolution (Act 3). Identify 5-7 key turning points. Keep it high-level - we're building a roadmap, not writing the whole book.

[SUGGESTIONS: Three-act structure | Hero's Journey | Save the Cat | Custom approach]`,

    audience_identification: `Help the author identify their target readers. Ask: Who will love this story? What age range? What are they currently reading? What comparable titles exist? This will inform marketing later. Be specific - "adults who love psychological thrillers" is better than "general fiction readers."

[SUGGESTIONS: Young Adult | Adult Fiction | Middle Grade | New Adult]`,

    thematic_elements: `Explore the deeper themes and messages. Ask: What do you want readers to feel or think about after finishing? What universal truths or questions does this story explore? Themes might include: love, redemption, identity, power, family, etc. Help them identify 2-3 core themes.

[SUGGESTIONS: Identity and belonging | Good vs evil | Love and sacrifice | Power and corruption]`,

    completion_review: `Congratulate the author on completing the conversation! Summarize what you've collected and explain that you'll now generate their comprehensive story blueprint. Ask if there's anything they'd like to add or clarify before generating the blueprint.

[SUGGESTIONS: Generate my blueprint | I want to add something | Let me review what we discussed]`,
  };

  return basePrompt + (sectionPrompts[section] || "Continue the conversation naturally.");
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
 * Check if current section has enough data to be considered complete
 */
function checkSectionComplete(section: ConversationSection, data: Partial<StoryBlueprint>): boolean {
  const completionChecks: Record<ConversationSection, boolean> = {
    project_type: !!data.projectType,
    genre_selection: !!data.primaryGenre,
    premise_development: !!data.corePremise && data.corePremise.length > 20,
    protagonist_creation: !!data.protagonistData,
    supporting_characters: !!data.supportingCharacters,
    setting_details: !!data.location || !!data.timePeriod,
    plot_structure: !!data.plotStructure,
    audience_identification: !!data.audienceData,
    thematic_elements: !!data.thematicElements,
    completion_review: true,
  };

  return completionChecks[section] || false;
}

/**
 * Move to next section in conversation flow
 */
export function getNextSection(currentSection: ConversationSection): ConversationSection | null {
  const currentIndex = CONVERSATION_SECTIONS.indexOf(currentSection);
  if (currentIndex === -1 || currentIndex === CONVERSATION_SECTIONS.length - 1) {
    return null;
  }
  return CONVERSATION_SECTIONS[currentIndex + 1];
}

/**
 * Get previous section in conversation flow
 */
export function getPreviousSection(currentSection: ConversationSection): ConversationSection | null {
  const currentIndex = CONVERSATION_SECTIONS.indexOf(currentSection);
  if (currentIndex <= 0) {
    return null;
  }
  return CONVERSATION_SECTIONS[currentIndex - 1];
}

/**
 * Extract structured data from user response based on current section
 */
export async function extractDataFromResponse(
  section: ConversationSection,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<Partial<StoryBlueprint>> {
  const prompt = `Extract structured data from the author's response for the "${section}" section.

Conversation history:
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Latest response: "${userMessage}"

Return a JSON object with the extracted data. Use these field names:
- project_type section: { "projectType": "novel" | "novella" | "short_story" | "memoir" | "non_fiction" | "childrens_book", "workingTitle": string, "targetLength": string }
- genre_selection section: { "primaryGenre": string, "secondaryGenre": string }
- premise_development section: { "corePremise": string }
- protagonist_creation section: { "protagonistData": { "name": string, "age": number, "traits": string[], "goal": string, "obstacle": string, "arc": string } }
- supporting_characters section: { "supportingCharacters": [{ "name": string, "relationship": string, "role": string }] }
- setting_details section: { "timePeriod": string, "location": string, "settingData": { "atmosphere": string, "worldBuilding": string } }
- plot_structure section: { "plotStructure": { "act1": string, "act2": string, "act3": string, "keyPlotPoints": string[] } }
- audience_identification section: { "audienceData": { "targetAge": string, "comparableTitles": string[], "readerProfile": string } }
- thematic_elements section: { "thematicElements": { "coreThemes": string[], "emotionalArc": string } }

Only include fields that are clearly mentioned in the response. Return empty object {} if nothing can be extracted.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a data extraction assistant. Extract structured information from conversations and return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "story_data_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            data: {
              type: "object",
              additionalProperties: true,
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
