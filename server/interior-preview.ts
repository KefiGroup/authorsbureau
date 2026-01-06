/**
 * Interior Preview Generator
 * Generates preview images of formatted manuscript pages
 */

interface PreviewOptions {
  bookTitle: string;
  authorName: string;
  content: string;
  pageNumber: number;
  trimSize?: "6x9"; // Only 6x9 supported
  fontSize?: number; // 10, 11, or 12pt
  lineSpacing?: number; // 1.0, 1.15, 1.5, 2.0
}

interface PreviewPage {
  pageNumber: number;
  content: string;
  isChapterStart: boolean;
  chapterTitle?: string;
}

/**
 * Parse manuscript into pages for preview
 * Each page is approximately 250-300 words for 6"x9" format
 */
export function parseIntoPages(
  content: string,
  options: {
    wordsPerPage?: number;
  } = {}
): PreviewPage[] {
  const wordsPerPage = options.wordsPerPage || 275; // Average for 6x9 with 12pt font
  
  const pages: PreviewPage[] = [];
  const lines = content.split("\n");
  
  let currentPage: string[] = [];
  let currentWordCount = 0;
  let pageNumber = 1;
  let isChapterStart = false;
  let chapterTitle: string | undefined;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detect chapter headings
    const chapterMatch = trimmedLine.match(/^(Chapter \d+|CHAPTER \d+|Prologue|PROLOGUE|Epilogue|EPILOGUE|Introduction|INTRODUCTION)[:\s\-]*(.*?)$/i);
    
    if (chapterMatch) {
      // Start new page for chapter
      if (currentPage.length > 0) {
        pages.push({
          pageNumber: pageNumber++,
          content: currentPage.join("\n"),
          isChapterStart: isChapterStart,
          chapterTitle: chapterTitle,
        });
        currentPage = [];
        currentWordCount = 0;
      }
      
      isChapterStart = true;
      chapterTitle = chapterMatch[2] ? `${chapterMatch[1]}: ${chapterMatch[2]}` : chapterMatch[1];
      currentPage.push(trimmedLine);
      continue;
    }
    
    // Count words in line
    const wordCount = trimmedLine.split(/\s+/).filter(Boolean).length;
    
    // Check if adding this line would exceed page limit
    if (currentWordCount + wordCount > wordsPerPage && currentPage.length > 0) {
      pages.push({
        pageNumber: pageNumber++,
        content: currentPage.join("\n"),
        isChapterStart: isChapterStart,
        chapterTitle: chapterTitle,
      });
      currentPage = [];
      currentWordCount = 0;
      isChapterStart = false;
      chapterTitle = undefined;
    }
    
    currentPage.push(line);
    currentWordCount += wordCount;
  }
  
  // Add final page
  if (currentPage.length > 0) {
    pages.push({
      pageNumber: pageNumber,
      content: currentPage.join("\n"),
      isChapterStart: isChapterStart,
      chapterTitle: chapterTitle,
    });
  }
  
  return pages;
}

/**
 * Generate HTML preview for a specific page
 * Returns HTML string that can be rendered in browser
 */
export function generatePagePreviewHTML(
  page: PreviewPage,
  options: {
    bookTitle: string;
    authorName: string;
    fontSize?: number;
    lineSpacing?: number;
  }
): string {
  const fontSize = options.fontSize || 12;
  const lineSpacing = options.lineSpacing || 1.5;
  
  // 6x9 trim size = 432pt x 648pt (at 72 DPI)
  // With 1" margins = 360pt x 576pt content area
  const pageWidth = 432;
  const pageHeight = 648;
  const marginTop = 72;
  const marginBottom = 72;
  const marginLeft = 72;
  const marginRight = 72;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .page {
      width: ${pageWidth}px;
      height: ${pageHeight}px;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
      padding: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px;
    }
    
    .page-number {
      position: absolute;
      bottom: 36px;
      ${page.pageNumber % 2 === 0 ? 'left: 36px' : 'right: 36px'};
      font-size: 10pt;
      color: #666;
    }
    
    .chapter-title {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 48pt;
      margin-top: 72pt;
    }
    
    .content {
      font-size: ${fontSize}pt;
      line-height: ${lineSpacing};
      text-align: justify;
      hyphens: auto;
    }
    
    .content p {
      margin-bottom: 1em;
      text-indent: 1.5em;
    }
    
    .content p:first-child {
      text-indent: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    ${page.isChapterStart && page.chapterTitle ? `
      <div class="chapter-title">${escapeHtml(page.chapterTitle)}</div>
    ` : ''}
    
    <div class="content">
      ${page.content
        .split('\n\n')
        .filter(para => para.trim())
        .map(para => `<p>${escapeHtml(para.trim())}</p>`)
        .join('\n')}
    </div>
    
    <div class="page-number">${page.pageNumber}</div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Get preview summary with page count and sample pages
 */
export function getPreviewSummary(content: string): {
  totalPages: number;
  totalWords: number;
  estimatedReadTime: number; // minutes
  samplePageNumbers: number[]; // First page, middle page, last page
} {
  const pages = parseIntoPages(content);
  const words = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(words / 250); // Average reading speed
  
  const samplePages = [
    1, // First page
    Math.floor(pages.length / 2), // Middle page
    pages.length, // Last page
  ].filter((num, idx, arr) => arr.indexOf(num) === idx); // Remove duplicates
  
  return {
    totalPages: pages.length,
    totalWords: words,
    estimatedReadTime: readTime,
    samplePageNumbers: samplePages,
  };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
