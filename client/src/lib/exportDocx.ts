import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ExportOptions {
  title: string;
  content: string; // Markdown content
  author?: string;
}

/**
 * Export markdown content to a DOCX file
 */
export async function exportToDocx(options: ExportOptions): Promise<void> {
  const { title, content, author = 'Authors Bureau' } = options;

  // Parse markdown and convert to docx elements
  const paragraphs = parseMarkdownToDocx(content);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            spacing: {
              after: 400,
            },
          }),
          ...paragraphs,
        ],
      },
    ],
    creator: author,
    title: title,
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
  saveAs(blob, fileName);
}

/**
 * Parse markdown content into DOCX paragraphs
 */
function parseMarkdownToDocx(markdown: string): Paragraph[] {
  const lines = markdown.split('\n');
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    // Headers
    if (line.startsWith('####')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^####\s*/, ''),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith('###')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^###\s*/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith('##')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^##\s*/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 140 },
        })
      );
    } else if (line.startsWith('#')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^#\s*/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 160 },
        })
      );
    }
    // Bullet lists
    else if (line.match(/^[\*\-]\s/)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^[\*\-]\s/, ''),
          bullet: {
            level: 0,
          },
        })
      );
    }
    // Numbered lists
    else if (line.match(/^\d+\.\s/)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^\d+\.\s/, ''),
          numbering: {
            reference: 'default-numbering',
            level: 0,
          },
        })
      );
    }
    // Regular paragraphs with inline formatting
    else {
      const textRuns = parseInlineFormatting(line);
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
        })
      );
    }
  }

  return paragraphs;
}

/**
 * Parse inline markdown formatting (bold, italic)
 */
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  
  // Simple regex-based parser for bold and italic
  // This is a basic implementation - could be enhanced with a proper markdown parser
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(.+?)(?=\*\*\*|\*\*|\*|`|$))/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold + Italic (***text***)
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) {
      // Bold (**text**)
      runs.push(new TextRun({ text: match[3], bold: true }));
    } else if (match[4]) {
      // Italic (*text*)
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) {
      // Code (`text`)
      runs.push(new TextRun({ text: match[5], font: 'Courier New' }));
    } else if (match[6] && match[6].trim()) {
      // Regular text
      runs.push(new TextRun({ text: match[6] }));
    }
  }

  // Fallback if no matches
  if (runs.length === 0) {
    runs.push(new TextRun({ text }));
  }

  return runs;
}
