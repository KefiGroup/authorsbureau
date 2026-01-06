import epub from "epub-gen-memory";

interface Chapter {
  title: string;
  content: string;
}

interface EpubOptions {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  publisher?: string;
  isbn?: string;
  copyrightPage?: string;
}

/**
 * Generate EPUB file from manuscript content
 * Returns Buffer containing the EPUB file
 */
export async function generateEpub(
  chapters: Chapter[],
  options: EpubOptions
): Promise<Buffer> {
  try {
    // Prepare chapter content with proper HTML formatting
    const formattedChapters = chapters.map((chapter) => ({
      title: chapter.title,
      content: `
        <h1>${chapter.title}</h1>
        ${chapter.content
          .split("\n\n")
          .map((para) => `<p>${para.trim()}</p>`)
          .join("\n")}
      `,
    }));

    // Add copyright page as first chapter if provided
    if (options.copyrightPage) {
      formattedChapters.unshift({
        title: "Copyright",
        content: `
          <div style="text-align: center; margin-top: 100px;">
            ${options.copyrightPage
              .split("\n")
              .map((line) => `<p>${line}</p>`)
              .join("\n")}
          </div>
        `,
      });
    }

    // Configure EPUB options
    const epubOptions = {
      title: options.title,
      author: options.author,
      publisher: options.publisher || "Authors Bureau",
      description: options.description || "",
      cover: options.coverUrl || undefined,
      isbn: options.isbn || undefined,
      lang: "en",
      tocTitle: "Table of Contents",
      appendChapterTitles: false, // We're adding titles manually in the HTML
      content: formattedChapters,
      // CSS styling for better readability
      css: `
        body {
          font-family: "Georgia", "Times New Roman", serif;
          font-size: 1.1em;
          line-height: 1.6;
          margin: 1em;
        }
        h1 {
          font-size: 1.8em;
          margin-top: 2em;
          margin-bottom: 1em;
          text-align: center;
          font-weight: bold;
        }
        p {
          margin-bottom: 1em;
          text-align: justify;
          text-indent: 1.5em;
        }
        p:first-of-type {
          text-indent: 0;
        }
      `,
    };

    // Generate EPUB and return as Buffer
    const content = await epub(epubOptions, formattedChapters);

    return content;
  } catch (error) {
    console.error("EPUB generation error:", error);
    throw new Error(`Failed to generate EPUB: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse manuscript content into chapters
 * Handles various chapter heading formats
 */
export function parseManuscriptIntoChapters(content: string): Chapter[] {
  const chapters: Chapter[] = [];

  // Split by common chapter patterns
  const chapterRegex = /^(Chapter \d+|CHAPTER \d+|Prologue|PROLOGUE|Epilogue|EPILOGUE|Introduction|INTRODUCTION)[:\s\-]*(.*?)$/gim;

  const parts = content.split(chapterRegex).filter(Boolean);

  // If no chapters found, treat entire content as one chapter
  if (parts.length <= 1) {
    return [
      {
        title: "Chapter 1",
        content: content.trim(),
      },
    ];
  }

  // Process chapter parts
  for (let i = 0; i < parts.length; i += 3) {
    const chapterLabel = parts[i]?.trim();
    const chapterTitle = parts[i + 1]?.trim();
    const chapterContent = parts[i + 2]?.trim();

    if (chapterLabel && chapterContent) {
      const fullTitle = chapterTitle
        ? `${chapterLabel}: ${chapterTitle}`
        : chapterLabel;

      chapters.push({
        title: fullTitle,
        content: chapterContent,
      });
    }
  }

  return chapters;
}
