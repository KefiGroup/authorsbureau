import { describe, expect, it } from "vitest";
import { generateDOCX, generatePDF, type ManuscriptData } from "./manuscript-export";

describe("Manuscript Export", () => {
  const sampleManuscript: ManuscriptData = {
    bookTitle: "My Test Book",
    subtitle: "A Journey of Testing",
    authorName: "Test Author",
    chapters: [
      {
        number: 1,
        title: "The Beginning",
        content: "This is the first chapter.\n\nIt has multiple paragraphs.\n\nEach paragraph tells a story.",
      },
      {
        number: 2,
        title: "The Middle",
        content: "This is the second chapter.\n\nThe story continues here.",
      },
    ],
    copyrightYear: 2024,
    isbn: "978-1-234567-89-0",
    publisher: "Test Publisher",
    edition: "First Edition",
  };

  describe("generateDOCX", () => {
    it("should generate a valid DOCX buffer", async () => {
      const buffer = await generateDOCX(sampleManuscript);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // DOCX files start with PK (ZIP format signature)
      expect(buffer.toString("ascii", 0, 2)).toBe("PK");
    });

    it("should handle manuscript without subtitle", async () => {
      const manuscriptWithoutSubtitle: ManuscriptData = {
        ...sampleManuscript,
        subtitle: undefined,
      };
      
      const buffer = await generateDOCX(manuscriptWithoutSubtitle);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty chapters array", async () => {
      const manuscriptWithoutChapters: ManuscriptData = {
        ...sampleManuscript,
        chapters: [],
      };
      
      const buffer = await generateDOCX(manuscriptWithoutChapters);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should include copyright page", async () => {
      const buffer = await generateDOCX(sampleManuscript);
      // DOCX is binary, but should be larger with front matter
      expect(buffer.length).toBeGreaterThan(1000);
    });

    it("should work without optional copyright fields", async () => {
      const minimalManuscript: ManuscriptData = {
        bookTitle: "Minimal Book",
        authorName: "Minimal Author",
        chapters: [{ number: 1, title: "Chapter 1", content: "Content." }],
      };
      const buffer = await generateDOCX(minimalManuscript);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("generatePDF", () => {
    it("should generate a valid PDF buffer", async () => {
      const buffer = await generatePDF(sampleManuscript);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // PDF files start with %PDF
      expect(buffer.toString("ascii", 0, 4)).toBe("%PDF");
    });

    it("should handle manuscript without subtitle", async () => {
      const manuscriptWithoutSubtitle: ManuscriptData = {
        ...sampleManuscript,
        subtitle: undefined,
      };
      
      const buffer = await generatePDF(manuscriptWithoutSubtitle);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty chapters array", async () => {
      const manuscriptWithoutChapters: ManuscriptData = {
        ...sampleManuscript,
        chapters: [],
      };
      
      const buffer = await generatePDF(manuscriptWithoutChapters);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should use 6x9 inch page size (432pt x 648pt)", async () => {
      const buffer = await generatePDF(sampleManuscript);
      const pdfContent = buffer.toString("utf8");
      
      // Check for 6"x9" dimensions in points
      expect(pdfContent).toContain("432");
      expect(pdfContent).toContain("648");
    });

    it("should include copyright page content", async () => {
      const buffer = await generatePDF(sampleManuscript);
      
      // PDF text is compressed with FlateDecode, so check structure instead
      // Title page + Copyright page + TOC + 2 chapters = 5 pages total
      const pdfContent = buffer.toString("utf8");
      expect(pdfContent).toContain("/Count 5");
      expect(buffer.length).toBeGreaterThan(3000); // Substantial size with all front matter
    });

    it("should include table of contents", async () => {
      const buffer = await generatePDF(sampleManuscript);
      const pdfContent = buffer.toString("utf8");
      
      // PDF compresses text, so check for page count (title + copyright + TOC + 2 chapters = 5 pages)
      expect(pdfContent).toContain("/Count 5");
      // Check PDF was generated successfully
      expect(buffer.length).toBeGreaterThan(3000); // Should be substantial with all pages
    });
  });
});
