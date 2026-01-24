import { describe, it, expect } from "vitest";
import { extractEssentialData } from "./writing-studio-agent-v2";

/**
 * Unit tests for simplified single-path onboarding system
 * 
 * Tests the simplified flow:
 * 1. User answers 3 essential questions (type, description, audience)
 * 2. Modal appears automatically with page count checkboxes
 * 3. Blueprint generation begins
 * 
 * No branching choice - single streamlined path for all users
 */

describe("Single-Path Onboarding System", () => {
  describe("Essential Data Extraction", () => {
    it("should extract project type", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
      ];

      const userMessage = "I'm writing a science fiction novel";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.projectType).toBeDefined();
      expect(result.projectType?.toLowerCase()).toContain("novel");
    });

    it("should extract brief description", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
        { role: "user", content: "A novel" },
        { role: "assistant", content: "What's your book about?" },
      ];

      const userMessage = "It's about a detective solving mysteries in Victorian London. The protagonist uses forensic science that was cutting-edge for the time.";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.briefDescription).toBeDefined();
      expect(result.briefDescription).toContain("detective");
    });

    it("should extract target audience", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
        { role: "user", content: "A novel" },
        { role: "assistant", content: "What's your book about?" },
        { role: "user", content: "A detective story in Victorian London" },
        { role: "assistant", content: "Who is this book for?" },
      ];

      const userMessage = "Adult mystery readers aged 30-50 who enjoy historical fiction";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.targetAudience).toBeDefined();
      expect(result.targetAudience).toContain("Adult");
    });

    it("should extract working title if mentioned", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project are you writing?" },
      ];

      const userMessage = "I'm writing a novel called 'The Last Detective'";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.workingTitle).toBeDefined();
      expect(result.workingTitle).toContain("Last Detective");
    });
  });

  describe("Complete Flow Scenarios", () => {
    it("should extract all 3 essential fields from complete conversation", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What type of project?" },
        { role: "user", content: "Novel" },
        { role: "assistant", content: "What's it about?" },
        { role: "user", content: "A detective story in Victorian London" },
        { role: "assistant", content: "Who is it for?" },
      ];

      const userMessage = "Adult mystery readers aged 30-50";
      const result = await extractEssentialData(userMessage, conversationHistory);

      // Should have all 3 essential pieces
      expect(result.projectType).toBeDefined();
      expect(result.briefDescription).toBeDefined();
      expect(result.targetAudience).toBeDefined();
      
      // Should NOT have branching choice field (removed in simplified flow)
      expect(result).not.toHaveProperty("wantsDetailedOnboarding");
    });

    it("should handle complex multi-sentence responses", async () => {
      const conversationHistory = [
        { role: "assistant", content: "What's your book about?" },
      ];

      const userMessage = "My book explores the intersection of technology and humanity in a dystopian future. The protagonist discovers that the AI governing society has been manipulating human emotions. It's a thriller with philosophical undertones about free will and consciousness.";
      const result = await extractEssentialData(userMessage, conversationHistory);

      expect(result.briefDescription).toBeDefined();
      expect(result.briefDescription?.length).toBeGreaterThan(50);
    });
  });
});
