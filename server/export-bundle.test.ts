import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateExportBundle } from "./export-bundle";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://s3.example.com/test.zip",
    key: "exports/test.zip"
  })
}));

describe("Export Bundle - Data URL Cover Fix", () => {
  const testManuscript = "Chapter 1\n\nThis is a test manuscript.";
  
  const testMetadata = {
    title: "Test Book",
    subtitle: "A Test",
    description: "Test description",
    categories: ["Books > Self-Help"],
    keywords: ["test"],
    price: "$9.99",
    genre: "Self-Help"
  };

  it("should handle data URL covers (base64 encoded images)", async () => {
    // Small 1x1 red pixel PNG as data URL
    const dataUrlCover = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
    
    const result = await generateExportBundle({
      bookTitle: "Test Book",
      authorName: "Test Author",
      manuscriptContent: testManuscript,
      coverImageUrl: dataUrlCover,
      metadata: testMetadata
    });

    expect(result).toBeDefined();
    expect(result.zipUrl).toBe("https://s3.example.com/test.zip");
    expect(result.files.cover_image).toBeDefined();
  });

  it("should handle HTTP URL covers (regular image URLs)", async () => {
    const httpUrlCover = "https://example.com/cover.png";
    
    // Mock fetch for HTTP URLs
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
    });

    const result = await generateExportBundle({
      bookTitle: "Test Book",
      authorName: "Test Author",
      manuscriptContent: testManuscript,
      coverImageUrl: httpUrlCover,
      metadata: testMetadata
    });

    expect(result).toBeDefined();
    expect(result.zipUrl).toBe("https://s3.example.com/test.zip");
    expect(result.files.cover_image).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(httpUrlCover);
  });

  it("should work without a cover image", async () => {
    const result = await generateExportBundle({
      bookTitle: "Test Book",
      authorName: "Test Author",
      manuscriptContent: testManuscript,
      metadata: testMetadata
    });

    expect(result).toBeDefined();
    expect(result.zipUrl).toBe("https://s3.example.com/test.zip");
    expect(result.files.cover_image).toBeUndefined();
  });

  it("should continue export even if cover processing fails", async () => {
    const invalidDataUrl = "data:image/png;base64,INVALID";
    
    const result = await generateExportBundle({
      bookTitle: "Test Book",
      authorName: "Test Author",
      manuscriptContent: testManuscript,
      coverImageUrl: invalidDataUrl,
      metadata: testMetadata
    });

    // Should still succeed even if cover fails
    expect(result).toBeDefined();
    expect(result.zipUrl).toBe("https://s3.example.com/test.zip");
  });

  it("should include all required files in the bundle", async () => {
    const result = await generateExportBundle({
      bookTitle: "Test Book",
      authorName: "Test Author",
      manuscriptContent: testManuscript,
      coverImageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      metadata: testMetadata,
      isbn: "978-1234567890"
    });

    expect(result.files.manuscript_docx).toBeDefined();
    expect(result.files.kdp_metadata).toBe("KDP_Listing_Data.txt");
    expect(result.files.cover_image).toBeDefined();
    expect(result.files.isbn_info).toBe("ISBN_Information.txt");
  });
});
