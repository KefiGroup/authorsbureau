import { describe, it, expect } from "vitest";

/**
 * Test suite for resume progress feature in GenerateManuscript.tsx
 * 
 * This tests the logic that automatically restores the user to the correct chapter
 * when they return to the chapter generation page after logging out/in.
 */

describe("Resume Progress Logic", () => {
  /**
   * Helper function that simulates the resume progress logic from GenerateManuscript.tsx
   * This is the same logic used in the useEffect hook
   */
  function findFirstUngeneratedChapter(
    sections: Array<{ type: string; number?: number }>,
    manuscripts: Array<{ sectionType: string; sectionNumber: number | null; content: string | null }>
  ): number {
    const firstUngeneratedIndex = sections.findIndex((section) => {
      const manuscript = manuscripts.find(
        (m) => m.sectionType === section.type && 
               (section.number === undefined || m.sectionNumber === section.number)
      );
      return !manuscript || manuscript.content === null;
    });

    if (firstUngeneratedIndex !== -1) {
      return firstUngeneratedIndex;
    } else {
      // All chapters generated, go to last one
      return sections.length - 1;
    }
  }

  it("should restore to Chapter 4 when Chapters 1-3 are generated", () => {
    const sections = [
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "chapter", number: 3 },
      { type: "chapter", number: 4 },
      { type: "chapter", number: 5 },
    ];

    const manuscripts = [
      { sectionType: "chapter", sectionNumber: 1, content: "Chapter 1 content" },
      { sectionType: "chapter", sectionNumber: 2, content: "Chapter 2 content" },
      { sectionType: "chapter", sectionNumber: 3, content: "Chapter 3 content" },
    ];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(3); // Index 3 = Chapter 4
  });

  it("should restore to Chapter 1 when no chapters are generated", () => {
    const sections = [
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "chapter", number: 3 },
    ];

    const manuscripts: Array<{ sectionType: string; sectionNumber: number | null; content: string | null }> = [];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(0); // Index 0 = Chapter 1
  });

  it("should restore to last chapter when all chapters are generated", () => {
    const sections = [
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "chapter", number: 3 },
    ];

    const manuscripts = [
      { sectionType: "chapter", sectionNumber: 1, content: "Chapter 1 content" },
      { sectionType: "chapter", sectionNumber: 2, content: "Chapter 2 content" },
      { sectionType: "chapter", sectionNumber: 3, content: "Chapter 3 content" },
    ];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(2); // Index 2 = Last chapter (Chapter 3)
  });

  it("should handle manuscripts with null content as ungenerated", () => {
    const sections = [
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "chapter", number: 3 },
    ];

    const manuscripts = [
      { sectionType: "chapter", sectionNumber: 1, content: "Chapter 1 content" },
      { sectionType: "chapter", sectionNumber: 2, content: null }, // Null content = ungenerated
      { sectionType: "chapter", sectionNumber: 3, content: "Chapter 3 content" },
    ];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(1); // Index 1 = Chapter 2 (has null content)
  });

  it("should handle prologue and epilogue sections correctly", () => {
    const sections = [
      { type: "prologue" },
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "epilogue" },
    ];

    const manuscripts = [
      { sectionType: "prologue", sectionNumber: null, content: "Prologue content" },
      { sectionType: "chapter", sectionNumber: 1, content: "Chapter 1 content" },
      // Chapter 2 not generated yet
    ];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(2); // Index 2 = Chapter 2
  });

  it("should restore to first ungenerated chapter even if later chapters exist", () => {
    // User generated Chapter 1, 3, 5 but skipped 2 and 4
    const sections = [
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "chapter", number: 3 },
      { type: "chapter", number: 4 },
      { type: "chapter", number: 5 },
    ];

    const manuscripts = [
      { sectionType: "chapter", sectionNumber: 1, content: "Chapter 1 content" },
      // Chapter 2 missing
      { sectionType: "chapter", sectionNumber: 3, content: "Chapter 3 content" },
      // Chapter 4 missing
      { sectionType: "chapter", sectionNumber: 5, content: "Chapter 5 content" },
    ];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(1); // Index 1 = Chapter 2 (first ungenerated)
  });

  it("should handle complex book structure with optional sections", () => {
    const sections = [
      { type: "dedication" },
      { type: "prologue" },
      { type: "chapter", number: 1 },
      { type: "chapter", number: 2 },
      { type: "chapter", number: 3 },
      { type: "epilogue" },
      { type: "acknowledgements" },
      { type: "authorBio" },
    ];

    const manuscripts = [
      { sectionType: "dedication", sectionNumber: null, content: "Dedication content" },
      { sectionType: "prologue", sectionNumber: null, content: "Prologue content" },
      { sectionType: "chapter", sectionNumber: 1, content: "Chapter 1 content" },
      { sectionType: "chapter", sectionNumber: 2, content: "Chapter 2 content" },
      // Chapter 3 not generated yet
    ];

    const result = findFirstUngeneratedChapter(sections, manuscripts);
    expect(result).toBe(4); // Index 4 = Chapter 3
  });
});
