import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
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

    // Chapter content - split by paragraphs
    const paragraphs = chapter.content.split("\n\n");
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

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
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

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
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
