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
  });
});
