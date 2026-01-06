import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

/**
 * Book cover design with metadata
 */
export interface BookCover {
  imageUrl: string;
  storageKey: string;
  prompt: string;
  genre: string;
  style: string;
  createdAt: number;
}

export interface CoverCustomization {
  titleFont?: string;
  authorFont?: string;
  titleColor?: string;
  authorColor?: string;
  backgroundColor?: string;
  titlePosition?: "top" | "center" | "bottom";
  titleSize?: number;
  authorSize?: number;
}

/**
 * Generate AI book cover based on book details
 */
export async function generateBookCover(params: {
  bookTitle: string;
  authorName: string;
  genre: string;
  style?: string;
  customPrompt?: string;
  customization?: CoverCustomization;
}): Promise<BookCover> {
  const { bookTitle, authorName, genre, style = "professional", customPrompt, customization } = params;

  // Build comprehensive prompt for book cover generation
  const basePrompt = customPrompt || buildCoverPrompt({
    bookTitle,
    authorName,
    genre,
    style,
    customization,
  });

  try {
    // Generate cover image using AI
    const { url: imageUrl } = await generateImage({
      prompt: basePrompt,
    });

    if (!imageUrl) {
      throw new Error("Image generation failed: no URL returned");
    }

    // Upload to S3 for permanent storage
    const timestamp = Date.now();
    const sanitizedTitle = bookTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const storageKey = `covers/${sanitizedTitle}_${timestamp}.png`;

    // Download image and re-upload to our S3
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const { url: permanentUrl } = await storagePut(storageKey, imageBuffer, "image/png");

    return {
      imageUrl: permanentUrl,
      storageKey,
      prompt: basePrompt,
      genre,
      style,
      createdAt: timestamp,
    };
  } catch (error) {
    console.error("[Cover Generator] Failed to generate cover:", error);
    throw new Error("Failed to generate book cover. Please try again.");
  }
}

/**
 * Build optimized prompt for book cover generation
 */
function buildCoverPrompt(params: {
  bookTitle: string;
  authorName: string;
  genre: string;
  style: string;
  customization?: CoverCustomization;
}): string {
  const { bookTitle, authorName, genre, style, customization } = params;

  // Font mapping for AI generation
  const fontMap: Record<string, string> = {
    playfair: "Playfair Display (elegant serif)",
    montserrat: "Montserrat (modern sans-serif)",
    merriweather: "Merriweather (classic serif)",
    lora: "Lora (readable serif)",
    raleway: "Raleway (clean sans-serif)",
    crimson: "Crimson Text (traditional serif)",
    oswald: "Oswald (bold sans-serif)",
    bitter: "Bitter (strong serif)",
  };

  // Build customization instructions
  let customizationInstructions = "";
  if (customization) {
    const parts: string[] = [];
    
    if (customization.titleFont) {
      parts.push(`Title font: ${fontMap[customization.titleFont] || customization.titleFont}`);
    }
    if (customization.authorFont) {
      parts.push(`Author name font: ${fontMap[customization.authorFont] || customization.authorFont}`);
    }
    if (customization.titleColor) {
      parts.push(`Title color: ${customization.titleColor}`);
    }
    if (customization.authorColor) {
      parts.push(`Author name color: ${customization.authorColor}`);
    }
    if (customization.titlePosition) {
      parts.push(`Title positioned at ${customization.titlePosition} of cover`);
    }
    if (customization.titleSize) {
      const sizeDesc = customization.titleSize > 80 ? "very large" : customization.titleSize > 60 ? "large" : "medium";
      parts.push(`Title size: ${sizeDesc}`);
    }
    
    if (parts.length > 0) {
      customizationInstructions = `\nCustomization requirements:\n- ${parts.join("\n- ")}\n`;
    }
  }

  // Genre-specific visual elements
  const genreStyles: Record<string, string> = {
    "Business & Entrepreneurship": "modern corporate design, professional typography, bold colors, business imagery like graphs or cityscapes, clean minimalist layout",
    "Self-Help & Personal Development": "inspiring and uplifting design, warm colors, motivational imagery, elegant typography, human silhouettes or nature elements",
    "Investing & Finance": "sophisticated financial design, charts and graphs, gold and blue color scheme, professional serif fonts, wealth imagery",
    "Health & Wellness": "calming and natural design, green and blue tones, wellness imagery like yoga or nature, clean modern typography",
    "Parenting & Family": "warm and nurturing design, family imagery, soft pastel colors, friendly approachable fonts, heartwarming illustrations",
    "AI & Technology": "futuristic tech design, digital elements, blue and purple gradients, modern sans-serif fonts, circuit patterns or AI imagery",
    "Memoir & Biography": "personal and authentic design, vintage or modern photography style, elegant typography, storytelling visual elements",
  };

  const genreStyle = genreStyles[genre] || "professional book cover design with modern typography";

  // Style variations
  const styleModifiers: Record<string, string> = {
    professional: "clean, polished, bestseller quality",
    artistic: "creative, unique, eye-catching artistic elements",
    minimalist: "simple, elegant, lots of negative space",
    bold: "striking, dramatic, high contrast colors",
    elegant: "sophisticated, refined, luxury feel",
  };

  const styleModifier = styleModifiers[style] || styleModifiers.professional;

  // Construct comprehensive prompt
  const prompt = `Professional book cover design for "${bookTitle}" by ${authorName}. 
Genre: ${genre}. 
Style: ${genreStyle}, ${styleModifier}.${customizationInstructions}
Requirements: 
- Book title prominently displayed with clear, readable typography
- Author name visible but secondary to title
- High-quality, print-ready design suitable for Amazon KDP
- Visually striking to stand out in online bookstores
- Professional composition with balanced layout
- No people's faces (to avoid copyright issues)
- 6x9 inch book cover proportions (portrait orientation)
- Suitable for both ebook thumbnail and print cover
Create a stunning, bestseller-worthy book cover that captures the essence of the book and appeals to the target audience.`;

  return prompt;
}

/**
 * Generate 3 cover variations with distinct styles based on manuscript analysis
 */
export async function generateCoverVariations(params: {
  bookTitle: string;
  authorName: string;
  genre: string;
  themes?: string[]; // Key themes from manuscript
  targetAudience?: string; // Target reader description
  count?: number;
}): Promise<BookCover[]> {
  const { count = 3, themes = [], targetAudience } = params;
  
  // Always generate these 3 distinct styles for best variety
  const styles = ["minimalist", "bold", "artistic"];

  const variations: BookCover[] = [];

  // Generate covers with different styles
  for (let i = 0; i < Math.min(count, styles.length); i++) {
    try {
      const cover = await generateBookCover({
        ...params,
        style: styles[i],
      });
      variations.push(cover);
    } catch (error) {
      console.error(`[Cover Generator] Failed to generate variation ${i + 1}:`, error);
      // Continue with other variations even if one fails
    }
  }

  if (variations.length === 0) {
    throw new Error("Failed to generate any cover variations. Please try again.");
  }

  return variations;
}

/**
 * Regenerate cover with custom modifications
 */
export async function regenerateCoverWithPrompt(params: {
  bookTitle: string;
  authorName: string;
  genre: string;
  basePrompt: string;
  modifications: string;
}): Promise<BookCover> {
  const { bookTitle, authorName, genre, basePrompt, modifications } = params;

  // Combine base prompt with modifications
  const enhancedPrompt = `${basePrompt}\n\nAdditional modifications: ${modifications}`;

  return generateBookCover({
    bookTitle,
    authorName,
    genre,
    customPrompt: enhancedPrompt,
  });
}
