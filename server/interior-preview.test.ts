import { describe, it, expect } from "vitest";
import { parseIntoPages, generatePagePreviewHTML, getPreviewSummary } from "./interior-preview";

describe("Interior Preview", () => {
  const sampleManuscript = `
Chapter 1: The Beginning

This is the first chapter content. It has multiple paragraphs to test the pagination system.

This is the second paragraph of the first chapter. We need enough content to test page breaks.

Chapter 2: The Middle

This is the second chapter content. It should appear on a new page because chapter headings trigger page breaks.

More content for chapter two to ensure proper formatting.

Epilogue

This is the epilogue content. It should also start on a new page.
  `.trim();

  describe("parseIntoPages", () => {
    it("should parse manuscript into pages", () => {
      const pages = parseIntoPages(sampleManuscript);
      
      expect(pages.length).toBeGreaterThan(0);
      expect(pages[0].pageNumber).toBe(1);
    });

    it("should detect chapter starts", () => {
      const pages = parseIntoPages(sampleManuscript);
      
      const chapterPages = pages.filter(p => p.isChapterStart);
      expect(chapterPages.length).toBeGreaterThan(0);
      expect(chapterPages[0].chapterTitle).toContain("Chapter 1");
    });

    it("should handle custom words per page", () => {
      const shortContent = "This is a short manuscript with only a few words.";
      const pages = parseIntoPages(shortContent, { wordsPerPage: 5 });
      
      expect(pages.length).toBeGreaterThan(0);
    });

    it("should assign sequential page numbers", () => {
      const pages = parseIntoPages(sampleManuscript);
      
      for (let i = 0; i < pages.length; i++) {
        expect(pages[i].pageNumber).toBe(i + 1);
      }
    });
  });

  describe("generatePagePreviewHTML", () => {
    it("should generate valid HTML", () => {
      const pages = parseIntoPages(sampleManuscript);
      const html = generatePagePreviewHTML(pages[0], {
        bookTitle: "Test Book",
        authorName: "Test Author",
      });
      
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("</html>");
    });

    it("should include page number", () => {
      const pages = parseIntoPages(sampleManuscript);
      const html = generatePagePreviewHTML(pages[0], {
        bookTitle: "Test Book",
        authorName: "Test Author",
      });
      
      expect(html).toContain("page-number");
      expect(html).toContain(pages[0].pageNumber.toString());
    });

    it("should include chapter title for chapter start pages", () => {
      const pages = parseIntoPages(sampleManuscript);
      const chapterPage = pages.find(p => p.isChapterStart);
      
      if (chapterPage) {
        const html = generatePagePreviewHTML(chapterPage, {
          bookTitle: "Test Book",
          authorName: "Test Author",
        });
        
        expect(html).toContain("chapter-title");
        expect(html).toContain(chapterPage.chapterTitle);
      }
    });

    it("should respect custom font size", () => {
      const pages = parseIntoPages(sampleManuscript);
      const html = generatePagePreviewHTML(pages[0], {
        bookTitle: "Test Book",
        authorName: "Test Author",
        fontSize: 14,
      });
      
      expect(html).toContain("font-size: 14pt");
    });

    it("should respect custom line spacing", () => {
      const pages = parseIntoPages(sampleManuscript);
      const html = generatePagePreviewHTML(pages[0], {
        bookTitle: "Test Book",
        authorName: "Test Author",
        lineSpacing: 2.0,
      });
      
      expect(html).toContain("line-height: 2");
    });

    it("should escape HTML special characters", () => {
      const testContent = "This has <script>alert('xss')</script> and & symbols";
      const pages = parseIntoPages(testContent);
      const html = generatePagePreviewHTML(pages[0], {
        bookTitle: "Test Book",
        authorName: "Test Author",
      });
      
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("&amp;");
    });
  });

  describe("getPreviewSummary", () => {
    it("should calculate total pages", () => {
      const summary = getPreviewSummary(sampleManuscript);
      
      expect(summary.totalPages).toBeGreaterThan(0);
      expect(typeof summary.totalPages).toBe("number");
    });

    it("should calculate total words", () => {
      const summary = getPreviewSummary(sampleManuscript);
      
      expect(summary.totalWords).toBeGreaterThan(0);
      expect(typeof summary.totalWords).toBe("number");
    });

    it("should estimate read time", () => {
      const summary = getPreviewSummary(sampleManuscript);
      
      expect(summary.estimatedReadTime).toBeGreaterThan(0);
      expect(typeof summary.estimatedReadTime).toBe("number");
    });

    it("should provide sample page numbers", () => {
      const summary = getPreviewSummary(sampleManuscript);
      
      expect(Array.isArray(summary.samplePageNumbers)).toBe(true);
      expect(summary.samplePageNumbers.length).toBeGreaterThan(0);
      expect(summary.samplePageNumbers).toContain(1); // First page
      expect(summary.samplePageNumbers).toContain(summary.totalPages); // Last page
    });

    it("should not have duplicate sample pages", () => {
      const shortContent = "Short content";
      const summary = getPreviewSummary(shortContent);
      
      const uniquePages = new Set(summary.samplePageNumbers);
      expect(uniquePages.size).toBe(summary.samplePageNumbers.length);
    });
  });
});
