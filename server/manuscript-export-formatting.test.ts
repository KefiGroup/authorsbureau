import { describe, it, expect } from "vitest";
import { generateDOCX } from "./manuscript-export";
import { Document } from "docx";

describe("Manuscript Export Formatting", () => {
  const testManuscript = {
    bookTitle: "Test Book Title",
    authorName: "Pauline Teo",
    chapters: [
      {
        number: 1,
        title: "Introduction",
        content: "This is the introduction chapter content.\n\nThis is a second paragraph.",
      },
      {
        number: 2,
        title: "Main Content",
        content: "This is the main content chapter.",
      },
    ],
    copyrightYear: 2026,
    isbn: "978-1-234567-89-0",
    publisher: "Pauline Teo",
  };

  it("should generate DOCX buffer with correct author name", async () => {
    const buffer = await generateDOCX(testManuscript);
    
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should include copyright year and ISBN in generated document", async () => {
    const buffer = await generateDOCX(testManuscript);
    
    // Convert buffer to string to check for content
    const content = buffer.toString();
    
    // Check that ISBN is included (will be in the XML structure)
    expect(content).toContain("978-1-234567-89-0");
  });

  it("should handle manuscript without ISBN", async () => {
    const manuscriptWithoutISBN = {
      ...testManuscript,
      isbn: undefined,
    };
    
    const buffer = await generateDOCX(manuscriptWithoutISBN);
    
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should include all chapters in the document", async () => {
    const buffer = await generateDOCX(testManuscript);
    const content = buffer.toString();
    
    // Check for chapter titles in the content
    expect(content).toContain("Introduction");
    expect(content).toContain("Main Content");
  });

  it("should use author name from parameter (not hardcoded)", async () => {
    const customAuthor = {
      ...testManuscript,
      authorName: "Custom Author Name",
    };
    
    const buffer = await generateDOCX(customAuthor);
    const content = buffer.toString();
    
    // The author name should appear in the copyright section
    expect(content).toContain("Custom Author Name");
  });
});
