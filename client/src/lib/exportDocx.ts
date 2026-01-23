import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } from 'docx';
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
  const elements = parseMarkdownToDocx(content);

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
          ...elements,
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
 * Parse markdown content into DOCX elements (paragraphs and tables)
 */
function parseMarkdownToDocx(markdown: string): (Paragraph | Table)[] {
  const lines = markdown.split('\n');
  const elements: (Paragraph | Table)[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line starts a table
    if (line.trim().startsWith('|')) {
      // Collect all consecutive table lines
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      // Parse and create table
      const table = parseMarkdownTable(tableLines);
      if (table) {
        elements.push(table);
      }
      continue;
    }

    // Skip empty lines
    if (!line.trim()) {
      elements.push(new Paragraph({ text: '' }));
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('####')) {
      elements.push(
        new Paragraph({
          text: line.replace(/^####\s*/, ''),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith('###')) {
      elements.push(
        new Paragraph({
          text: line.replace(/^###\s*/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith('##')) {
      elements.push(
        new Paragraph({
          text: line.replace(/^##\s*/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 140 },
        })
      );
    } else if (line.startsWith('#')) {
      elements.push(
        new Paragraph({
          text: line.replace(/^#\s*/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 160 },
        })
      );
    }
    // Bullet lists
    else if (line.match(/^[\*\-]\s/)) {
      elements.push(
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
      elements.push(
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
      elements.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
        })
      );
    }

    i++;
  }

  return elements;
}

/**
 * Parse markdown table into a Word Table
 */
function parseMarkdownTable(tableLines: string[]): Table | null {
  if (tableLines.length < 2) return null;

  // Parse table rows
  const rows: string[][] = [];
  let isHeaderSeparator = false;

  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i].trim();
    
    // Check if this is the separator line (|---|---|)
    if (line.match(/^\|[\s\-:|]+\|$/)) {
      isHeaderSeparator = true;
      continue;
    }

    // Parse cells from the line
    const cells = line
      .split('|')
      .slice(1, -1) // Remove first and last empty elements
      .map(cell => cell.trim());

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) return null;

  // Create table rows
  const tableRows: TableRow[] = rows.map((rowCells, rowIndex) => {
    const isHeaderRow = rowIndex === 0 && isHeaderSeparator;

    return new TableRow({
      children: rowCells.map(cellText => {
        return new TableCell({
          children: [
            new Paragraph({
              children: parseInlineFormatting(cellText),
              spacing: { before: 100, after: 100 },
            }),
          ],
          shading: isHeaderRow ? {
            fill: 'E8E8E8', // Light gray background for header
          } : undefined,
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100,
          },
        });
      }),
    });
  });

  // Create table with borders
  return new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
  });
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
