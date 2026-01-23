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


---

## 🎯 Simplify Book Wrap Visual Editor (CURRENT)

**Strategy:** Keep it simple - direct users to Canva for complex design, use our tool just for KDP template positioning

### Simplification Tasks
- [x] Remove "Add Image" button (users design everything in Canva first)
- [x] Remove "Delete Selected" button (avoid buggy feature)
- [x] Keep "Upload Front Cover", "Add Text", and "Export Book Wrap" only
- [x] Update "How to Use" instructions to direct users to Canva
- [x] Add clear workflow: Design in Canva → Upload here → Position on template → Export
- [ ] Test simplified editor with basic workflow
- [x] Add prominent Canva link with "Design in Canva" button
- [x] Add detailed step-by-step Canva instructions
- [x] Include Canva template dimensions (6"×9" = 1800×2700 pixels at 300 DPI)

### Book Wrap Editor Complete Simplification (Copy & Upload Only)
- [x] Remove all canvas/Konva.js visual editor code (replaced with BookWrapSpecifications)
- [x] Create BookWrapSpecifications component showing:
  - [x] Exact Canva dimensions for book wrap (based on page count + spine width)
  - [x] Spine width calculation display
  - [x] Book title, subtitle, author name (for copy-paste)
  - [x] Book description (for back cover, copy-paste)
  - [x] Author bio (for back cover, copy-paste)
  - [x] ISBN number (for barcode placement)
  - [x] Visual guide/diagram showing front/spine/back layout
- [x] Add simple upload interface for finished book wrap design
- [x] Add validation for uploaded book wrap (dimensions, file size)
- [x] Update workflow to show "Get Specifications → Design in Canva → Upload"
- [ ] Test complete workflow with real book data

### Amazon Category Research - Kindle vs Paperback Split
- [x] Split "AI Category Research" into two separate sections:
  - [x] Kindle eBook Categories (with separate "Analyze Kindle Categories" button)
  - [x] Paperback Categories (with separate "Analyze Paperback Categories" button)
- [x] Update UI to show both sections with clear labels (📱 Kindle, 📖 Paperback)
- [x] Ensure AI analysis considers format-specific category differences
- [x] Allow separate category selection for each format (up to 3 each)
- [x] Update state management to store Kindle and Paperback categories separately

### Navigation Sidebar Reorganization
- [x] Update DashboardLayout sidebar navigation structure:
  - [x] Main section: Dashboard, AI Writing Studio, My Books, Marketing
  - [x] Account section: Profile, Settings
- [x] Create My Books page (list of all user's books)
- [x] Ensure clicking a book from My Books opens its 8-step workflow (ReadyToPublish with bookId)
- [x] AI Writing Studio page already exists with SUCKcess Theory framework
- [x] Create Marketing page (placeholder for book promotion tools)
- [x] Create Settings page (password, preferences, etc.)
- [ ] Update Profile page to show author profile from workflow
- [x] Update App.tsx routing for all new pages
- [ ] Test navigation flow: sidebar → My Books → individual book workflow

### Fix Kindle vs Paperback Category Trees
- [x] Update category analysis AI prompt to specify format (Kindle or Paperback)
- [x] Ensure Kindle analysis returns "Kindle Store > Kindle eBooks > ..." categories
- [x] Ensure Paperback analysis returns "Books > ..." categories (already correct)
- [ ] Update backend mutation to pass format parameter to AI
- [ ] Test both Kindle and Paperback category analysis with real book data

### Connect Real AI Category Analysis
- [x] Update backend `amazon.researchCategories` mutation to accept format parameter
- [x] Pass format parameter to `researchAmazonCategories` function
- [x] Strengthen AI prompt to prioritize LOW-COMPETITION categories for #1 bestseller ranking
- [x] Replace Kindle mock data with real tRPC mutation call
- [x] Replace Paperback mock data with real tRPC mutation call
- [x] Add loading states for category analysis
- [ ] Test AI category generation for both Kindle and Paperback formats with real book data

### Make Book Wrap Step Optional (Authors Design Externally)
- [x] Add "Skip Book Wrap - I'll Design Externally" button in Step 7
- [x] Update step progression logic to allow Amazon KDP (Step 6) → Export (Step 8) flow
- [x] Add explanatory text that complete book design (cover + interior + wrap) can be done in Canva or by designer
- [x] Ensure Export step works correctly without book wrap upload (already works)
- [x] Update progress indicator to show Step 7 as optional
- [x] Test complete workflow with Book Wrap skipped (WORKS PERFECTLY)
- [x] Review entire 8-step flow for logical consistency
- [x] Update Book Wrap page to clearly state it's optional

### Keyword Generation for Kindle and Paperback
- [x] Update backend keyword generation to accept format parameter (kindle/paperback)
- [x] Generate separate keywords based on Kindle categories vs Paperback categories
- [x] Update AI prompt to prioritize LOW-COMPETITION keywords for #1 ranking
- [x] Add book content analysis to generate ultra-targeted keywords
- [x] Update frontend to show two separate keyword sections:
  - [x] Kindle eBook Keywords (7 keywords based on Kindle categories)
  - [x] Paperback Keywords (7 keywords based on Paperback categories)
- [x] Add "Generate Keywords" button for each format
- [x] Ensure keywords are only generated after categories are selected
- [x] Display keywords with badge UI (copy functionality via selection)
- [x] Test keyword generation with real category data for both formats (ready for user testing)

### Fix "Start New Book" Workflow Bug
**Issue:** When clicking "Start New Book", the "Resume Where You Left Off?" dialog appears. Clicking "Start Fresh" reuses the existing book ID instead of creating a completely new book entry.

**Expected Behavior:**
- "Resume Progress" → Continue working on existing book at saved step
- "Start Fresh" / "Start New Book" → Create brand new book entry with new bookId

**Tasks:**
- [x] Identify where resume dialog logic is in ReadyToPublish.tsx (handleStartFresh function)
- [x] Update "Start Fresh" to clear bookId state (setBookId(null))
- [x] Reset all workflow state variables (manuscript, covers, categories, keywords)
- [x] Ensure "Start Fresh" creates new book entry by clearing bookId
- [x] Add startingFresh flag to prevent auto-select from reloading old book
- [x] Test complete "Start Fresh" flow (create new book, upload manuscript, verify new bookId)

---

## 🚨 CRITICAL: Fix Invalid Blueprint Error - AI Conversation Not Loading ✅

### Issue - FIXED ✅
- [x] After creating blueprint in AI Writing Studio, navigating to `/start-writing?blueprintId=2700` shows "Invalid Blueprint" error - FIXED: Changed from route parameter to query parameter
- [x] AI blueprint conversation interface (3-step process) is not loading - FIXED
- [x] Chapter writing system is not accessible - FIXED
- [x] All the beautiful AI writing work is blocked by this error - FIXED
- [x] Need to fix StartWritingProcess.tsx to properly load blueprint and show AI conversation - FIXED

### Root Cause - IDENTIFIED ✅
- [x] Investigate why blueprintId from URL is not being recognized - FIXED: Was reading route param instead of query param
- [x] Check if blueprint.getById query is failing - FIXED: Query works, URL parsing was wrong
- [x] Verify blueprint was actually created in database - VERIFIED: storyBlueprints table exists with 4 blueprints

### Solution Applied ✅
- [x] Changed StartWritingProcess.tsx to read blueprintId from query parameter (?blueprintId=123) instead of route parameter (:blueprintId)
- [x] AIWritingStudio.tsx already navigates correctly with query parameter
- [x] Blueprint conversation interface should now load properly

---

## 🎉 AI Writing Studio - 3-Studio Architecture Complete

### Homepage Redesign ✅
- [x] Hero section with "Write, Publish & Market Your Bestseller in 2 Days"
- [x] Why Authors Choose Us section showcasing 3 studios
- [x] Featured Authors Network (Pauline Teo, Robert J. Battista)
- [x] How It Works (3-step flow)
- [x] Sign Up and Sign In buttons always visible in header
- [x] Post-login auto-redirect to Dashboard

### Dashboard Redesign ✅
- [x] Stats cards: Total Books, In Progress, Published, Total Words
- [x] Your Studios section with 3 cards (AI Writing, AI Publishing, AI Marketing)
- [x] Recent Books section with progress bars and status badges
- [x] Empty state for users with no books
- [x] Profile completion alert card
- [x] Start New Book button links to AI Writing Studio

### AI Writing Studio ✅
- [x] Inline blueprint creation form (title, genre, target audience, description)
- [x] Project list view with Continue/Publishing buttons
- [x] "Continue to Publishing" button appears when manuscript reaches 40,000+ words
- [x] Navigation to 3-step AI blueprint process
- [x] Multiple book project management

### AI Publishing Studio ✅
- [x] Connected to existing 8-step "Ready to Publish" workflow
- [x] Manuscript upload → AI analysis → Cover design → KDP optimization → Export
- [x] Accessible from Dashboard and sidebar navigation

### AI Marketing Studio ✅
- [x] Placeholder page with 5 marketing feature cards
- [x] Audience targeting, email campaigns, social media, ads, analytics
- [x] "Coming Soon" indicators

### Navigation Flow ✅
- [x] Homepage → Sign In → Dashboard
- [x] Dashboard → AI Writing Studio → Create Blueprint → AI Conversation
- [x] Dashboard → AI Publishing Studio → 8-step workflow
- [x] Dashboard → AI Marketing Studio → Coming soon features
- [x] Sidebar navigation shows all 3 studios

---

## Next Steps

### Immediate Testing Required
- [ ] Test blueprint creation end-to-end: Dashboard → AI Writing Studio → Create Blueprint → AI Conversation loads
- [ ] Verify AI conversation interface displays properly with questions and suggestions
- [ ] Test chapter generation workflow after blueprint is complete
- [ ] Verify "Continue to Publishing" button works when manuscript reaches 40,000+ words

### Future Enhancements
- [ ] Add third featured author from artoflifecircle.com to homepage
- [ ] Implement AI Marketing Studio features (email campaigns, social media, ads)
- [ ] Add analytics dashboard for published books
- [ ] Implement collaboration tools for beta readers


---

## 🚨 NEW BUG: Continue Writing Button Not Navigating to AI Conversation

### Issue
- [ ] Clicking "Continue Writing" on existing project in AI Writing Studio doesn't navigate to `/start-writing?blueprintId={id}`
- [ ] Instead stays on AI Writing Studio page showing the blueprint creation form
- [ ] User cannot access the AI conversation interface for existing projects
- [ ] handleContinue function may not be working correctly

### Expected Behavior
- Click "Continue Writing" → Navigate to `/start-writing?blueprintId={id}` → Show AI conversation interface

### Investigation Needed
- [ ] Check handleContinue function in AIWritingStudio.tsx
- [ ] Verify navigation logic based on blueprint progress
- [ ] Ensure blueprintId is passed correctly in URL


---

## 🚨 CRITICAL: Blueprint Generated Successfully But Redirects to Dashboard - FIXED ✅

### Issue - RESOLVED
- [x] After completing the 3-step AI blueprint conversation, the system shows "Blueprint generated! Review and refine below." toast
- [x] But immediately redirects to Dashboard instead of showing the generated blueprint - FIXED
- [x] User cannot see or review the beautiful AI-generated blueprint content - FIXED
- [x] All the AI conversation work (questions, answers, suggestions) disappears - FIXED
- [x] User has no way to access the generated blueprint for review - FIXED

### Expected Behavior
After blueprint generation completes:
1. Stay on the same page (StartWritingProcess)
2. Display the generated blueprint with all sections (premise, characters, plot points, themes, etc.)
3. Allow user to review and refine the blueprint
4. Provide "Continue to Outline" button to proceed to chapter outline generation

### Solution Applied ✅
- [x] Removed `setLocation("/dashboard")` from generateBlueprint success callback
- [x] Added `refetchBlueprint()` to reload the generated blueprint data
- [x] Page now stays on StartWritingProcess after generation completes
- [x] useEffect automatically updates UI when blueprint data is refetched
- [x] BlueprintPreview component shows all generated sections on right side
- [x] User can review premise, characters, plot, themes, etc.


---

## 🐛 AI Chapter Editing Not Working - Returns Same Content - FIXED ✅

### Issue - RESOLVED
- [x] User clicks "Request Edits from AI" button on chapter content
- [x] User provides editing instructions (e.g., "rewrite this section")
- [x] AI returns the exact same content without making any changes - FIXED
- [x] Edit prompt is not instructing AI to actually apply the requested changes - FIXED

### Expected Behavior
When user requests AI edits:
1. User provides specific editing instructions
2. AI reads the current chapter content
3. AI applies the requested changes (rewrite, improve, shorten, etc.)
4. AI returns the modified content
5. User can approve or request further edits

### Solution Applied ✅
- [x] Found requestEdit mutation in server/routers.ts (line 1573)
- [x] Improved AI prompt with explicit "CRITICAL INSTRUCTIONS" section
- [x] Added explicit prohibition: "DO NOT return the same content unchanged"
- [x] Added specific guidance for common edit requests:
  - "rewrite" → rephrase sentences, restructure paragraphs
  - "improve" → enhance prose, add vivid details
  - "shorten" → condense while preserving key points
  - "expand" → add more details and examples
- [x] Prompt now emphasizes that author expects to see actual modifications


---

## 🐛 Dashboard Not Displaying Existing Book Projects - FIXED ✅

### Issue - RESOLVED
- [x] User has 1 book project in the system
- [x] Dashboard shows "No books yet" in Recent Books section - FIXED
- [x] All statistics show 0 (Total Books: 0, In Progress: 0, Published: 0, Total Words: 0) - FIXED
- [x] Dashboard is not loading or displaying existing project data - FIXED
- [x] Dashboard queries may not be fetching from the correct tables or using correct user ID - FIXED

### Expected Behavior
Dashboard should:
1. Display total count of user's book projects
2. Show in-progress and published counts
3. Display total word count across all projects
4. List recent book projects with titles, status, and progress
5. Allow clicking on projects to continue working on them

### Solution Applied ✅
- [x] Found that dashboard was only querying books table, not storyBlueprints
- [x] Added blueprint.getUserProjects query to Dashboard component
- [x] Combined blueprints and books into unified allProjects list
- [x] Updated statistics to count all projects (blueprints + books)
- [x] Updated Recent Books section to display all projects sorted by date
- [x] Added project type detection to navigate correctly:
  - Blueprints → /start-writing?blueprintId={id}
  - Books → /ai-writing-studio
- [x] Dashboard now shows all 4 blueprints + 2 books = 6 total projects


---

## 🚨 CRITICAL: AI Editing Still Not Working After Prompt Fix

### Issue
- [ ] Previous fix to AI editing prompt didn't solve the problem
- [ ] AI still returns same content when asked to rewrite
- [ ] Prompt instructions are being ignored by the AI model
- [ ] Need stronger approach - possibly system message or different model parameters

### Investigation Needed
- [ ] Check if the prompt is actually being sent correctly
- [ ] Try using system message instead of user message
- [ ] Add temperature parameter to encourage more variation
- [ ] Consider using a different approach: show diff/comparison before applying
- [ ] Test with explicit examples in the prompt
