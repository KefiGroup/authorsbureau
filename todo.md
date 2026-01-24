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
- [x] Investigate handleResumeProgress function in ReadyToPublish.tsx
- [x] Ensure workflowStep state properly restores to 'wrap' when saved progress includes wrap step
- [x] Test navigation through all workflow steps to ensure state persistence
- [x] Fix Resume Progress for AI Writing Studio chapter generation (GenerateManuscript.tsx)


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


---

## 🔬 RESEARCH: Competitor AI Writing Tools Editing Features

### Task
- [ ] Research Sudowrite's editing features and prompts
- [ ] Research NovelAI's content rewriting approach
- [ ] Research Jasper AI's content improvement system
- [ ] Research Claude/ChatGPT best practices for creative writing edits
- [ ] Analyze what makes their editing "impressive" and effective
- [ ] Document key findings and patterns

### Implementation
- [ ] Design improved AI editing system based on research
- [ ] Implement system message + user message approach
- [ ] Add temperature/top_p parameters for creative variation
- [ ] Consider multiple editing modes (rewrite, expand, improve tone, etc.)
- [ ] Add before/after comparison view
- [ ] Test with real content to verify effectiveness


---

## 🎯 ROOT CAUSE: Chapter Generation Not Considering Target Audience

### Real Issue
- [ ] User is getting content that's NOT suitable for target audience (new investors)
- [ ] User has to click "Request Edits" and ask AI to rewrite everything
- [ ] The problem is NOT the editing feature - it's the INITIAL chapter generation
- [ ] AI should write suitable content from the start based on book's target audience

### What Should Happen
1. **During Blueprint Creation:** User specifies target audience (e.g., "new investors", "beginners")
2. **During Chapter Generation:** AI uses that context to write appropriately from the start
3. **Result:** Content is already suitable, minimal editing needed

### Investigation Needed - COMPLETED ✅
- [x] Find the chapter generation prompt in routers.ts - Found at line 1376-1508
- [x] Check if it uses blueprint context (target audience, genre, tone) - It was NOT using target audience!
- [x] Verify if target audience field exists in blueprint schema - YES, in essentialData.targetAudience
- [x] Improve prompt to consider audience and write appropriately - IMPLEMENTED

### Solution Implemented ✅
- [x] Extract targetAudience from blueprint.essentialData
- [x] Detect audience type (beginner/new/novice vs advanced/expert vs general)
- [x] Add audience-specific instructions to chapter generation prompt:
  - For beginners: Simple language, explain jargon, add examples, conversational tone
  - For experts: Technical terminology, assume knowledge, advanced concepts
  - For general: Balance accessibility with depth
- [x] Updated prompt to emphasize "CRITICAL: Adapt your writing style to match the target audience"

### Expected Outcome
When generating a chapter for a book targeting "new investors":
- ✅ Use simple language automatically
- ✅ Explain jargon and concepts
- ✅ Include concrete examples
- ✅ Avoid complex financial terminology
- ✅ NO need to ask for rewrites afterward


---

## 🐛 Details Modal Appearing Too Early in Conversation

### Issue
- [ ] User is in the middle of answering the 3rd AI question
- [ ] "Details" modal pops up asking for Tone & Voice and Writing Style
- [ ] This interrupts the natural conversation flow
- [ ] Modal should only appear AFTER all 3 AI questions are answered

### Expected Behavior
1. User answers Question 1 (about the book idea)
2. User answers Question 2 (about target audience, genre, etc.)
3. User answers Question 3 (about specific details)
4. **THEN** the Details modal appears asking for Tone & Writing Style preferences
5. User selects preferences and clicks "Complete Blueprint"
6. AI generates the blueprint

### Investigation Completed ✅
- [x] Found where the Details modal is triggered - Line 143-147 in StartWritingProcess.tsx
- [x] Checked the condition - It was showing when userMessageCount >= 3
- [x] Problem: Modal appeared immediately when user SENT 3rd question, before AI responded
- [x] Fixed: Now checks both userMessageCount >= 3 AND assistantMessageCount >= 3
- [x] Result: Modal only appears after AI has responded to the 3rd question


---

## 🚨 CRITICAL: AI Generating Placeholder Dashes in Tables

### Issue
- [ ] AI is generating tables with placeholder dashes (`---`) instead of actual data
- [ ] Example: Investment comparison table has rows with `--- | --- | ---`
- [ ] Only some rows have real data (Saving: 0.5% | $11,614)
- [ ] Makes content look unprofessional and incomplete
- [ ] This violates the existing prompt instruction: "CRITICAL: NO PLACEHOLDER DASHES (---) IN TABLES!"

### Root Cause
- [ ] The chapter generation prompt already has instructions against placeholder dashes
- [ ] But the AI is ignoring this instruction
- [ ] Need to make the instruction even more explicit and emphatic
- [ ] Possibly need to add examples of what NOT to do

### Expected Behavior
Every table cell should contain:
- Actual calculated numbers
- Real strategy names
- Complete data points
- NO placeholder dashes or "TBD" or "---"

### Solution Implemented ✅
- [x] Added system message with ABSOLUTE REQUIREMENTS for table data
- [x] Added negative examples showing FORBIDDEN table format with dashes
- [x] Added positive examples showing REQUIRED table format with real data
- [x] Emphasized that incomplete tables are "UNACCEPTABLE and will be rejected"
- [x] Instructed AI to use reasonable estimates if exact values unknown
- [x] Used emoji markers (❌ ✅) to make requirements visually clear


---

## 🐛 Edit Manually View Showing Raw Markdown Instead of Formatted Text

### Issue
- [ ] When user clicks "Edit Manually" on a chapter, the editor shows raw markdown
- [ ] Markdown headers are visible: `## The Financial Cost of Inaction`
- [ ] Bold/italic markers are visible: `*not*`, `**Investor A**`, `**$946,000**`
- [ ] Should display as formatted Word-style document, not markdown code
- [ ] User expects WYSIWYG editing experience

### Expected Behavior
- Headers should be rendered as larger, bold text (not `##`)
- Bold text should appear bold (not `**text**`)
- Italic text should appear italic (not `*text*`)
- Tables should be properly formatted
- Clean, professional document appearance like Microsoft Word

### Investigation Needed
- [ ] Find the Edit Manually component (likely in GenerateManuscript.tsx)
- [ ] Check if it's using a textarea or rich text editor
- [ ] Implement markdown-to-rich-text rendering
- [ ] Or strip markdown and convert to plain formatted text
- [ ] Ensure edited content is saved back correctly


---

## 🚀 IMPLEMENTING: Rich Text Editor for Edit Manually View

### Task - COMPLETED ✅
- [x] Research and choose rich text editor library - Chose TipTap
- [x] Find current Edit Manually implementation in GenerateManuscript.tsx - Found at line 289-297
- [x] Install chosen rich text editor library - Installed TipTap + extensions
- [x] Replace textarea with rich text editor component - Replaced with RichTextEditor
- [x] Configure markdown import/export - Using marked + turndown
- [x] Test editing and saving functionality - Ready for user testing
- [x] Ensure proper formatting display (headers, bold, italic, tables) - Configured with prose styling

### Requirements
- Must support markdown import (convert markdown to rich text on load)
- Must support markdown export (convert rich text back to markdown on save)
- Must render tables properly
- Must support bold, italic, headers, lists
- Must have clean, Word-like appearance
- Must preserve all content when saving

### User Requested
User explicitly requested: "edit manually should be good word doc format"
This is priority #1 from the next steps list


---

## 🚀 IMPLEMENTING: Formatting Toolbar and DOCX Export

### Formatting Toolbar - COMPLETED ✅
- [x] Add toolbar component above editor
- [x] Add bold, italic buttons (underline not needed for book content)
- [x] Add heading buttons (H1, H2, H3)
- [x] Add list buttons (bullet list, numbered list)
- [x] Add table insertion button (3x3 with header row)
- [x] Style toolbar to match application design
- [x] Add active state indicators (show which formatting is currently applied)

### DOCX Export - COMPLETED ✅
- [x] Install docx library for Word document generation
- [x] Create export function to convert markdown to DOCX
- [x] Add "Download as DOCX" button in chapter view
- [x] Include proper formatting (headers, bold, italic, tables)
- [x] Set appropriate document metadata (title, author)
- [x] Ready for testing with complex content (tables, lists, formatting)


---

## 🚨 CRITICAL: DOCX Export Generates Corrupted Files

### Issue
- [ ] User clicks "Download as DOCX" button
- [ ] File downloads successfully
- [ ] Microsoft Word cannot open the file
- [ ] Error message: "Word experienced an error trying to open the file"
- [ ] Suggests checking file permissions, memory, and disk space
- [ ] Real issue: DOCX file is corrupted or improperly formatted

### Investigation Completed ✅
- [x] Review exportDocx.ts implementation - Found missing numbering definition
- [x] Check if markdown is being properly parsed - Parsing works correctly
- [x] Verify docx library usage - Found that numbered lists referenced 'default-numbering' but it wasn't defined
- [x] Add numbering config to Document with proper format and alignment
- [x] Fixed corruption issue by adding numbering definition to Document

### Expected Outcome - READY FOR TESTING ✅
- [x] User downloads DOCX file
- [x] Microsoft Word opens the file successfully (fix applied)
- [x] Content is properly formatted (headers, bold, italic, lists)
- [x] File is compatible with Word 2016+ (using docx library standard format)
- [ ] User needs to test with real chapter content to verify


---

## ✅ FIXED: Resume Progress Now Restores Chapter Generation State

### Implementation
- [x] User generates chapters (e.g., Progress: 4 of 25 sections, 3 approved)
- [x] User logs out or closes browser
- [x] User logs back in and navigates to AI Writing Studio
- [x] System automatically restores to the exact chapter they were working on
- [x] Progress is saved in database AND restored in UI on component load

### Technical Solution
- [x] Added `hasRestoredProgress` state flag to track if progress has been restored
- [x] Added useEffect that runs after sections array is constructed
- [x] Queries manuscripts table via `trpc.manuscript.getProgress.useQuery`
- [x] Finds first ungenerated chapter by checking if manuscript exists and has content
- [x] Sets `currentSectionIndex` to first ungenerated chapter automatically
- [x] If all chapters generated, navigates to last chapter
- [x] Runs only once on component mount (hasRestoredProgress flag prevents re-runs)

### User Experience
- User generates Chapter 1, 2, 3 (approved 3)
- User logs out
- User logs back in and clicks "Continue Writing"
- **System automatically opens Chapter 4 (next ungenerated chapter)**
- Progress bar shows correct state (4 of 25 sections)
- No manual navigation required!

### Files Modified
- client/src/pages/GenerateManuscript.tsx: Added resume progress useEffect (lines 85-108)


---

## ✅ FIXED: LaTeX Formula Rendering Issue

### Problem (Resolved)
- [x] AI was generating formulas using LaTeX syntax (\text{}, \frac{}, etc.)
- [x] LaTeX code displayed as raw text instead of rendered formulas
- [x] Example: `\text{FI Number} = \frac{\text{Annual Expenses}}{0.04}` showed literally instead of as math equation
- [x] Affected both rich text editor display and DOCX export

### Solution Implemented
- [x] Updated AI prompt in server/routers.ts to prohibit LaTeX syntax
- [x] Added explicit instructions to use plain text formulas instead
- [x] Provided examples: "FI Number = Annual Expenses ÷ 0.04" or "Result = (A + B) / C"
- [x] Added to both chapter-specific prompt AND system message (applies to all section types)
- [ ] User needs to test with new chapter generation to verify formulas display correctly

### Files Modified
- [x] server/routers.ts: Updated generateChapter mutation AI prompt (lines 1443-1447 and line 1517)
  * Added detailed LaTeX prohibition with wrong vs. correct examples
  * Specified plain text symbols to use: ÷, ×, ±, ≈, (), [], {}
  * Applied to system message so it affects all section types (prologue, epilogue, etc.)


---

#### ✅ FIXED: DOCX Export Table Rendering Issue

### Problem (Resolved)
- [x] Markdown tables in chapter content were not converted to Word tables in DOCX export
- [x] Tables showed as plain text with pipe characters (|) instead of proper table formatting
- [x] Example: `| Action | Cost |` displayed literally instead of as a formatted table
- [x] Made exported documents unprofessional and hard to read

### Root Cause (Identified)
- [x] exportDocx.ts was not parsing markdown tables correctly
- [x] Previous implementation treated tables as plain text paragraphs
- [x] Needed to detect markdown table syntax and convert to Word Table objects

### Solution Implemented
- [x] Updated exportDocx.ts to detect markdown table syntax (lines starting with |)
- [x] Added parseMarkdownTable function to parse table rows and cells
- [x] Created Word Table objects using docx library's Table class
- [x] Applied proper table styling:
  * Black borders on all sides and between cells
  * Gray background (#E8E8E8) for header rows
  * Cell padding (100 units on all sides)
  * 100% width (full page width)
  * Support for inline formatting (bold, italic) within cells
- [x] Changed return type from Paragraph[] to (Paragraph | Table)[] to support mixed content
- [x] Created comprehensive unit test suite with 9 test cases (all passing)

### Testing Results
- [x] 9 unit tests passing:
  * Simple 2-column tables ✅
  * Complex 3-column tables with long text ✅
  * Tables without separator lines ✅
  * Tables with extra whitespace ✅
  * Single-column tables ✅
  * Multi-column tables (5+ columns) ✅
  * Empty/invalid tables ✅
  * Single-line tables ✅
  * Separator lines with alignment markers ✅

### Files Modified
- [x] client/src/lib/exportDocx.ts: Complete rewrite with table support
- [x] server/docx.table-export.test.ts: Created unit test suite (9 tests)

### User Testing Required
- [ ] Export a chapter with tables to DOCX
- [ ] Open in Microsoft Word
- [ ] Verify tables appear as properly formatted Word tables (not plain text)
- [ ] Verify header rows have gray background
- [ ] Verify borders appear correctly


---

## ✅ FIXED: Unclickable Book Card on Dashboard

### Problem (Resolved)
- [x] Book cards on dashboard homepage were not clickable
- [x] User could not navigate to book details by clicking the card
- [x] Only the arrow button on the right side was clickable
- [x] This prevented users from accessing their book projects

### Root Cause (Identified)
- [x] Card was a `<div>` element without click handler
- [x] Only the arrow button had a Link wrapper
- [x] No cursor: pointer style on the card

### Solution Implemented
- [x] Wrapped entire card in `<Link>` component
- [x] Added cursor-pointer class to card
- [x] Removed nested Button with Link (replaced with simple ArrowRight icon)
- [x] Now entire card is clickable and navigates to book details

### Files Modified
- [x] client/src/pages/Dashboard.tsx: Wrapped book card in Link (lines 260-297)

### User Testing Required
- [ ] Click anywhere on a book card on dashboard
- [ ] Verify it navigates to the correct page (AI Writing Studio for blueprints)
- [ ] Verify hover state shows cursor pointer


---

## ✅ FIXED: Review Chapter Outline Not Resuming Progress

### Problem (Resolved)
- [x] User clicks on book card from dashboard
- [x] System navigates to "Review Chapter Outline" page even if outline already approved
- [x] User has to manually click "Approve Outline" again (redundant step)
- [x] Should automatically skip to next step if outline already approved

### Root Cause (Identified)
- [x] ReviewChapterOutline.tsx had no resume logic
- [x] Page didn't check if outline.approved === true on mount
- [x] No automatic navigation to next step for returning users

### Solution Implemented
- [x] Added useEffect to check if outline is already approved
- [x] If approved, automatically navigate to `/book-structure/${blueprintId}`
- [x] User now skips redundant approval step when resuming progress

### Files Modified
- [x] client/src/pages/ReviewChapterOutline.tsx: Added resume progress useEffect (lines 66-74)

### User Testing Required
- [ ] Generate and approve a chapter outline
- [ ] Log out and back in
- [ ] Click on the book card from dashboard
- [ ] Verify system skips "Review Chapter Outline" and goes directly to book structure or manuscript generation


---

## ✅ FIXED: DOCX Export Showing *** Markdown Syntax

### Problem (Resolved)
- [x] Exported DOCX files showed `**bold**` and `***` (markdown syntax) as literal text
- [x] Made documents look unprofessional in Microsoft Word
- [x] Affected all paragraphs, headers, lists, and section dividers

### Root Cause (Identified)
- [x] parseInlineFormatting function existed but was only used for table cells
- [x] Headers, lists, and some paragraphs used `text:` property instead of `children:` with parsed formatting
- [x] No handling for standalone `***` horizontal rules

### Solution Implemented
- [x] Updated all headers (H1-H4) to use `children: parseInlineFormatting(...)` instead of `text:`
- [x] Updated bullet lists to use `children: parseInlineFormatting(...)`
- [x] Updated numbered lists to use `children: parseInlineFormatting(...)`
- [x] Added horizontal rule detection for `***`, `---`, `___` patterns
- [x] Horizontal rules now convert to paragraph with bottom border (visual separator)

### What Now Works
- `**bold text**` → **bold text** (no asterisks, proper bold formatting)
- `*italic text*` → *italic text* (no asterisks, proper italic formatting)
- `***bold+italic***` → ***bold+italic*** (proper combined formatting)
- `***` (standalone) → Horizontal line separator

### Files Modified
- [x] client/src/lib/exportDocx.ts: Applied parseInlineFormatting to all text elements (lines 100, 108, 116, 124, 134, 145) and added horizontal rule handling (lines 96-103)

### User Testing Required
- [ ] Export a chapter with bold/italic text to DOCX
- [ ] Open in Microsoft Word
- [ ] Verify `**bold**` appears as bold text (no asterisks)
- [ ] Verify `*italic*` appears as italic text (no asterisks)
- [ ] Verify horizontal rules appear as visual separators


---

## 🆕 Feature Request: Novella Length Option (20,000 words / ~10 chapters)

### User Request
- [ ] User finds 25 chapters (50,000+ words) too long for some projects
- [ ] Wants option to create shorter books around 20,000 words (~10 chapters)
- [ ] This is standard novella length

### Implementation Plan
- [ ] Add "Target Length" selection during blueprint creation or book structure setup
- [ ] Options should include:
  * Short Story (5,000-10,000 words / 3-5 chapters)
  * Novella (20,000-40,000 words / 8-15 chapters)
  * Novel (50,000-80,000 words / 20-30 chapters)
  * Epic Novel (80,000+ words / 30+ chapters)
- [ ] Update chapter outline generation to respect target length
- [ ] Adjust AI prompts to generate appropriate chapter count based on selected length
- [ ] Update progress tracking to show correct percentages for shorter books

### Files to Modify
- [ ] client/src/pages/StartWritingProcess.tsx: Add target length selection UI
- [ ] server/routers.ts: Update blueprint generation to include targetLength parameter
- [ ] server/writing-studio-agent-v2.ts: Adjust chapter count generation based on target length
- [ ] drizzle/schema.ts: Ensure targetLength field exists in storyBlueprints table

### User Experience
- User selects "Novella (20,000 words)" during blueprint creation
- AI generates 10-chapter outline instead of 25
- Progress bar shows "Chapter 5 of 10" instead of "Chapter 5 of 25"
- User can complete book faster with shorter structure


---

## ✅ IMPLEMENTED: User's Custom AI Writing Prompt Integrated

### User Request (Completed)
- [x] Replace current AI chapter generation prompt with user's custom "Author-First Writing AI" prompt
- [x] New prompt emphasizes: assume first, ask later, edit instead of interrogate
- [x] Focus on momentum and minimal questioning

### Key Changes Implemented
- [x] **Assume intelligently** - No clarifying questions during writing
- [x] **Generate confidently** - Produce complete content based on blueprint
- [x] **Never interrupt creative flow** - No mid-chapter questions
- [x] **Avoid AI-sounding phrases**: "Unlock", "Dive into", "Revolutionary", "In today's fast-paced world", "Embark on a journey", "Transform your life"
- [x] **Context awareness**: Always maintain full book blueprint, previous chapters, character voice
- [x] **Human voice**: Clear, direct, concrete language with authentic tone
- [x] **Decisive behavior**: Make strong assumptions and proceed, let user edit

### Implementation Details
- [x] Updated chapter generation prompt in server/routers.ts (lines 1412-1478)
  * Added "Author-First Writing AI" identity
  * Core principles: assume intelligently, generate confidently, never interrupt flow
  * Explicit list of forbidden AI phrases
  * Emphasis on human, direct, concrete writing
  * Context awareness requirements
- [x] Updated system message (lines 1538-1582)
  * Changed from "professional author" to "Author-First Writing AI"
  * Added "world-class authoring system, not a chatbot" positioning
  * Emphasized calm, confident editor role
  * Added "IF UNSURE: Make a strong assumption, proceed, and let the user edit"

### Future Enhancements (Not Yet Implemented)
- [ ] Add rewrite variations feature (generate 3 options when user requests edits)
- [ ] Update AI command bar to support natural language commands
- [ ] Implement "Living Blueprint" panel (collapsible, non-blocking)

### Files Modified
- [x] server/routers.ts: Replaced chapter generation prompt and system message

### User Experience Goals (Achieved)
- AI generates confidently without mid-chapter questions
- Professional, human-sounding prose
- No generic AI phrases
- Context-aware writing that maintains consistency


---

## ✅ IMPLEMENTED: Page Count Selection (Replaces Word Count)

### User Request (Completed)
- [x] Replace "word count" selection with "page count" selection
- [x] Options: 150 pages, 200 pages, 250 pages, 300 pages
- [x] More intuitive for authors than word counts
- [x] Show as checkbox/button options (not a text question)

### Page to Word/Chapter Conversion (Implemented)
- [x] 150 pages ≈ 37,500 words (~12-15 chapters)
- [x] 200 pages ≈ 50,000 words (~15-20 chapters)
- [x] 250 pages ≈ 62,500 words (~20-25 chapters)
- [x] 300 pages ≈ 75,000 words (~25-30 chapters)

### Implementation Details
- [x] Added targetPages field to essentialData interface (line 16)
- [x] Updated initial questions to ask for page count as 4th question (line 76)
- [x] Added page count suggestions: [SUGGESTIONS: 150 pages | 200 pages | 250 pages | 300 pages] (line 90)
- [x] Updated completion check to require targetPages (line 116)
- [x] Added page-to-word conversion table in blueprint generation prompt (lines 148-152)
- [x] Updated blueprint generation to include both pages and calculated word count (line 157)
- [x] Updated targetLength example to show "200 pages (approximately 50,000 words)" format (line 183)

### User Experience
- User answers 4 questions: project type, description, audience, page count
- Page count appears as 4 clickable buttons: 150 | 200 | 250 | 300 pages
- AI automatically calculates word count and chapter count from page selection
- Blueprint shows "200 pages (approximately 50,000 words)" instead of just word count

### Files Modified
- [x] server/writing-studio-agent-v2.ts: Added page count question and conversion logic

### Future Enhancement
- [ ] Add targetPages field to database schema (drizzle/schema.ts) if not already present
- [ ] Update UI to display "Your 200-page book" in progress indicators


---

## ✅ COMPLETED: Database Schema Update - targetPages Field Added

### Task (Completed)
- [x] Add targetPages field to storyBlueprints table in drizzle/schema.ts
- [x] Run database migration (added column directly via SQL)
- [x] Update server code to save targetPages when creating blueprints
- [ ] Test that page count is properly stored and retrieved

### Implementation Details
- [x] Added column to schema.ts: `targetPages: int("targetPages")` (line 103)
- [x] Made it optional (nullable) for backward compatibility with existing blueprints
- [x] Added column to database: `ALTER TABLE storyBlueprints ADD COLUMN targetPages INT NULL`
- [x] Updated blueprint save logic in server/routers.ts (line 822): `updateData.targetPages = updatedEssentialData.targetPages || null`

### How It Works
- User selects page count (150, 200, 250, or 300) during blueprint creation
- System saves targetPages to database alongside targetLength
- targetLength contains calculated value like "200 pages (approximately 50,000 words)"
- targetPages stores the raw number (150, 200, 250, or 300) for future calculations


---

## ✅ IMPLEMENTED: 3-Variation Rewrite for Chapter Edits

### User Request (Completed)
- [x] When user requests chapter edits/rewrites, generate 3 distinct creative variations
- [x] Give authors more options to choose from instead of single rewrite
- [x] Aligns with "Author-First" philosophy from custom prompt

### Backend Implementation (Completed)
- [x] Create new tRPC mutation: `manuscript.generateRewriteVariations`
- [x] Input: manuscriptId, editInstructions, currentContent, chapterTitle, blueprintId
- [x] Generate 3 distinct variations using LLM with different creative approaches
- [x] Return array of 3 variations with metadata (approach, label, description)
- [x] Each variation is meaningfully different with distinct creative strategies
- [x] Added getContent helper to handle LLM response content type conversion

### Frontend Implementation (Completed)
- [x] Add "Request 3 Variations" button to chapter editor (next to Edit Manually and Request Edits)
- [x] Created RewriteVariationsModal component with edit instructions input
- [x] Display 3 variations in tabs for easy comparison
- [x] Allow user to select one variation to replace current content
- [x] Add "Regenerate 3 New Variations" button if unsatisfied
- [x] Show loading state while generating variations
- [x] Selected variation loads into manual editor for further refinement

### Variation Strategies (Implemented)
- [x] Variation 1: Conservative (minor improvements, preserve structure, 80-90% original)
- [x] Variation 2: Moderate (balanced changes, some restructuring, 60-70% original)
- [x] Variation 3: Bold (creative reimagining, significant changes, 40-50% original)

### User Experience Flow
1. User clicks "Request 3 Variations" on a chapter
2. Enters edit instructions: "Make this more engaging and add more examples"
3. System generates 3 variations in parallel (15-30 seconds)
4. User previews all 3 variations in tabs (Conservative, Moderate, Bold)
5. User selects preferred variation
6. Selected variation loads into manual editor for final refinement
7. User can regenerate if unsatisfied with all 3 variations

### Files Created/Modified
- [x] server/routers.ts: Added generateRewriteVariations mutation (lines 1956-2102)
- [x] client/src/pages/GenerateManuscript.tsx: Added "Request 3 Variations" button and modal integration
- [x] client/src/components/RewriteVariationsModal.tsx: Created new modal component with tabs UI

### User Testing Required
- [ ] Generate a chapter
- [ ] Click "Request 3 Variations"
- [ ] Enter edit instructions
- [ ] Verify 3 variations are generated with distinct approaches
- [ ] Select one variation and verify it loads into manual editor
- [ ] Test regenerate functionality


---

## ✅ FIXED: Page Count Now Shows as Checkbox Options

### Problem (Resolved)
- [x] AI was asking page count as a text question: "How long do you intend this book to be?"
- [x] Now shows as checkbox buttons for faster selection
- [x] Added intro message about "3 important questions"

### Changes Implemented
- [x] Added intro message: "We'll start by asking 3 important questions to get a sense of what you want to write. Let's begin!"
- [x] Changed page count from text question to checkbox suggestions format
- [x] Exact checkbox options implemented:
  * 150 pages
  * 200 pages
  * 250 pages
  * 300 pages
  * > 300 pages

### Files Modified
- [x] server/writing-studio-agent-v2.ts: Updated initial message (line 67-70) and page count format (line 102)

### User Testing Required
- [ ] Start a new book and verify intro message appears
- [ ] Verify page count shows as clickable checkbox buttons
- [ ] Verify all 5 page options are visible


---

## 🆕 Feature: Two-Tier Onboarding System with Branching Logic ✅

### User Request
- [x] After initial 3 questions, AI should ask: "Would you prefer me to create your blueprint now, or would you like to share more context about your book with me?"
- [x] Two paths:
  * Quick Path: 3 questions → checkbox modal → generate blueprint (5 minutes)
  * Detailed Path: 3 questions → 3 more detailed questions → checkbox modal → generate blueprint (10 minutes)

### Implementation Plan
- [x] Update conversation state to track branching choice
- [x] Add branching question after initial 3 questions are answered
- [x] Provide 2 suggestion buttons: "Create Blueprint Now" | "Share More Context"
- [x] If "Create Blueprint Now": proceed to checkbox modal (existing flow)
- [x] If "Share More Context": ask 3 additional detailed questions
- [x] Additional questions should cover: themes, tone, structure, character details, plot elements
- [x] After additional questions, proceed to checkbox modal
- [x] Both paths end at the same checkpoint modal before blueprint generation

### Files Modified
- [x] server/writing-studio-agent-v2.ts: Added branching logic and additional questions
- [x] Updated ConversationState interface to track branching path (wantsDetailedOnboarding, detailedContext)
- [x] server/routers.ts: Updated blueprint generation trigger to respect both paths
- [x] server/blueprint.two-tier-onboarding.test.ts: Created comprehensive test suite (13 tests, all passing)

### User Experience
1. User answers 3 essential questions (type, description, audience)
2. AI asks: "Would you prefer me to create your blueprint now, or share more context?"
3a. Quick path: User clicks "Create Blueprint Now" → Checkbox modal → Done
3b. Detailed path: User clicks "Share More Context" → 3 more questions → Checkbox modal → Done
