import { describe, it, expect } from "vitest";
import { generateEpub, parseManuscriptIntoChapters } from "./epub-generator";

describe("EPUB Generator", () => {
  it("should parse manuscript into chapters", () => {
    const manuscript = `
Chapter 1: The Beginning

This is the first chapter content.
It has multiple paragraphs.

Chapter 2: The Middle

This is the second chapter.

Epilogue

This is the epilogue.
    `.trim();

    const chapters = parseManuscriptIntoChapters(manuscript);
    
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters[0].title).toContain("Chapter 1");
    expect(chapters[0].content).toContain("first chapter");
  });

  it("should handle manuscript without chapter markers", () => {
    const manuscript = "This is a simple manuscript without chapters.";
    const chapters = parseManuscriptIntoChapters(manuscript);
    
    expect(chapters.length).toBe(1);
    expect(chapters[0].title).toBe("Chapter 1");
    expect(chapters[0].content).toBe(manuscript);
  });

  it("should generate EPUB buffer", async () => {
    const chapters = [
      {
        title: "Chapter 1",
        content: "This is chapter one content.",
      },
      {
        title: "Chapter 2",
        content: "This is chapter two content.",
      },
    ];

    const options = {
      title: "Test Book",
      author: "Test Author",
      description: "A test book for EPUB generation",
    };

    const epubBuffer = await generateEpub(chapters, options);
    
    expect(epubBuffer).toBeInstanceOf(Buffer);
    expect(epubBuffer.length).toBeGreaterThan(0);
    
    // EPUB files are ZIP archives, should start with PK (ZIP signature)
    expect(epubBuffer.toString('ascii', 0, 2)).toBe('PK');
  });

  it("should include copyright page when provided", async () => {
    const chapters = [
      {
        title: "Chapter 1",
        content: "Content here.",
      },
    ];

    const options = {
      title: "Test Book",
      author: "Test Author",
      copyrightPage: "Copyright 2026 Test Author\nAll rights reserved.",
    };

    const epubBuffer = await generateEpub(chapters, options);
    
    expect(epubBuffer).toBeInstanceOf(Buffer);
    expect(epubBuffer.length).toBeGreaterThan(0);
  });
});
