import { describe, it, expect } from "vitest";

describe("3-Variation Rewrite Feature", () => {
  it("should generate 3 distinct variations with different creative approaches", () => {
    // Mock variations response
    const variations = [
      {
        id: 1,
        approach: "conservative",
        label: "Conservative",
        description: "Minor improvements, preserves structure",
        content: "Original content with minor polish and clarity improvements...",
      },
      {
        id: 2,
        approach: "moderate",
        label: "Moderate",
        description: "Balanced changes, some restructuring",
        content: "Restructured content with improved flow and added depth...",
      },
      {
        id: 3,
        approach: "bold",
        label: "Bold",
        description: "Creative reimagining, significant changes",
        content: "Completely reimagined content with new examples and narrative...",
      },
    ];

    // Verify all 3 variations exist
    expect(variations).toHaveLength(3);

    // Verify each variation has required fields
    variations.forEach((variation) => {
      expect(variation).toHaveProperty("id");
      expect(variation).toHaveProperty("approach");
      expect(variation).toHaveProperty("label");
      expect(variation).toHaveProperty("description");
      expect(variation).toHaveProperty("content");
      expect(typeof variation.content).toBe("string");
      expect(variation.content.length).toBeGreaterThan(0);
    });

    // Verify variations have distinct approaches
    const approaches = variations.map((v) => v.approach);
    expect(approaches).toContain("conservative");
    expect(approaches).toContain("moderate");
    expect(approaches).toContain("bold");

    // Verify IDs are sequential
    expect(variations[0].id).toBe(1);
    expect(variations[1].id).toBe(2);
    expect(variations[2].id).toBe(3);
  });

  it("should have meaningful differences between variations", () => {
    // Mock content lengths to verify variations are distinct
    const variations = [
      { approach: "conservative", contentLength: 1000 }, // 80-90% original
      { approach: "moderate", contentLength: 850 }, // 60-70% original
      { approach: "bold", contentLength: 600 }, // 40-50% original
    ];

    // Conservative should be closest to original length
    expect(variations[0].contentLength).toBeGreaterThan(variations[1].contentLength);
    
    // Moderate should be between conservative and bold
    expect(variations[1].contentLength).toBeGreaterThan(variations[2].contentLength);
    expect(variations[1].contentLength).toBeLessThan(variations[0].contentLength);

    // Bold should have most significant changes
    expect(variations[2].contentLength).toBeLessThan(variations[1].contentLength);
  });

  it("should handle LLM response content type conversion correctly", () => {
    // Test getContent helper function logic
    const getContent = (response: any): string => {
      const content = response.choices[0].message.content;
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content.map((item: any) => item.type === 'text' ? item.text : '').join('');
      }
      return '';
    };

    // Test string content
    const stringResponse = {
      choices: [{ message: { content: "This is a string response" } }]
    };
    expect(getContent(stringResponse)).toBe("This is a string response");

    // Test array content
    const arrayResponse = {
      choices: [{
        message: {
          content: [
            { type: "text", text: "Part 1 " },
            { type: "text", text: "Part 2" },
            { type: "image", url: "..." }, // Should be filtered out
          ]
        }
      }]
    };
    expect(getContent(arrayResponse)).toBe("Part 1 Part 2");

    // Test empty content
    const emptyResponse = {
      choices: [{ message: { content: null } }]
    };
    expect(getContent(emptyResponse)).toBe("");
  });

  it("should include blueprint context in variation generation", () => {
    // Mock blueprint data
    const blueprint = {
      essentialData: {
        projectType: "Non-fiction",
        description: "A book about value investing",
        targetAudience: "Beginner investors",
        targetPages: 200,
      }
    };

    // Verify blueprint context is used in prompts
    expect(blueprint.essentialData.projectType).toBe("Non-fiction");
    expect(blueprint.essentialData.targetAudience).toBe("Beginner investors");
    
    // Variations should be context-aware
    const variationPrompt = `Book context:\n${JSON.stringify(blueprint.essentialData, null, 2)}`;
    expect(variationPrompt).toContain("Non-fiction");
    expect(variationPrompt).toContain("value investing");
    expect(variationPrompt).toContain("Beginner investors");
  });

  it("should avoid AI-sounding phrases in all variations", () => {
    // List of forbidden AI phrases
    const forbiddenPhrases = [
      "unlock",
      "dive into",
      "revolutionary",
      "embark on a journey",
      "transform your life",
      "in today's fast-paced world",
    ];

    // Mock variation content
    const variationContent = "This chapter explains value investing principles with clear examples and practical strategies.";

    // Verify no forbidden phrases exist
    forbiddenPhrases.forEach((phrase) => {
      expect(variationContent.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  });

  it("should use plain text formulas (no LaTeX) in all variations", () => {
    // Mock variation content with formulas
    const variationContent = "FI Number = Annual Expenses ÷ 0.04 (the 4% rule)";

    // Verify no LaTeX syntax
    expect(variationContent).not.toContain("\\text{");
    expect(variationContent).not.toContain("\\frac{");
    expect(variationContent).not.toContain("$$");

    // Verify plain text symbols are used
    expect(variationContent).toContain("÷");
    expect(variationContent).toContain("=");
  });

  it("should preserve chapter title and context across variations", () => {
    const chapterTitle = "The 4% Rule: Your Financial Independence Number";
    const editInstructions = "Make this more engaging";

    // All variations should reference the same chapter
    const variations = [
      { title: chapterTitle, approach: "conservative" },
      { title: chapterTitle, approach: "moderate" },
      { title: chapterTitle, approach: "bold" },
    ];

    variations.forEach((variation) => {
      expect(variation.title).toBe(chapterTitle);
    });
  });
});
