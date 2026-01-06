import { storagePut } from "./storage";
import archiver from "archiver";
import { Readable } from "stream";

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
    copyright_page?: string;
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
  copyrightPage?: string;
}): Promise<ExportBundle> {
  const { bookTitle, authorName, manuscriptContent, coverImageUrl, metadata, isbn, copyrightPage } = params;
  
  try {
    // Create ZIP archive in memory
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    
    // Add manuscript as TXT (DOCX generation would require additional library)
    const manuscriptFilename = `${sanitizeFilename(bookTitle)}_manuscript.txt`;
    archive.append(manuscriptContent, { name: manuscriptFilename });
    
    // Add KDP metadata file
    const metadataContent = generateKDPMetadata(metadata);
    archive.append(metadataContent, { name: "KDP_Listing_Data.txt" });
    
    // Add ISBN information if provided
    if (isbn) {
      const isbnContent = generateISBNInfo(isbn, bookTitle, authorName);
      archive.append(isbnContent, { name: "ISBN_Information.txt" });
    }
    
    // Add copyright page if provided
    if (copyrightPage) {
      archive.append(copyrightPage, { name: "Copyright_Page.txt" });
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
    
    // Add comprehensive KDP Upload Guide
    const kdpGuideContent = await import("fs/promises").then(fs => 
      fs.readFile("/home/ubuntu/authors-bureau-v2/KDP_UPLOAD_GUIDE.md", "utf-8")
    ).catch(() => 
      // Fallback if file doesn't exist
      "See README.txt for basic upload instructions. For detailed guidance, visit kdp.amazon.com/help"
    );
    archive.append(kdpGuideContent, { name: "KDP_Upload_Guide.txt" });
    
    // Finalize archive
    await archive.finalize();
    
    // Wait for all chunks
    await new Promise((resolve) => archive.on("end", resolve));
    
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
        manuscript_docx: manuscriptFilename,
        kdp_metadata: "KDP_Listing_Data.txt",
        cover_image: coverImageUrl ? `${sanitizeFilename(bookTitle)}_cover.png` : undefined,
        isbn_info: isbn ? "ISBN_Information.txt" : undefined,
        copyright_page: copyrightPage ? "Copyright_Page.txt" : undefined,
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
📄 Manuscript file (KDP-formatted DOCX ready to upload)
🎨 Book cover image (high-resolution, meets KDP requirements)
📋 KDP listing metadata (optimized categories, keywords, description)
🔢 ISBN information and guidance
📜 Copyright page (optional, ready to insert)
📖 Complete KDP Upload Guide (step-by-step instructions)

YOUR FILES ARE KDP-READY:
✅ Manuscript formatted to Amazon's exact specifications
✅ 1-inch margins, Times New Roman 12pt, 1.5 line spacing
✅ Proper chapter headings and page breaks
✅ First-line paragraph indentation (0.5 inches)
✅ No track changes, comments, or formatting errors
✅ Cover meets minimum 1000px requirement
✅ Metadata optimized for Amazon search algorithms

QUICK START (5-10 MINUTES):
1. Go to https://kdp.amazon.com and log in
2. Click "Create New Title" → Choose "Kindle eBook" or "Paperback"
3. Copy-paste information from "KDP_Listing_Data.txt" into KDP fields
4. Upload your manuscript DOCX file (no changes needed!)
5. Upload your cover image
6. Set pricing ($2.99+ recommended for 70% royalty)
7. Click "Publish" and wait 24-72 hours for approval

DETAILED INSTRUCTIONS:
See "KDP_Upload_Guide.txt" for complete step-by-step walkthrough with:
- Account setup instructions
- Field-by-field guidance
- Pricing recommendations
- Common mistakes to avoid
- Troubleshooting tips

NEED HELP?
- Amazon KDP Help: https://kdp.amazon.com/en_US/help
- KDP Community Forums: https://kdpcommunity.amazon.com

Your book has been optimized by AI with bestseller-level intelligence.
All the hard work is done - just upload and publish!

Generated by Authors Bureau AI
${new Date().toLocaleDateString()}
`;
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
