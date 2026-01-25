import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Footer, PageNumber } from "docx";
import PDFDocument from "pdfkit";

export interface Chapter {
  number: number;
  title: string;
  content: string;
}

export interface ManuscriptData {
  bookTitle: string;
  subtitle?: string;
  authorName: string;
  chapters: Chapter[];
  // Copyright page options
  copyrightYear?: number;
  isbn?: string;
  publisher?: string;
  edition?: string;
}

/**
 * Strip markdown formatting from text for clean DOCX output
 */
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold**
    .replace(/\*([^*]+)\*/g, '$1')      // *italic*
    .replace(/__([^_]+)__/g, '$1')      // __bold__
    .replace(/_([^_]+)_/g, '$1')        // _italic_
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')        // ## headers
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')        // `code`
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url)
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')     // - list items
    .replace(/^\s*\d+\.\s+/gm, '')     // 1. numbered lists
    .trim();
}

/**
 * Generate copyright page paragraphs
 */
function generateCopyrightPage(manuscript: ManuscriptData): Paragraph[] {
  const { bookTitle, authorName, copyrightYear, isbn, publisher, edition } = manuscript;
  const year = copyrightYear || new Date().getFullYear();
  const pub = publisher || authorName;
  const ed = edition || 'First Edition';

  const copyrightParagraphs: Paragraph[] = [];

  // Copyright symbol and year
  copyrightParagraphs.push(
    new Paragraph({
      text: `Copyright © ${year} by ${authorName}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // All rights reserved
  copyrightParagraphs.push(
    new Paragraph({
      text: 'All rights reserved.',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Edition
  copyrightParagraphs.push(
    new Paragraph({
      text: ed,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // ISBN placeholder with note
  if (isbn) {
    copyrightParagraphs.push(
      new Paragraph({
        text: `ISBN: ${isbn}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  } else {
    copyrightParagraphs.push(
      new Paragraph({
        text: 'ISBN: [Your ISBN Here]',
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
    copyrightParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Note: ISBN will be added when you export from AI Publishing Studio. Amazon KDP provides free ISBNs for both Kindle and Paperback formats.',
            size: 18,
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Publisher
  copyrightParagraphs.push(
    new Paragraph({
      text: `Published by ${pub}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Legal notice - Amazon KDP standard
  copyrightParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'No part of this book may be reproduced, distributed, or transmitted in any form or by any means, electronic or mechanical, including photocopying, recording, or by any information storage and retrieval system, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.',
          size: 20,
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 400 },
    })
  );

  // Disclaimer (optional but recommended for non-fiction)
  copyrightParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'The information contained within this book is for educational and informational purposes only. While every effort has been made to ensure accuracy, the author and publisher make no warranties or representations regarding the completeness or accuracy of the contents.',
          size: 20,
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
    })
  );

  return copyrightParagraphs;
}

/**
 * Generate table of contents paragraphs
 */
function generateTableOfContents(chapters: Chapter[]): Paragraph[] {
  const tocParagraphs: Paragraph[] = [];

  // TOC heading
  tocParagraphs.push(
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Chapter entries
  for (const chapter of chapters) {
    tocParagraphs.push(
      new Paragraph({
        text: `Chapter ${chapter.number}: ${chapter.title}`,
        spacing: { after: 100 },
      })
    );
  }

  return tocParagraphs;
}

/**
 * Generate a DOCX file from manuscript data
 * Returns a Buffer that can be sent to the client
 */
export async function generateDOCX(manuscript: ManuscriptData): Promise<Buffer> {
  const { bookTitle, subtitle, authorName, chapters } = manuscript;

  // Create document sections
  const docSections: Paragraph[] = [];

  // Title page
  docSections.push(
    new Paragraph({
      text: bookTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  if (subtitle) {
    docSections.push(
      new Paragraph({
        text: subtitle,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  docSections.push(
    new Paragraph({
      text: `by ${authorName}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Page break before copyright page
  docSections.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // Copyright page
  const copyrightPage = generateCopyrightPage(manuscript);
  docSections.push(...copyrightPage);

  // Page break before TOC
  docSections.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // Table of Contents
  const toc = generateTableOfContents(chapters);
  docSections.push(...toc);

  // Page break before chapters
  docSections.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // Add each chapter
  for (const chapter of chapters) {
    // Chapter title
    docSections.push(
      new Paragraph({
        text: `Chapter ${chapter.number}: ${chapter.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Chapter content - strip markdown and split by paragraphs
    const cleanContent = stripMarkdown(chapter.content);
    const paragraphs = cleanContent.split("\n\n");
    for (const para of paragraphs) {
      if (para.trim()) {
        docSections.push(
          new Paragraph({
            children: [new TextRun(para.trim())],
            spacing: { after: 200 },
          })
        );
      }
    }

    // Page break after each chapter
    docSections.push(
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      })
    );
  }

  // Create document with page numbering
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: "decimal",
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun("Page "),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                  }),
                ],
              }),
            ],
          }),
        },
        children: docSections,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Generate a PDF file from manuscript data
 * Returns a Buffer that can be sent to the client
 */
export async function generatePDF(manuscript: ManuscriptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { bookTitle, subtitle, authorName, chapters } = manuscript;

    // Create PDF document (6" x 9" = 432pt x 648pt)
    const doc = new PDFDocument({
      size: [432, 648],
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Title page
    doc.fontSize(24).font("Helvetica-Bold").text(bookTitle, { align: "center" });
    doc.moveDown();

    if (subtitle) {
      doc.fontSize(16).font("Helvetica").text(subtitle, { align: "center" });
      doc.moveDown();
    }

    doc.fontSize(14).font("Helvetica-Oblique").text(`by ${authorName}`, { align: "center" });
    doc.addPage();

    // Copyright page
    const year = manuscript.copyrightYear || new Date().getFullYear();
    const publisher = manuscript.publisher || authorName;
    const edition = manuscript.edition || 'First Edition';

    doc.fontSize(12).font("Helvetica").text(`Copyright © ${year} by ${authorName}`, { align: "center" });
    doc.moveDown();
    doc.text('All rights reserved.', { align: "center" });
    doc.moveDown();
    doc.text(edition, { align: "center" });
    doc.moveDown();
    
    if (manuscript.isbn) {
      doc.text(`ISBN: ${manuscript.isbn}`, { align: "center" });
      doc.moveDown();
    }
    
    doc.text(`Published by ${publisher}`, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(10).text(
      'No part of this book may be reproduced in any form or by any electronic or mechanical means, including information storage and retrieval systems, without written permission from the author, except for the use of brief quotations in a book review.',
      { align: "justify" }
    );
    doc.addPage();

    // Table of Contents
    doc.fontSize(18).font("Helvetica-Bold").text('Table of Contents', { align: "center" });
    doc.moveDown(2);
    doc.fontSize(12).font("Helvetica");
    
    for (const chapter of chapters) {
      doc.text(`Chapter ${chapter.number}: ${chapter.title}`);
      doc.moveDown(0.5);
    }
    doc.addPage();

    // Add chapters
    for (const chapter of chapters) {
      // Chapter title
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(`Chapter ${chapter.number}: ${chapter.title}`, { align: "left" });
      doc.moveDown();

      // Chapter content
      const paragraphs = chapter.content.split("\n\n");
      doc.fontSize(12).font("Helvetica");

      for (const para of paragraphs) {
        if (para.trim()) {
          doc.text(para.trim(), { align: "justify" });
          doc.moveDown();
        }
      }

      // Add page break after each chapter (except last)
      if (chapter.number < chapters.length) {
        doc.addPage();
      }
    }

    doc.end();
  });
}
