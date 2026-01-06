# Authors Bureau - Project TODO

## Persona 2: Ready to Publish Workflow (8-Step Process)

### Step 1: Upload Manuscript ✅
- [x] File upload (TXT, DOC, DOCX)
- [x] Paste manuscript directly
- [x] Word count and page estimate
- [x] Auto-save manuscript to database
- [x] Resume workflow detection

### Step 2: AI Publisher Analysis ✅
- [x] AI manuscript analysis (genre, themes, audience, tone)
- [x] NY Times Publisher persona chat interface
- [x] Conversational AI consultation
- [x] Generate multiple title suggestions
- [x] Generate subtitle suggestions
- [x] Generate book description
- [x] Identify key benefits and themes

### Step 3: Review & Edit Titles ✅
- [x] Display AI-suggested titles
- [x] Display AI-suggested subtitles
- [x] Allow custom title/subtitle input
- [x] Real-time character count
- [x] Save selected title/subtitle

### Step 4: Author Profile Check ✅
- [x] Check profile completion status
- [x] Show required fields (pen name, photo, bio)
- [x] Link to profile page
- [x] Allow skip with warning

### Step 5: Cover Design ✅
- [x] AI-powered cover generation (3 variations)
- [x] Cover style selection (minimalist, bold, artistic)
- [x] Cover preview and selection
- [x] Edit/regenerate covers with feedback
- [x] Custom cover upload option
- [x] Cover customization tools

### Step 6: Amazon KDP Optimization ✅
- [x] AI category research
- [x] Keyword optimization
- [x] Book description optimization
- [x] Pricing recommendations
- [x] ISBN guidance
- [x] Interior preview system

### Step 7: Book Wrap Designer (VISUAL EDITOR - CORE FEATURES WORKING ✅)

**Current Status: Replacing template system with full visual editor**

#### Visual Editor Core Features
- [x] Canvas-based editor showing full book wrap dimensions (14.084" × 10.417")
- [x] Display KDP template with specifications (spine width, bleed area, safe zones)
- [x] Upload front cover image as base layer
- [x] Real-time canvas rendering at proper scale

#### Text Box Functionality
- [x] Add Text button to create new text box
- [ ] Double-click text box to edit content
- [ ] Text formatting toolbar (font, size, color, bold, italic)
- [ ] Font family selection (popular book fonts)
- [ ] Text alignment options (left, center, right)
- [ ] Text color picker
- [ ] Font size slider

#### Image Management
- [x] Upload images via file picker
- [ ] Drag and drop images onto canvas
- [x] Position images anywhere on wrap
- [ ] Resize images with corner handles
- [ ] Maintain aspect ratio option
- [ ] Image opacity control
- [ ] Delete images

#### Element Manipulation
- [x] Click elements to select (shows blue border)
- [x] Delete Selected button to remove elements
- [ ] Drag elements (text boxes, images) to reposition (implemented but not tested)
- [ ] Resize handles on all elements (8-point handles)
- [ ] Rotation handles for elements
- [ ] Snap-to-grid option for alignment
- [ ] Alignment guides (show when elements align)
- [ ] Multi-select elements (Shift+Click)

#### Layer Management
- [ ] Layer panel showing all elements
- [ ] Bring to front / Send to back
- [ ] Move up / Move down one layer
- [ ] Show/hide layers
- [ ] Lock/unlock layers
- [ ] Rename layers

#### Canvas Controls
- [ ] Zoom in/out (25% to 200%)
- [ ] Fit to screen
- [ ] Pan canvas (drag with spacebar)
- [ ] Toggle guide lines (spine, bleed, safe area)
- [ ] Ruler display
- [ ] Grid overlay option

#### Pre-populated Content
- [ ] Auto-load author photo from profile
- [ ] Auto-load author bio from profile
- [ ] Auto-load book description from AI analysis
- [ ] Suggest default positions for common elements
- [ ] "Quick Start" templates (optional starting layouts)

#### Export Functionality
- [x] Export as PNG (fixed to wait for image loading)
- [ ] Export as PDF (with bleed marks)
- [ ] Save design state to database (resume later)
- [ ] Preview before export
- [ ] Download button with file name customization

#### Technical Implementation
- [ ] Use Fabric.js or Konva.js for canvas manipulation
- [ ] Implement undo/redo stack (Ctrl+Z, Ctrl+Y)
- [ ] Save canvas state as JSON in database
- [ ] Backend endpoint to render final high-res export
- [ ] Real-time auto-save every 30 seconds
- [ ] Handle touch events for tablet users

### Step 8: Export Package ✅
- [x] Generate DOCX (eBook format)
- [x] Generate PDF (Paperback 6×9")
- [x] Generate EPUB (Kindle format)
- [x] Include cover image
- [x] Include book wrap (from visual editor)
- [x] Generate KDP metadata file
- [x] Create README with upload instructions
- [x] ZIP all files for download
- [x] KDP Upload Guide modal

---

## Author Profile Management ✅

- [x] Profile completion indicator with progress bar
- [x] Pen name field (required)
- [x] Author photo upload with crop & zoom
- [x] Profile photo S3 storage integration
- [x] AI bio generator (3 lengths: short, medium, long)
- [x] LinkedIn URL field
- [x] Books authored field
- [x] Accomplishments field
- [x] Education field
- [x] 2000 character limit validation (Amazon Author Central)
- [x] Profile preview in navigation sidebar
- [x] Display pen name instead of user name when available

---

## Dashboard & Navigation ✅

- [x] Simplified dashboard (3 focused cards)
- [x] Ready to Publish (Featured)
- [x] My Books
- [x] Start Writing (Coming Soon)
- [x] Profile completion alert card
- [x] Navigation cleanup (removed redundant routes)
- [x] Sidebar with author profile display

---

## Testing & Quality Assurance

- [x] 19 unit tests passing (export, EPUB, interior preview)
- [ ] Test visual editor with real book data
- [ ] Test export with visual editor designs
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness testing
- [ ] Performance testing with large images

---

## Completed Historical Features ✅

### Phase 1: Foundation (Complete)
- [x] Database schema (11 tables)
- [x] User authentication with role-based access
- [x] Landing page with Authors Bureau branding
- [x] Dashboard with statistics

### Phase 2: Book Management (Complete)
- [x] Book creation, updating, deletion
- [x] Chapter management system
- [x] Books management page

### Phase 3: AI Writing Studio (Complete)
- [x] SUCKcess Story framework
- [x] AI-powered book outline generation
- [x] Chapter-by-chapter writing interface
- [x] Real-time AI-assisted drafting

### Phase 4: KDP Publishing Tools (Complete)
- [x] Manuscript export (DOCX, PDF, EPUB)
- [x] Copyright page generation
- [x] Table of contents auto-generation
- [x] 6"×9" page sizing for KDP
- [x] Amazon category research
- [x] KDP listing optimizer
- [x] Cover generation and customization
- [x] Interior preview system

---

## Future Phases (Not Started)

### Phase 5: Marketing Automation
- [ ] Email sequence builder
- [ ] Landing page generator
- [ ] Sales funnel creation
- [ ] Amazon advertising integration

### Phase 6: Analytics & Tracking
- [ ] Sales tracking dashboard
- [ ] Amazon performance metrics
- [ ] Reader engagement analytics
- [ ] ROI calculator

### Phase 7: Community Features
- [ ] Author collaboration tools
- [ ] Beta reader management
- [ ] Review request automation
- [ ] Author forums

### Phase 8: Advanced Publishing
- [ ] Multi-format publishing (Kobo, Apple Books, etc.)
- [ ] Print-on-demand integration
- [ ] Audiobook production tools
- [ ] Translation services integration


---

## Visual Editor Enhancements (In Progress)

### Phase 2: Enhanced Interactions
- [x] Double-click text boxes to edit content (dialog with input field)
- [x] Improved drag-and-drop with cursor feedback (move cursor when dragging)
- [x] Resize handles on selected elements (8-point handles: corners + midpoints)
- [ ] Visual feedback during resize (show dimensions)
- [ ] Maintain aspect ratio option for images during resize
- [ ] Snap-to-grid for better alignment
- [ ] Undo/redo functionality (Ctrl+Z, Ctrl+Y)


---

## 🔄 Fabric.js Visual Editor Rebuild (CURRENT PRIORITY)

### Reason for Rebuild
Raw canvas approach has complex event handling issues. Fabric.js provides built-in interactions (drag, resize, rotate, text editing) for faster development and better UX.

### Implementation Tasks
- [ ] Create new BookWrapVisualEditor component using Fabric.js
- [ ] Set correct canvas dimensions for 6"×9" book (14.084" × 10.417" overall with bleed)
- [ ] Load KDP template as background image (non-interactive layer)
- [ ] Add text button creates Fabric.IText objects (editable on double-click)
- [ ] Add image button creates Fabric.Image objects (draggable, resizable)
- [ ] Upload front cover positions image on right side (front cover area)
- [ ] All elements draggable, resizable, rotatable by default
- [ ] Delete selected element functionality
- [ ] Export to PNG with correct resolution (300 DPI for print)
- [ ] Test complete workflow in browser


---

## 🐛 Bug Fixes

### Workflow Navigation Issue
- [x] Fix Resume Progress always returning to Review step instead of saved Wrap step
- [ ] Investigate handleResumeProgress function in ReadyToPublish.tsx
- [ ] Ensure workflowStep state properly restores to 'wrap' when saved progress includes wrap step
- [ ] Test navigation through all workflow steps to ensure state persistence


---

## 🔄 Konva.js Visual Editor Rebuild (SWITCHING FROM FABRIC.JS)

**Reason:** Fabric.js v7 initialization failing silently, switching to Konva.js for better React integration and clearer APIs

### Implementation Tasks
- [x] Install konva and react-konva packages
- [x] Create BookWrapVisualEditorKonva component
- [x] Implement KDP template as background image layer
- [x] Add text elements with double-click editing
- [x] Add image upload and positioning
- [x] Enable drag-and-drop for all elements
- [x] Add resize transformer with handles
- [x] Add rotation capability
- [x] Implement delete selected element
- [x] Export to PNG at 300 DPI
- [x] Replace Fabric component in ReadyToPublish.tsx
- [x] Test all features in browser (Add Text confirmed working, other features require manual testing)
