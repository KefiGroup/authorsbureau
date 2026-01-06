# Book Wrap Visual Editor - Architecture Design

## Overview
Replace the current template-based Book Wrap Designer with a full visual editor similar to Canva, allowing users to drag-and-drop text boxes and images anywhere on the canvas.

## Technology Stack

### Canvas Library: Fabric.js
**Why Fabric.js:**
- Mature, well-documented library for canvas manipulation
- Built-in support for text boxes, images, and shapes
- Native drag-and-drop, resize, and rotation
- Layer management out of the box
- JSON serialization for saving/loading designs
- Active community and extensive examples

**Alternative considered:** Konva.js (React-specific, but less feature-rich)

### Component Structure

```
BookWrapVisualEditor/
├── BookWrapCanvas.tsx          # Main canvas component (Fabric.js wrapper)
├── Toolbar.tsx                 # Top toolbar (add text, add image, zoom, etc.)
├── LayerPanel.tsx              # Right sidebar showing all layers
├── PropertiesPanel.tsx         # Right sidebar showing selected element properties
├── KDPSpecsPanel.tsx           # Left sidebar showing KDP specifications
├── hooks/
│   ├── useFabricCanvas.ts      # Initialize and manage Fabric canvas
│   ├── useCanvasElements.ts    # Add/remove/update canvas elements
│   ├── useCanvasHistory.ts     # Undo/redo functionality
│   └── useCanvasExport.ts      # Export to PNG/PDF
└── utils/
    ├── canvasHelpers.ts        # Helper functions for canvas operations
    ├── kdpCalculations.ts      # Spine width, bleed calculations
    └── exportHelpers.ts        # High-res export utilities
```

## Data Model

### Canvas State (stored in database)
```typescript
interface BookWrapDesign {
  id: string;
  bookId: string;
  canvasJSON: string;              // Fabric.js canvas.toJSON()
  canvasWidth: number;             // 12.369 inches (with bleed)
  canvasHeight: number;            // 9.25 inches (with bleed)
  spineWidth: number;              // Calculated from page count
  trimSize: string;                // "6x9"
  paperType: string;               // "cream" or "white"
  createdAt: Date;
  updatedAt: Date;
}
```

### Element Types
```typescript
type CanvasElement = 
  | TextBoxElement 
  | ImageElement 
  | FrontCoverElement 
  | GuideLineElement;

interface TextBoxElement {
  type: 'textbox';
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;              // Text color
  left: number;              // X position
  top: number;               // Y position
  width: number;
  height: number;
  angle: number;             // Rotation
  scaleX: number;
  scaleY: number;
}

interface ImageElement {
  type: 'image';
  id: string;
  src: string;               // S3 URL
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

interface FrontCoverElement {
  type: 'frontCover';
  id: string;
  src: string;               // S3 URL
  left: number;              // Fixed position (front cover area)
  top: number;
  width: number;             // 6 inches
  height: number;            // 9 inches
  locked: true;              // Cannot be moved
}
```

## User Workflow

### 1. Initialize Canvas
- Load KDP specifications (trim size, spine width, bleed)
- Create canvas with correct dimensions (12.369" × 9.25" at 300 DPI)
- Draw guide lines (spine, bleed, safe area)
- Set up zoom to fit screen

### 2. Upload Front Cover
- User uploads front cover image
- Image is uploaded to S3
- Front cover is placed in correct position (left side of wrap)
- Front cover is locked (cannot be moved or deleted)

### 3. Add Elements
**Add Text Box:**
- User clicks "Add Text" button
- New text box appears in center of canvas
- User can drag to reposition
- Double-click to edit text
- Properties panel shows font, size, color controls

**Add Image:**
- User clicks "Add Image" button or drags file onto canvas
- Image is uploaded to S3
- Image appears on canvas
- User can drag, resize, rotate

### 4. Edit Elements
- Click element to select (shows resize handles)
- Drag to move
- Drag corner handles to resize
- Drag rotation handle to rotate
- Properties panel updates to show element properties
- Change font, color, size, etc. in properties panel

### 5. Layer Management
- Layer panel shows all elements in order
- Drag to reorder layers
- Click eye icon to show/hide
- Click lock icon to lock/unlock
- Right-click for context menu (duplicate, delete, etc.)

### 6. Export
- User clicks "Export" button
- Canvas is rendered at 300 DPI (high resolution)
- Exported as PNG or PDF
- Guide lines are hidden in export
- File is downloaded

## Implementation Plan

### Phase 1: Basic Canvas Setup
1. Install Fabric.js: `pnpm add fabric`
2. Create BookWrapCanvas component with Fabric.js initialization
3. Set up canvas dimensions based on KDP specs
4. Draw guide lines (spine, bleed, safe area)
5. Implement zoom controls

### Phase 2: Front Cover Upload
1. Add file upload input
2. Upload to S3 via tRPC mutation
3. Load image onto canvas using Fabric.Image
4. Position in front cover area
5. Lock element to prevent moving

### Phase 3: Text Box Functionality
1. Add "Add Text" button in toolbar
2. Create Fabric.Textbox on button click
3. Implement double-click to edit
4. Add properties panel with font controls
5. Bind properties to selected text box

### Phase 4: Image Upload & Positioning
1. Add "Add Image" button in toolbar
2. File upload with S3 integration
3. Create Fabric.Image on canvas
4. Implement drag-and-drop file upload
5. Add image properties (opacity, etc.)

### Phase 5: Element Manipulation
1. Drag to move (built-in with Fabric.js)
2. Resize handles (built-in)
3. Rotation handle (built-in)
4. Snap-to-grid (custom implementation)
5. Alignment guides (custom implementation)

### Phase 6: Layer Management
1. Create LayerPanel component
2. List all canvas objects
3. Implement bring to front / send to back
4. Add show/hide toggle
5. Add lock/unlock toggle

### Phase 7: Undo/Redo
1. Implement history stack
2. Listen to canvas events (object:modified, object:added, object:removed)
3. Save canvas state on each change
4. Implement undo (Ctrl+Z) and redo (Ctrl+Y)

### Phase 8: Save & Load
1. Create tRPC mutation to save canvas JSON
2. Serialize canvas with canvas.toJSON()
3. Store in database
4. Load canvas from JSON on page load
5. Auto-save every 30 seconds

### Phase 9: Export
1. Create export button
2. Hide guide lines before export
3. Render canvas at 300 DPI (scale up)
4. Export as PNG using canvas.toDataURL()
5. Create tRPC mutation to convert to PDF
6. Download file

### Phase 10: Polish & Testing
1. Add keyboard shortcuts
2. Add context menus (right-click)
3. Add tooltips
4. Test with real book data
5. Performance optimization
6. Cross-browser testing

## Database Schema Changes

```sql
-- Add new table for book wrap designs
CREATE TABLE book_wrap_designs (
  id VARCHAR(255) PRIMARY KEY,
  book_id VARCHAR(255) NOT NULL,
  canvas_json TEXT NOT NULL,
  canvas_width DECIMAL(10, 2) NOT NULL,
  canvas_height DECIMAL(10, 2) NOT NULL,
  spine_width DECIMAL(10, 3) NOT NULL,
  trim_size VARCHAR(50) NOT NULL,
  paper_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## API Endpoints (tRPC)

```typescript
// server/routers.ts

bookWrap: {
  // Save canvas design
  saveDesign: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      canvasJSON: z.string(),
      spineWidth: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Save to database
    }),

  // Load canvas design
  loadDesign: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Load from database
    }),

  // Export as high-res PNG
  exportPNG: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      canvasJSON: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Render at 300 DPI using node-canvas
      // Upload to S3
      // Return URL
    }),

  // Export as PDF
  exportPDF: protectedProcedure
    .input(z.object({
      bookId: z.string(),
      canvasJSON: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Convert PNG to PDF with bleed marks
      // Upload to S3
      // Return URL
    }),
}
```

## Performance Considerations

1. **Image Optimization:**
   - Compress images before uploading to S3
   - Use thumbnails for layer panel
   - Lazy load images on canvas

2. **Canvas Rendering:**
   - Limit canvas size to prevent memory issues
   - Use requestAnimationFrame for smooth animations
   - Debounce auto-save to avoid excessive database writes

3. **Export Quality:**
   - Render at 300 DPI for print quality
   - Use server-side rendering for high-res export (node-canvas)
   - Stream large files instead of loading into memory

## Accessibility

1. Keyboard shortcuts for common actions
2. Screen reader support for toolbar buttons
3. High contrast mode option
4. Touch-friendly controls for tablets

## Future Enhancements

1. **Templates:** Pre-designed layouts users can start from
2. **Shapes:** Add rectangles, circles, lines
3. **Filters:** Apply filters to images (grayscale, sepia, etc.)
4. **Text Effects:** Shadow, outline, gradient
5. **Collaboration:** Real-time collaborative editing
6. **Version History:** Save multiple versions, compare changes
7. **AI Assistance:** Suggest optimal layouts based on content
