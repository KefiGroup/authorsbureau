/**
 * Book Wrap Calculator
 * Calculates dimensions for print-ready paperback covers
 * Based on Amazon KDP specifications
 */

export type TrimSize = '5x8' | '5.5x8.5' | '6x9' | '7x10' | '8.5x11';
export type PaperType = 'white' | 'cream';

export interface TrimDimensions {
  width: number;  // inches
  height: number; // inches
}

export interface WrapDimensions {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  totalWidth: number;  // front + spine + back + bleed
  totalHeight: number; // height + bleed
  bleed: number;       // 0.125 inches
}

// Standard trim sizes
export const TRIM_SIZES: Record<TrimSize, TrimDimensions> = {
  '5x8': { width: 5, height: 8 },
  '5.5x8.5': { width: 5.5, height: 8.5 },
  '6x9': { width: 6, height: 9 },
  '7x10': { width: 7, height: 10 },
  '8.5x11': { width: 8.5, height: 11 },
};

// Page thickness in inches (Amazon KDP specifications)
const PAGE_THICKNESS = {
  white: 0.0025,  // 0.0025" per page for white paper
  cream: 0.0022,  // 0.0022" per page for cream paper
};

const BLEED = 0.125; // 0.125 inches bleed on all sides
const SAFE_ZONE = 0.125; // 0.125 inches safe zone from trim edge

/**
 * Calculate spine width based on page count and paper type
 */
export function calculateSpineWidth(pageCount: number, paperType: PaperType = 'white'): number {
  const thickness = PAGE_THICKNESS[paperType];
  const spineWidth = pageCount * thickness;
  
  // Amazon KDP minimum spine width is 0.06"
  return Math.max(spineWidth, 0.06);
}

/**
 * Calculate complete wrap dimensions
 */
export function calculateWrapDimensions(
  trimSize: TrimSize,
  pageCount: number,
  paperType: PaperType = 'white'
): WrapDimensions {
  const trim = TRIM_SIZES[trimSize];
  const spineWidth = calculateSpineWidth(pageCount, paperType);
  
  return {
    trimWidth: trim.width,
    trimHeight: trim.height,
    spineWidth,
    totalWidth: (trim.width * 2) + spineWidth + (BLEED * 2),
    totalHeight: trim.height + (BLEED * 2),
    bleed: BLEED,
  };
}

/**
 * Get safe zone boundaries (avoid text in these areas)
 */
export function getSafeZones(dimensions: WrapDimensions) {
  return {
    // Front cover safe zone
    front: {
      left: BLEED + SAFE_ZONE,
      right: BLEED + dimensions.trimWidth - SAFE_ZONE,
      top: BLEED + SAFE_ZONE,
      bottom: BLEED + dimensions.trimHeight - SAFE_ZONE,
    },
    // Spine safe zone (very narrow, be careful)
    spine: {
      left: BLEED + dimensions.trimWidth + SAFE_ZONE,
      right: BLEED + dimensions.trimWidth + dimensions.spineWidth - SAFE_ZONE,
      top: BLEED + SAFE_ZONE,
      bottom: BLEED + dimensions.trimHeight - SAFE_ZONE,
    },
    // Back cover safe zone
    back: {
      left: BLEED + dimensions.trimWidth + dimensions.spineWidth + SAFE_ZONE,
      right: BLEED + (dimensions.trimWidth * 2) + dimensions.spineWidth - SAFE_ZONE,
      top: BLEED + SAFE_ZONE,
      bottom: BLEED + dimensions.trimHeight - SAFE_ZONE,
    },
  };
}

/**
 * Convert inches to pixels at 300 DPI (print resolution)
 */
export function inchesToPixels(inches: number): number {
  return Math.round(inches * 300);
}

/**
 * Convert pixels to inches at 300 DPI
 */
export function pixelsToInches(pixels: number): number {
  return pixels / 300;
}

/**
 * Get barcode dimensions and position for back cover
 * Standard ISBN-13 barcode dimensions
 */
export function getBarcodeSpecs(dimensions: WrapDimensions) {
  const barcodeWidth = 1.5; // inches
  const barcodeHeight = 1.0; // inches
  
  // Position barcode in bottom right of back cover
  const backCoverLeft = BLEED + dimensions.trimWidth + dimensions.spineWidth;
  
  return {
    width: barcodeWidth,
    height: barcodeHeight,
    // Position with safe margins
    left: backCoverLeft + dimensions.trimWidth - barcodeWidth - (SAFE_ZONE * 2),
    bottom: BLEED + SAFE_ZONE * 2,
  };
}
