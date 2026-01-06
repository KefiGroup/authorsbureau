import sharp from "sharp";
import { storagePut } from "./storage";

interface BookWrapConfig {
  frontCoverUrl: string;
  bookTitle: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorBio: string;
  bookDescription: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  pageCount: number;
  template: "modern" | "classic" | "minimalist" | "bold";
}

/**
 * Generate a complete book wrap for KDP paperback (6" x 9")
 * Returns S3 URL of the generated wrap
 */
export async function generateBookWrap(config: BookWrapConfig): Promise<string> {
  const {
    frontCoverUrl,
    bookTitle,
    authorName,
    authorPhotoUrl,
    authorBio,
    bookDescription,
    backgroundColor,
    textColor,
    fontSize,
    pageCount,
    template,
  } = config;

  // KDP 6"x9" book wrap calculations
  const DPI = 300;
  const COVER_WIDTH = 6 * DPI; // 1800px
  const COVER_HEIGHT = 9 * DPI; // 2700px
  const SPINE_WIDTH = Math.ceil(pageCount * 0.002252 * DPI); // Cream paper formula
  const BLEED = 0.125 * DPI; // 37.5px bleed on all sides
  
  const TOTAL_WIDTH = COVER_WIDTH * 2 + SPINE_WIDTH + BLEED * 2;
  const TOTAL_HEIGHT = COVER_HEIGHT + BLEED * 2;

  console.log(`📐 Generating book wrap: ${TOTAL_WIDTH}x${TOTAL_HEIGHT}px (${pageCount} pages, spine: ${SPINE_WIDTH}px)`);

  // Download front cover
  const frontCoverResponse = await fetch(frontCoverUrl);
  const frontCoverBuffer = Buffer.from(await frontCoverResponse.arrayBuffer());
  
  // Resize front cover to exact dimensions
  const frontCover = await sharp(frontCoverBuffer)
    .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover" })
    .toBuffer();

  // Create back cover with template
  const backCover = await generateBackCover({
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    authorPhotoUrl,
    authorName,
    authorBio,
    bookDescription,
    backgroundColor,
    textColor,
    fontSize: Math.round(fontSize * (DPI / 72)), // Convert pt to px at 300 DPI
    template,
  });

  // Create spine
  const spine = await generateSpine({
    width: SPINE_WIDTH,
    height: COVER_HEIGHT,
    bookTitle,
    authorName,
    backgroundColor,
    textColor,
  });

  // Composite: back cover + spine + front cover
  const wrap = await sharp({
    create: {
      width: TOTAL_WIDTH,
      height: TOTAL_HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      // Back cover (left side with bleed)
      { input: backCover, top: BLEED, left: BLEED },
      // Spine (center)
      { input: spine, top: BLEED, left: COVER_WIDTH + BLEED },
      // Front cover (right side with bleed)
      { input: frontCover, top: BLEED, left: COVER_WIDTH + SPINE_WIDTH + BLEED },
    ])
    .png()
    .toBuffer();

  // Upload to S3
  const fileName = `book-wrap-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  const { url } = await storagePut(`book-wraps/${fileName}`, wrap, "image/png");

  console.log(`✅ Book wrap generated: ${url}`);
  return url;
}

/**
 * Generate back cover with template layout
 */
async function generateBackCover(config: {
  width: number;
  height: number;
  authorPhotoUrl?: string;
  authorName: string;
  authorBio: string;
  bookDescription: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  template: string;
}): Promise<Buffer> {
  const {
    width,
    height,
    authorPhotoUrl,
    authorBio,
    bookDescription,
    backgroundColor,
    textColor,
    fontSize,
  } = config;

  const margin = Math.round(width * 0.1);
  const contentWidth = width - margin * 2;
  let currentY = margin;

  // Wrap text to fit width (approximate)
  const charsPerLine = Math.floor(contentWidth / (fontSize * 0.6));
  const bioLines = wrapTextSimple(authorBio, charsPerLine);
  const descLines = wrapTextSimple(bookDescription, charsPerLine);

  // Build SVG for text
  let svgText = ``;
  
  // Author photo placeholder
  if (authorPhotoUrl) {
    const photoSize = Math.round(width * 0.25);
    svgText += `<circle cx="${margin + photoSize / 2}" cy="${currentY + photoSize / 2}" r="${photoSize / 2}" fill="#ccc"/>`;
    currentY += photoSize + margin / 2;
  }

  // Bio text
  bioLines.forEach((line) => {
    svgText += `<text x="${margin}" y="${currentY}" fill="${textColor}" font-size="${fontSize}" font-family="Arial">${escapeXml(line)}</text>`;
    currentY += fontSize * 1.5;
  });

  currentY += margin / 2;

  // Description text
  descLines.forEach((line) => {
    svgText += `<text x="${margin}" y="${currentY}" fill="${textColor}" font-size="${fontSize}" font-family="Arial">${escapeXml(line)}</text>`;
    currentY += fontSize * 1.5;
  });

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      ${svgText}
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return buffer;
}

/**
 * Generate spine with vertical text
 */
async function generateSpine(config: {
  width: number;
  height: number;
  bookTitle: string;
  authorName: string;
  backgroundColor: string;
  textColor: string;
}): Promise<Buffer> {
  const { width, height, bookTitle, authorName, backgroundColor, textColor } = config;

  const fontSize = Math.max(Math.round(width * 0.5), 12);
  const centerX = width / 2;
  const centerY = height / 2;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <g transform="translate(${centerX}, ${centerY}) rotate(-90)">
        <text x="0" y="${-height * 0.3}" fill="${textColor}" font-size="${fontSize}" font-family="Arial" font-weight="bold" text-anchor="middle">${escapeXml(bookTitle)}</text>
        <text x="0" y="${height * 0.3}" fill="${textColor}" font-size="${fontSize}" font-family="Arial" font-weight="bold" text-anchor="middle">${escapeXml(authorName)}</text>
      </g>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return buffer;
}

/**
 * Simple text wrapping by character count
 */
function wrapTextSimple(text: string, charsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    if (testLine.length > charsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
