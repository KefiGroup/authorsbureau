import { storagePut } from "./storage";
import archiver from "archiver";
import { Readable } from "stream";
import { generateDOCX, generatePDF, type ManuscriptData } from "./manuscript-export";

/**
 * Export bundle containing all publishing materials
 */
export interface ExportBundle {
  zipUrl: string;
  zipKey: string;
  files: {
    manuscript_docx?: string;
    manuscript_pdf?: string;
    cover_image?: string;
    kdp_metadata?: string;
    isbn_info?: string;
  };
  createdAt: number;
}

/**
 * Generate complete publishing package as ZIP
 */
export async function generateExportBundle(params: {
  bookTitle: string;
  authorName: string;
  manuscriptContent: string;
  coverImageUrl?: string;
  metadata: {
    title: string;
    subtitle?: string;
    description: string;
    categories: string[];
    keywords: string[];
    price?: string;
    genre: string;
  };
  isbn?: string;
}): Promise<ExportBundle> {
  const { bookTitle, authorName, manuscriptContent, coverImageUrl, metadata, isbn } = params;
  
  try {
    // Create ZIP archive in memory
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    
    // Collect chunks as they're generated
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    
    // Create promise to wait for archive completion
    const archiveComplete = new Promise<void>((resolve, reject) => {
      archive.on("finish", () => resolve());
      archive.on("error", (err) => reject(err));
    });
    
    // Parse manuscript content into chapters
    const chapters = parseManuscriptIntoChapters(manuscriptContent);
    
    // Generate DOCX (eBook format)
    const manuscriptData: ManuscriptData = {
      bookTitle,
      subtitle: metadata.subtitle,
      authorName,
      chapters,
    };
    
    try {
      const docxBuffer = await generateDOCX(manuscriptData);
      const docxFilename = `${sanitizeFilename(bookTitle)}_eBook.docx`;
      archive.append(docxBuffer, { name: docxFilename });
    } catch (error) {
      console.error("[Export Bundle] Failed to generate DOCX:", error);
      // Fallback to TXT if DOCX generation fails
      const txtFilename = `${sanitizeFilename(bookTitle)}_manuscript.txt`;
      archive.append(manuscriptContent, { name: txtFilename });
    }
    
    // Generate PDF (Paperback format)
    try {
      const pdfBuffer = await generatePDF(manuscriptData);
      const pdfFilename = `${sanitizeFilename(bookTitle)}_Paperback.pdf`;
      archive.append(pdfBuffer, { name: pdfFilename });
    } catch (error) {
      console.error("[Export Bundle] Failed to generate PDF:", error);
      // Continue without PDF if generation fails
    }
    
    // Add KDP metadata file
    const metadataContent = generateKDPMetadata(metadata);
    archive.append(metadataContent, { name: "KDP_Listing_Data.txt" });
    
    // Add ISBN information if provided
    if (isbn) {
      const isbnContent = generateISBNInfo(isbn, bookTitle, authorName);
      archive.append(isbnContent, { name: "ISBN_Information.txt" });
    }
    
    // Add cover image if provided
    if (coverImageUrl) {
      try {
        let coverBuffer: Buffer;
        
        // Handle data URLs (base64 encoded images from custom upload)
        if (coverImageUrl.startsWith('data:')) {
          // Extract base64 data from data URL
          const base64Data = coverImageUrl.split(',')[1];
          if (!base64Data) {
            throw new Error('Invalid data URL format');
          }
          coverBuffer = Buffer.from(base64Data, 'base64');
        } else {
          // Handle regular HTTP/HTTPS URLs
          const coverResponse = await fetch(coverImageUrl);
          coverBuffer = Buffer.from(await coverResponse.arrayBuffer());
        }
        
        const coverFilename = `${sanitizeFilename(bookTitle)}_cover.png`;
        archive.append(coverBuffer, { name: coverFilename });
      } catch (error) {
        console.error("[Export Bundle] Failed to process cover image:", error);
        // Don't throw - continue with export even if cover fails
      }
    }
    
    // Add README with instructions
    const readmeContent = generateReadme(bookTitle, metadata);
    archive.append(readmeContent, { name: "README.txt" });
    
    // Finalize archive and wait for completion
    archive.finalize();
    await archiveComplete;
    
    // Combine chunks into single buffer
    const zipBuffer = Buffer.concat(chunks);
    
    // Upload to S3
    const timestamp = Date.now();
    const zipKey = `exports/${sanitizeFilename(bookTitle)}_${timestamp}.zip`;
    const { url: zipUrl } = await storagePut(zipKey, zipBuffer, "application/zip");
    
    return {
      zipUrl,
      zipKey,
      files: {
        manuscript_docx: `${sanitizeFilename(bookTitle)}_eBook.docx`,
        manuscript_pdf: `${sanitizeFilename(bookTitle)}_Paperback.pdf`,
        kdp_metadata: "KDP_Listing_Data.txt",
        cover_image: coverImageUrl ? `${sanitizeFilename(bookTitle)}_cover.png` : undefined,
        isbn_info: isbn ? "ISBN_Information.txt" : undefined,
      },
      createdAt: timestamp,
    };
  } catch (error) {
    console.error("[Export Bundle] Failed to generate bundle:", error);
    throw new Error("Failed to generate export bundle. Please try again.");
  }
}

/**
 * Generate KDP metadata text file
 */
function generateKDPMetadata(metadata: {
  title: string;
  subtitle?: string;
  description: string;
  categories: string[];
  keywords: string[];
  price?: string;
  genre: string;
}): string {
  return `AMAZON KDP LISTING METADATA
=============================

TITLE:
${metadata.title}

${metadata.subtitle ? `SUBTITLE:\n${metadata.subtitle}\n\n` : ""}DESCRIPTION:
${metadata.description}

CATEGORIES (Select up to 3 in KDP):
${metadata.categories.map((cat, idx) => `${idx + 1}. ${cat}`).join("\n")}

KEYWORDS (Enter exactly as shown):
${metadata.keywords.map((kw, idx) => `${idx + 1}. ${kw}`).join("\n")}

GENRE:
${metadata.genre}

${metadata.price ? `SUGGESTED PRICE:\n${metadata.price}\n\n` : ""}
INSTRUCTIONS:
1. Log in to Amazon KDP (kdp.amazon.com)
2. Click "Create New Title" → "Paperback" or "Kindle eBook"
3. Copy and paste the information above into the corresponding fields
4. Upload your manuscript file
5. Upload your cover image
6. Review and publish!

Generated by Authors Bureau AI
`;
}

/**
 * Generate ISBN information document
 */
function generateISBNInfo(isbn: string, bookTitle: string, authorName: string): string {
  return `ISBN INFORMATION
================

ISBN: ${isbn}
Book Title: ${bookTitle}
Author: ${authorName}

ABOUT ISBN:
An ISBN (International Standard Book Number) is a unique identifier for your book.

AMAZON KDP OPTIONS:
1. FREE Amazon ISBN: Amazon provides a free ISBN when you publish through KDP
   - Pros: Free, automatic
   - Cons: Can only be used on Amazon, shows Amazon as publisher

2. YOUR OWN ISBN: Purchase from Bowker (myidentifiers.com) or your country's ISBN agency
   - Pros: You own it, can use across all platforms, you're listed as publisher
   - Cons: Costs $125+ per ISBN

RECOMMENDATION:
- If publishing ONLY on Amazon: Use Amazon's free ISBN
- If publishing on multiple platforms (IngramSpark, Apple Books, etc.): Buy your own ISBN

Generated by Authors Bureau AI
`;
}

/**
 * Generate README with publishing instructions
 */
function generateReadme(bookTitle: string, metadata: any): string {
  return `PUBLISHING PACKAGE FOR: ${bookTitle}
${"=".repeat(bookTitle.length + 24)}

Welcome! This package contains everything you need to publish your book on Amazon KDP.

WHAT'S INCLUDED:
📄 Manuscript file (ready to upload)
🎨 Book cover image (high-resolution)
📋 KDP listing metadata (categories, keywords, description)
🔢 ISBN information and guidance

NEXT STEPS:
1. Review all files in this package
2. Go to https://kdp.amazon.com and log in
3. Click "Create New Title"
4. Follow the KDP wizard and use the information from "KDP_Listing_Data.txt"
5. Upload your manuscript and cover files
6. Set your pricing and distribution options
7. Preview your book
8. Publish!

NEED HELP?
- Amazon KDP Help: https://kdp.amazon.com/en_US/help
- KDP Community Forums: https://kdpcommunity.amazon.com

Your book has been optimized by AI with bestseller-level intelligence.
Good luck with your launch!

Generated by Authors Bureau AI
${new Date().toLocaleDateString()}
`;
}

/**
 * Parse manuscript content into chapters
 */
function parseManuscriptIntoChapters(content: string): { number: number; title: string; content: string }[] {
  const chapters: { number: number; title: string; content: string }[] = [];
  
  // Try to detect chapter markers (Chapter 1, Chapter One, etc.)
  const chapterRegex = /(?:^|\n)(?:Chapter|CHAPTER)\s+(?:(\d+)|([A-Za-z]+))(?::|\s*[-–—]\s*|\s+)([^\n]+)?/g;
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = chapterRegex.exec(content)) !== null) {
    matches.push(match);
  }
  
  if (matches.length === 0) {
    // No chapters detected, treat entire content as one chapter
    return [{
      number: 1,
      title: "Full Text",
      content: content.trim(),
    }];
  }
  
  // Extract chapters based on matches
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const chapterNum = match[1] ? parseInt(match[1]) : i + 1;
    const chapterTitle = match[3] ? match[3].trim() : `Chapter ${chapterNum}`;
    
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
    const chapterContent = content.slice(startIndex, endIndex).trim();
    
    chapters.push({
      number: chapterNum,
      title: chapterTitle,
      content: chapterContent,
    });
  }
  
  return chapters;
}

/**
 * Sanitize filename for safe file system use
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase()
    .substring(0, 50);
}
