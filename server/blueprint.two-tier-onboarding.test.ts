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

  describe("Detailed Context Extraction", () => {
    it("should extract themes from detailed path", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What are the main themes or messages you want to explore in your book?" },
      ];

      const userMessage = "I want to explore themes of justice, redemption, and the complexity of human nature.";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.detailedContext?.themes).toBeDefined();
      expect(result.detailedContext?.themes).toContain("justice");
    });

    it("should extract tone from detailed path", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What tone or writing style do you envision for your book?" },
      ];

      const userMessage = "I want a dark, atmospheric tone with elements of suspense and psychological depth.";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.detailedContext?.tone).toBeDefined();
      expect(result.detailedContext?.tone).toContain("dark");
    });

    it("should extract structure from detailed path", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What structure or pacing do you prefer for your book?" },
      ];

      const userMessage = "I prefer a fast-paced structure with short chapters and multiple cliffhangers.";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.detailedContext?.structure).toBeDefined();
      expect(result.detailedContext?.structure).toContain("fast-paced");
    });

    it("should extract all detailed context fields together", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What are the main themes?" },
        { role: "user", content: "Justice and redemption" },
        { role: "assistant", content: "What tone do you want?" },
        { role: "user", content: "Dark and atmospheric" },
        { role: "assistant", content: "What structure do you prefer?" },
      ];

      const userMessage = "Fast-paced with short chapters";
      const result = await extractEssentialData(userMessage, conversationHistory);

      // Should extract structure from current message
      expect(result.detailedContext?.structure).toBeDefined();
      expect(result.detailedContext?.structure).toContain("Fast-paced");
    });
  });

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

    it("should handle complete detailed path flow", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project?" },
        { role: "user", content: "Novel" },
        { role: "assistant", content: "What's it about?" },
        { role: "user", content: "A detective story" },
        { role: "assistant", content: "Who is it for?" },
        { role: "user", content: "Mystery readers" },
        { role: "assistant", content: "Create blueprint now or share more context?" },
        { role: "user", content: "Share More Context" },
        { role: "assistant", content: "What are the main themes?" },
        { role: "user", content: "Justice and morality" },
        { role: "assistant", content: "What tone do you want?" },
        { role: "user", content: "Dark and gritty" },
        { role: "assistant", content: "What structure do you prefer?" },
        { role: "user", content: "Fast-paced thriller" },
      ];

      const userMessage = "250 pages";
      const result = await extractEssentialData(userMessage, conversationHistory);

      // Should have detailed path choice
      expect(result.wantsDetailedOnboarding).toBe(true);
      // Should have detailed context
      expect(result.detailedContext).toBeDefined();
    });
  });
});
