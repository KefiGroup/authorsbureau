import { generateImage } from "./_core/imageGeneration";

/**
 * Generate a professional book cover using AI image generation
 */
export async function generateBookCover(params: {
  title: string;
  author: string;
  genre: string;
  subtitle?: string;
  stylePreference?: string;
}): Promise<{ url: string }> {
  const genreStyles: Record<string, string> = {
    "business": "professional, modern, corporate colors (blue, gray, gold), minimalist design, bold typography",
    "self-help": "inspiring, uplifting, warm colors (orange, yellow, teal), motivational imagery, clean layout",
    "finance": "trustworthy, sophisticated, wealth colors (green, gold, navy), charts or money symbols, elegant fonts",
    "parenting": "warm, caring, family colors (soft pink, blue, cream), parent-child imagery, friendly fonts",
    "memoir": "personal, emotional, muted colors (sepia, earth tones), vintage or photo-realistic style",
    "fiction": "dramatic, genre-specific imagery, bold colors, eye-catching design",
    "non-fiction": "authoritative, clear, professional design, readable fonts, relevant imagery"
  };

  const styleGuide = genreStyles[params.genre.toLowerCase()] || genreStyles["non-fiction"];
  const customStyle = params.stylePreference || "";

  const subtitleSection = params.subtitle ? `\n**Subtitle:** "${params.subtitle}"` : '';
  
  const prompt = `Create a professional book cover design for Amazon KDP publishing.

**Book Title:** "${params.title}"${subtitleSection}
**Author Name:** "${params.author}"
**Genre:** ${params.genre}

**Design Requirements:**
- ${styleGuide}
- ${customStyle}
- High-quality, print-ready design
- Eye-catching and professional
- Title should be prominent and readable as thumbnail
- Author name clearly visible
- Suitable for both print and ebook formats
- No copyright-infringing elements
- Amazon KDP compliant design

**Layout:**
- Title at top or center (large, bold, readable)
- Subtitle below title (if provided)
- Author name at bottom
- Background imagery or patterns that match the genre
- Professional color scheme
- Clean, uncluttered design

Create a complete book cover that would stand out on Amazon and attract readers in the ${params.genre} category.`;

  try {
    const result = await generateImage({ prompt });
    if (!result.url) {
      throw new Error("Image generation did not return a URL");
    }
    return { url: result.url };
  } catch (error) {
    console.error("[Cover Generation] Failed to generate cover:", error);
    throw new Error("Failed to generate book cover. Please try again.");
  }
}

/**
 * Generate multiple cover variations for the author to choose from
 */
export async function generateCoverVariations(params: {
  title: string;
  author: string;
  genre: string;
  subtitle?: string;
  count?: number;
}): Promise<Array<{ url: string; style: string }>> {
  const count = params.count || 3;
  const styleVariations = [
    "minimalist and modern with bold typography",
    "illustrative with symbolic imagery",
    "photographic with dramatic lighting"
  ];

  const covers: Array<{ url: string; style: string }> = [];

  for (let i = 0; i < Math.min(count, styleVariations.length); i++) {
    try {
      const result = await generateBookCover({
        ...params,
        stylePreference: styleVariations[i]
      });
      if (result.url) {
        covers.push({
          url: result.url,
          style: styleVariations[i]
        });
      }
    } catch (error) {
      console.error(`[Cover Generation] Failed to generate variation ${i + 1}:`, error);
      // Continue with other variations even if one fails
    }
  }

  if (covers.length === 0) {
    throw new Error("Failed to generate any cover variations. Please try again.");
  }

  return covers;
}

/**
 * Regenerate a cover with specific feedback or modifications
 */
export async function regenerateCoverWithFeedback(params: {
  title: string;
  author: string;
  genre: string;
  subtitle?: string;
  feedback: string;
  previousCoverUrl?: string;
}): Promise<{ url: string }> {
  const subtitleSection = params.subtitle ? `\n**Subtitle:** "${params.subtitle}"` : '';
  
  const prompt = `Create a professional book cover design for Amazon KDP publishing, incorporating the following feedback.

**Book Title:** "${params.title}"${subtitleSection}
**Author Name:** "${params.author}"
**Genre:** ${params.genre}

**Author Feedback:**
${params.feedback}

**Design Requirements:**
- Apply the feedback to improve the design
- Maintain professional Amazon KDP standards
- Ensure title is prominent and readable
- Keep author name clearly visible
- High-quality, print-ready design
- Eye-catching and genre-appropriate

Create an improved book cover that addresses the author's feedback while maintaining professional publishing standards.`;

  try {
    const result = await generateImage({ prompt });
    if (!result.url) {
      throw new Error("Image generation did not return a URL");
    }
    return { url: result.url };
  } catch (error) {
    console.error("[Cover Generation] Failed to regenerate cover:", error);
    throw new Error("Failed to regenerate book cover. Please try again.");
  }
}
