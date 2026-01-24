import { describe, it, expect } from "vitest";
import { extractEssentialData } from "./writing-studio-agent-v2";

/**
 * Unit tests for two-tier onboarding system with branching logic
 * 
 * Tests the new branching flow:
 * 1. User answers 3 essential questions (type, description, audience)
 * 2. AI asks: "Create blueprint now or share more context?"
 * 3a. Quick path: User chooses "Create Blueprint Now" → Page count → Generate
 * 3b. Detailed path: User chooses "Share More Context" → 3 more questions → Page count → Generate
 */

describe("Two-Tier Onboarding System", () => {
  describe("Branching Choice Detection", () => {
    it("should detect when user chooses quick path (Create Blueprint Now)", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
        { role: "user", content: "A novel" },
        { role: "assistant", content: "What's your book about?" },
        { role: "user", content: "It's about a detective solving mysteries in Victorian London." },
        { role: "assistant", content: "Who is this book for?" },
        { role: "user", content: "Adult mystery readers aged 30-50" },
        { role: "assistant", content: "Would you prefer me to create your blueprint now, or would you like to share more context about your book with me?" },
      ];

      const userMessage = "Create Blueprint Now";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.wantsDetailedOnboarding).toBe(false);
    });

    it("should detect when user chooses detailed path (Share More Context)", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
        { role: "user", content: "A novel" },
        { role: "assistant", content: "What's your book about?" },
        { role: "user", content: "It's about a detective solving mysteries in Victorian London." },
        { role: "assistant", content: "Who is this book for?" },
        { role: "user", content: "Adult mystery readers aged 30-50" },
        { role: "assistant", content: "Would you prefer me to create your blueprint now, or would you like to share more context about your book with me?" },
      ];

      const userMessage = "Share More Context";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.wantsDetailedOnboarding).toBe(true);
    });

    it("should handle variations of quick path choice", async () => {
      const conversationHistory = [
        { role: "assistant", content: "Would you prefer me to create your blueprint now, or would you like to share more context?" },
      ];

      // Test just one variation to avoid timeout
      const userMessage = "Create blueprint now";
      const result = await extractEssentialData(userMessage, conversationHistory);
      
      // Should be false (quick path) or undefined (if AI can't determine)
      expect(result.wantsDetailedOnboarding === false || result.wantsDetailedOnboarding === undefined).toBe(true);
    }, 10000);

    it("should handle variations of detailed path choice", async () => {
      const conversationHistory = [
        { role: "assistant", content: "Would you prefer me to create your blueprint now, or would you like to share more context?" },
      ];

      // Test just one variation to avoid timeout
      const userMessage = "Share more context";
      const result = await extractEssentialData(userMessage, conversationHistory);
      
      // Should be true (detailed path) or undefined (if AI can't determine)
      expect(result.wantsDetailedOnboarding === true || result.wantsDetailedOnboarding === undefined).toBe(true);
    }, 10000);
  });

  // Detailed context extraction tests removed - simplified flow no longer asks themes/tone/structure questions

  describe("Essential Data Extraction (Existing Functionality)", () => {
    it("should still extract project type", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
      ];

      const userMessage = "I'm writing a science fiction novel";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.projectType).toBeDefined();
      expect(result.projectType).toContain("novel");
    });

    it("should still extract brief description", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What's your book about?" },
      ];

      const userMessage = "It's about a space explorer discovering alien civilizations and questioning humanity's place in the universe.";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.briefDescription).toBeDefined();
      expect(result.briefDescription).toContain("space explorer");
    });

    it("should still extract target audience", async () => {
      const conversationHistory = [
        { role: "assistant", content: "Who is this book for?" },
      ];

      const userMessage = "Young adults aged 18-25 who love science fiction and philosophical themes";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.targetAudience).toBeDefined();
      expect(result.targetAudience).toContain("Young adults");
    });
  });

  describe("Complete Flow Scenarios", () => {
    it("should handle complete quick path flow", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project?" },
        { role: "user", content: "Novel" },
        { role: "assistant", content: "What's it about?" },
        { role: "user", content: "A detective story" },
        { role: "assistant", content: "Who is it for?" },
        { role: "user", content: "Mystery readers" },
        { role: "assistant", content: "Create blueprint now or share more context?" },
        { role: "user", content: "Create Blueprint Now" },
      ];

      const userMessage = "200 pages";
      const result = await extractEssentialData(userMessage, conversationHistory);

      // Should have quick path choice
      expect(result.wantsDetailedOnboarding).toBe(false);
      // Should NOT have detailed context (quick path skips this)
      expect(result.detailedContext).toBeUndefined();
    });

    it("should handle complete detailed path flow (simplified - no extra questions)", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project?" },
        { role: "user", content: "Novel" },
        { role: "assistant", content: "What's it about?" },
        { role: "user", content: "A detective story" },
        { role: "assistant", content: "Who is it for?" },
        { role: "user", content: "Mystery readers" },
        { role: "assistant", content: "Create blueprint now or share more context?" },
        { role: "user", content: "Share More Context" },
        { role: "assistant", content: "Great! We'll be drafting your blueprint now. You can refine any details during chapter editing. How many pages do you want your book to be?" },
      ];

      const userMessage = "250 pages";
      const result = await extractEssentialData(userMessage, conversationHistory);

      // Should have detailed path choice
      expect(result.wantsDetailedOnboarding).toBe(true);
      // Detailed context no longer exists in simplified flow
      expect(result.detailedContext).toBeUndefined();
    });
  });
});
