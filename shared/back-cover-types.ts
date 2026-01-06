// Back cover layout configuration types

export type BackCoverElementType =
  | "photo"
  | "bio"
  | "description"
  | "isbn"
  | "foreword"
  | "testimonial"
  | "awards"
  | "series_info"
  | "custom_text";

export interface BackCoverElement {
  id: string;
  type: BackCoverElementType;
  enabled: boolean;
  content?: string; // For custom text, testimonials, etc.
  position: {
    x: number; // Percentage from left (0-100)
    y: number; // Percentage from top (0-100)
  };
  size: {
    width: number; // Percentage of canvas width (0-100)
    height: number; // Percentage of canvas height (0-100)
  };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    color?: string;
  };
}

export type LayoutPreset = "classic" | "modern" | "minimal" | "bold" | "custom";

export interface BackCoverLayout {
  preset: LayoutPreset;
  elements: BackCoverElement[];
  backgroundColor?: string;
  backgroundImage?: string;
}

// Predefined layout presets
export const LAYOUT_PRESETS: Record<LayoutPreset, Partial<BackCoverLayout>> = {
  classic: {
    preset: "classic",
    elements: [
      {
        id: "photo",
        type: "photo",
        enabled: true,
        position: { x: 10, y: 10 },
        size: { width: 30, height: 30 },
      },
      {
        id: "bio",
        type: "bio",
        enabled: true,
        position: { x: 45, y: 10 },
        size: { width: 45, height: 30 },
      },
      {
        id: "description",
        type: "description",
        enabled: true,
        position: { x: 10, y: 45 },
        size: { width: 80, height: 45 },
      },
      {
        id: "isbn",
        type: "isbn",
        enabled: true,
        position: { x: 10, y: 92 },
        size: { width: 30, height: 6 },
      },
    ],
  },
  modern: {
    preset: "modern",
    elements: [
      {
        id: "description",
        type: "description",
        enabled: true,
        position: { x: 10, y: 10 },
        size: { width: 80, height: 50 },
      },
      {
        id: "photo",
        type: "photo",
        enabled: true,
        position: { x: 10, y: 65 },
        size: { width: 20, height: 20 },
      },
      {
        id: "bio",
        type: "bio",
        enabled: true,
        position: { x: 35, y: 65 },
        size: { width: 55, height: 20 },
      },
      {
        id: "isbn",
        type: "isbn",
        enabled: true,
        position: { x: 10, y: 92 },
        size: { width: 30, height: 6 },
      },
    ],
  },
  minimal: {
    preset: "minimal",
    elements: [
      {
        id: "description",
        type: "description",
        enabled: true,
        position: { x: 15, y: 20 },
        size: { width: 70, height: 60 },
        style: { textAlign: "center" },
      },
      {
        id: "isbn",
        type: "isbn",
        enabled: true,
        position: { x: 35, y: 92 },
        size: { width: 30, height: 6 },
      },
    ],
  },
  bold: {
    preset: "bold",
    elements: [
      {
        id: "photo",
        type: "photo",
        enabled: true,
        position: { x: 30, y: 5 },
        size: { width: 40, height: 40 },
      },
      {
        id: "bio",
        type: "bio",
        enabled: true,
        position: { x: 10, y: 50 },
        size: { width: 80, height: 20 },
        style: { textAlign: "center" },
      },
      {
        id: "description",
        type: "description",
        enabled: true,
        position: { x: 10, y: 72 },
        size: { width: 80, height: 18 },
        style: { textAlign: "center" },
      },
      {
        id: "isbn",
        type: "isbn",
        enabled: true,
        position: { x: 35, y: 92 },
        size: { width: 30, height: 6 },
      },
    ],
  },
  custom: {
    preset: "custom",
    elements: [],
  },
};
