import { describe, it, expect } from "vitest";

/**
 * Test suite for markdown stripping functionality
 * Tests the stripMarkdownFromText function used in variation text display
 */

/**
 * Strip ALL markdown formatting from text
 * Removes: ##, **, *, _,  __, ~~, `, etc.
 * This is the same function used in routers.ts
 */
function stripMarkdownFromText(text: string): string {
  if (!text) return text;
  
  return text
    // Remove headers (##, ###, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code (`text`)
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks (```text```)
    .replace(/```[\s\S]*?```/g, '')
    // Clean up any remaining asterisks or underscores
    .replace(/[*_]/g, '')
    .trim();
}

describe("Markdown Stripping Function", () => {
  it("should remove header markers (##, ###)", () => {
    const input = "## Chapter Title\nSome content here.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("##");
    expect(output).toContain("Chapter Title");
    expect(output).toContain("Some content here");
  });

  it("should remove bold markers (**text**)", () => {
    const input = "This is **bold text** in a sentence.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("**");
    expect(output).toBe("This is bold text in a sentence.");
  });

  it("should remove bold markers (__text__)", () => {
    const input = "This is __bold text__ in a sentence.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("__");
    expect(output).toBe("This is bold text in a sentence.");
  });

  it("should remove italic markers (*text*)", () => {
    const input = "This is *italic text* in a sentence.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("*");
    expect(output).toBe("This is italic text in a sentence.");
  });

  it("should remove italic markers (_text_)", () => {
    const input = "This is _italic text_ in a sentence.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("_");
    expect(output).toBe("This is italic text in a sentence.");
  });

  it("should remove strikethrough markers (~~text~~)", () => {
    const input = "This is ~~strikethrough text~~ in a sentence.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("~~");
    expect(output).toBe("This is strikethrough text in a sentence.");
  });

  it("should remove inline code markers (`text`)", () => {
    const input = "This is `code text` in a sentence.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("`");
    expect(output).toBe("This is code text in a sentence.");
  });

  it("should remove code blocks (```text```)", () => {
    const input = "Some text\n```\ncode block\n```\nMore text";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("```");
    expect(output).not.toContain("code block");
    expect(output).toContain("Some text");
    expect(output).toContain("More text");
  });

  it("should handle multiple markdown formats in one string", () => {
    const input = "## Title\n\nThis is **bold** and *italic* and `code` text.";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("##");
    expect(output).not.toContain("**");
    expect(output).not.toContain("*");
    expect(output).not.toContain("`");
    expect(output).toContain("Title");
    expect(output).toContain("This is bold and italic and code text");
  });

  it("should preserve plain text without markdown", () => {
    const input = "This is plain text with no formatting.";
    const output = stripMarkdownFromText(input);
    
    expect(output).toBe("This is plain text with no formatting.");
  });

  it("should handle empty string", () => {
    const input = "";
    const output = stripMarkdownFromText(input);
    
    expect(output).toBe("");
  });

  it("should handle text with special characters", () => {
    const input = "Text with quotes \"like this\" and apostrophes like it's working!";
    const output = stripMarkdownFromText(input);
    
    expect(output).toBe("Text with quotes \"like this\" and apostrophes like it's working!");
  });

  it("should handle real AI-generated variation text with markdown", () => {
    const input = `## Conservative Variation

This is a **bold statement** about the chapter. The protagonist feels *uncertain* about their decision.

They wonder if they should \`continue\` or turn back.`;
    
    const output = stripMarkdownFromText(input);
    
    // Should not contain any markdown symbols
    expect(output).not.toContain("##");
    expect(output).not.toContain("**");
    expect(output).not.toContain("*");
    expect(output).not.toContain("`");
    
    // Should contain the actual content
    expect(output).toContain("Conservative Variation");
    expect(output).toContain("bold statement");
    expect(output).toContain("uncertain");
    expect(output).toContain("continue");
  });

  it("should handle nested markdown formatting", () => {
    const input = "**This is _bold and italic_ text**";
    const output = stripMarkdownFromText(input);
    
    expect(output).not.toContain("**");
    expect(output).not.toContain("_");
    expect(output).toBe("This is bold and italic text");
  });

  it("should trim whitespace after stripping", () => {
    const input = "  ## Title  \n\n  **Bold**  ";
    const output = stripMarkdownFromText(input);
    
    expect(output).toBe("Title\n\n  Bold");
  });
});
