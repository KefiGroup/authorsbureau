# Authors Bureau Platform - Feature Tracking

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

### Step 4: Cover Design ✅
- [x] AI-powered cover generation (3 variations)
- [x] Cover style selection (minimalist, bold, artistic)
- [x] Cover preview and selection
- [x] Edit/regenerate covers with feedback
- [x] **Custom cover upload option** (for pre-designed covers like Bob's)
  - [x] Add "Upload Your Own Cover" tab/option
  - [x] File upload input with drag-and-drop support
  - [x] Image dimension validation (1600x2560px recommended for eBook)
  - [x] Image format validation (PNG, JPG, JPEG)
  - [x] File size validation (max 50MB)
  - [x] Cover preview after upload
  - [x] Store uploaded cover URL and use in export
  - [x] S3 storage integration with unique file keys
  - [x] Upload progress indicator
  - [x] Success/error alerts
  - [x] Remove and replace uploaded cover
- [x] **Cover customization tools** (edit AI-generated covers)
  - [x] Create CoverCustomizer component with controls panel
  - [x] Add "Customize" button next to each AI-generated cover
  - [x] Font family selection dropdown (title, author name, subtitle)
    - [x] Include popular book fonts (Playfair Display, Montserrat, Merriweather, etc.)
  - [x] Color picker for title text color
  - [x] Color picker for author name text color
  - [x] Color picker for background overlay/accent colors
  - [x] Text positioning controls (top, center, bottom alignment)
  - [x] Font size sliders (title, author name)
  - [x] Live preview showing changes in real-time
  - [x] Backend: Update cover-generator.ts to accept custom style parameters
  - [x] Backend: Add customizeCover mutation to routers.ts
  - [x] Save customized settings and regenerate cover with new parameters
  - [x] Replace original cover with customized version in workflow
  - [x] Integrate CoverCustomizer dialog into ReadyToPublish
  - [x] Update generatedCovers array with customized cover
  - [x] Auto-select customized cover after applying changes

### Step 5: Book Wrap Designer (Paperback) ✅
- [x] Author profile integration (photo, bio)
- [x] Back cover layout presets (Classic, Modern, Minimal, Bold, Custom)
- [x] Toggle elements (photo, bio, description, ISBN)
- [x] Optional elements (foreword, testimonials, awards, series info)
- [x] Live back cover preview
- [x] Photo cropping and zoom
- [x] Spine width calculation (6"x9" trim, white/cream paper)
- [x] Full wrap generation (front + spine + back + bleed)
- [x] Export as PNG (300 DPI, print-ready)

### Step 6: Amazon KDP Optimization ✅
- [x] AI category research and recommendations
- [x] Keyword generation (7 buyer-intent keywords)
- [x] Book description optimization (2000-4000 chars)
- [x] Description editor with character counter
- [x] Pricing recommendations ($2.99+ for 70% royalty)
- [x] ISBN guidance (own, Amazon free, Bowker purchase)
- [x] Copyright page generation
- [x] **Interior preview button** (optional: review formatting)
  - [x] Add "Preview Pages" button in this step
  - [x] Open InteriorPreview component in modal/dialog
  - [x] Display page navigation and formatting preview
  - [x] Allow close and return to workflow

### Step 7: Pre-Publishing Checklist ✅
- [x] **Amazon KDP account setup reminder** (with signup link)
- [x] **Amazon Author Central account setup reminder** (with signup link)
- [x] Account verification checklist (tax info, payment method)
- [x] Display account setup guide with step-by-step instructions
- [x] Link to KDP signup: https://kdp.amazon.com
- [x] Link to Author Central: https://authorcentral.amazon.com
- [x] Checkbox confirmation for each setup step
- [x] Disable download button until checklist complete
- [x] **Interior preview button** (alternative placement)
  - [x] Add "Preview Pages" button before export
  - [x] Final formatting review before download

### Step 8: Export Package ✅
- [x] DOCX export (eBook format, editable)
- [x] PDF export (Paperback 6"x9", print-ready)
- [x] EPUB export (Kindle/KDP eBook format)
- [x] Cover image export (PNG/JPG)
- [x] KDP metadata file (categories, keywords, description)
- [x] ISBN information file
- [x] README with upload instructions
- [x] ZIP bundle download
- [ ] MOBI export (older Kindle devices)

### Interior Preview System ✅
- [x] Parse manuscript into pages (275 words/page for 6"x9")
- [x] Generate HTML preview for each page
- [x] Page-by-page navigation
- [x] Preview summary (total pages, word count, read time)
- [x] Quick jump to first/middle/last pages
- [x] Professional formatting (Times New Roman, 1.5 spacing, justified)
- [x] **Integrate into workflow** (added to Step 6 with dialog modal)

---

## Persona 1: Write From Scratch (Coming Soon)

### 2-Day Program - Day 1
- [x] SUCKcess Story Discovery Tool (lead magnet)
- [x] Book idea and outline generation
- [x] Character development and personal journey outline
- [ ] Chapter 1-3 drafting with AI assistance
- [ ] Review and refine interface

### 2-Day Program - Day 2
- [x] Chapter-by-chapter writing interface
- [x] AI-assisted chapter drafting with context
- [x] Real-time editing and refinement tools
- [x] Manuscript preview and review interface
- [x] Progress tracking across all chapters
- [ ] AI editing and proofreading
- [ ] Final review and export

---

## Author Profile Management ✅
- [x] Pen name, bio, website fields
- [x] Photo upload with crop & zoom (300x300px minimum)
- [x] AI bio generator (short/medium/long, 2000 char limit for Amazon)
- [x] LinkedIn profile URL
- [x] Books authored, accomplishments, education
- [x] Profile completion checks (Dashboard & Book Wrap Designer)
- [x] Amazon Author Central integration guide

---

## Dashboard & Navigation ✅
- [x] Simplified dashboard (3 cards: Ready to Publish, My Books, Start Writing)
- [x] Dashboard statistics (total books, published, in progress)
- [x] Profile completion alert
- [x] Quick actions (Upload Manuscript, View Books, Start Writing)
- [x] DashboardLayout with sidebar navigation
- [x] User authentication and role-based access

---

## Testing & Quality Assurance
- [x] EPUB generator tests (4 tests passing)
- [x] Interior preview tests (15 tests passing)
- [x] Export bundle tests (5 tests passing)
- [x] Manuscript export tests
- [x] Auth logout tests
- [ ] End-to-end workflow tests (upload → export)
- [ ] Cover generation tests
- [ ] Amazon optimization tests

---

## Phase 4 Remaining Tasks (KDP-Aligned)

### Priority 1: Critical KDP Requirements
- [ ] **Custom cover upload option** - for authors with pre-designed covers
- [ ] **Integrate interior preview into workflow** - add preview step before export
- [ ] Cover dimension validation and warnings

### Priority 2: Enhanced Customization
- [ ] Cover customization tools - edit fonts, colors, layouts on AI-generated covers
- [ ] Cover font selection (title, author name, subtitle)
- [ ] Cover color palette customization
- [ ] Cover text positioning controls

### Priority 3: Professional Polish
- [ ] MOBI generation for older Kindle devices (converted from EPUB)
- [ ] Enhanced PDF export with embedded fonts and high-res images
- [ ] Design element library and cover templates gallery
- [ ] Genre-specific cover templates (business, self-help, fiction, etc.)

---

## Future Phases (Not Started)

### Phase 5: Marketing Automation System
- [ ] Landing page builder with templates
- [ ] Lead magnet creation tools
- [ ] Email sequence automation setup
- [ ] Sales funnel designer with visual workflow
- [ ] Campaign analytics and tracking

### Phase 6: Amazon SP-API Integration (Post-Launch)
- [ ] Direct KDP publishing via API (requires Amazon approval)
- [ ] Real-time sales tracking dashboard
- [ ] Bestseller rank tracking (Amazon.com, .uk, .sg)
- [ ] Reviews and ratings aggregation
- [ ] Automated marketing recommendations

### Phase 7: Multi-Book Project Management
- [ ] Comprehensive author dashboard with all metrics
- [ ] Book progress tracking across all stages
- [ ] Stage-based workflow (writing → design → marketing → publishing)
- [ ] Revenue tracking and reporting

### Phase 8: Backend & Infrastructure
- [ ] API endpoint documentation
- [ ] Performance optimization and caching
- [ ] Data backup and recovery system
- [ ] Security hardening and penetration testing

---

## Completed Historical Features (Archive)

### Messaging & SEO
- [x] Inclusive messaging transformation ("Anyone Can Become a Published Author")
- [x] SEO optimization (meta tags, structured data, Open Graph)
- [x] Homepage enhancement with clear CTAs



---

## Persona 2 UX Optimization (Amazon KDP Readiness)

### Phase 1: Critical Fixes (Blocking Issues)
- [x] Fix step numbering: Update "7-Step Process" → "8-Step Process" everywhere
- [x] Fix Step 4 label: Change "(In Progress)" → "✅"
- [x] Add author profile prompt in Step 1 or Step 2 (before Book Wrap needs it)
  - [x] Add "Create Author Profile" card/section after AI analysis (new Step 3)
  - [x] Show profile completion status (photo, bio, pen name)
  - [x] Link to profile page with clear CTA
  - [x] Explain why profile is needed ("Required for Book Wrap in Step 5")
  - [x] Allow "Skip for Now" option with warning
  - [x] Show green success state when profile is complete
- [x] Add post-export KDP upload instructions modal
  - [x] Create KDPUploadGuide component with step-by-step instructions
  - [x] Show modal after successful export download
  - [x] Include helpful resources and links
  - [x] Provide direct links to KDP dashboard
  - [x] Explain which files to upload where (EPUB for eBook, PDF for paperback, cover image)
  - [x] Add 6-step upload guide with detailed instructions
  - [x] Include pricing recommendations and category guidance

### Phase 2: Flow Improvements (Suboptimal UX)
- [x] Fix progress indicator for 8-step workflow
  - [x] Update step counter from "7 of 7" to "8 of 8"
  - [x] Add profile-check step to visual progress circles
  - [x] Update step number logic to include profile-check
  - [x] Fix checkmark logic for all 8 steps
  - [x] Add proper icons for each step (Upload, Analysis, Review, Profile, Cover, Amazon, Wrap, Export)
- [x] Add back navigation buttons
  - [x] Add "← Back to [Previous Step]" button at top of each step
  - [x] Implement navigation logic (review → upload, profile-check → review, cover → profile-check, etc.)
  - [x] Preserve data when going back (data persists in state)
  - [x] Skip analyzing step when navigating backwards
  - [x] Add back buttons to all 6 navigable steps (Review, Profile, Cover, Amazon, Wrap, Export)
- [ ] Add "Did You Know?" KDP tips during cover generation loading
  - [ ] Create tip carousel component
  - [ ] Include 5-10 helpful KDP tips (pricing, categories, keywords)
  - [ ] Rotate tips during 15-30 second wait time
- [ ] Make interior preview more discoverable
  - [ ] Add tooltip on first visit: "👀 Preview how your book will look in print!"
  - [ ] Highlight button with subtle animation
  - [ ] Add "Recommended" badge to preview button
- [ ] Show export package contents before download
  - [ ] Add expandable file list above download button
  - [ ] Show file names, types, and purposes
  - [ ] Include file size estimates

### Phase 3: Polish (Nice to Have)
- [ ] Add estimated time remaining in progress indicator
  - [ ] Calculate based on current step and average completion times
  - [ ] Show "~15 minutes remaining" or "~5 minutes remaining"
- [ ] Add completion celebration moment
  - [ ] Show success animation after export download
  - [ ] Display "🎉 Congratulations! Your book is ready for Amazon KDP!"
  - [ ] Offer next steps: "Upload to KDP" or "Start Another Book"
- [ ] Add "Watch Demo" mode for new users
  - [ ] Create demo video or interactive walkthrough
  - [ ] Show sample book journey through all 8 steps
  - [ ] Add "Try It Yourself" CTA at the end


---

## Bug Fix: Profile Not Saving (Critical) ✅
- [x] Investigate why profile data is not persisting to database
- [x] Check profile save mutation in routers.ts
- [x] Check database schema for author_profiles table
- [x] Test profile update flow from Profile page
- [x] Fix profile saving bug - avatar URL was using temporary blob URL instead of S3
- [x] Add uploadProfilePhoto mutation to upload photos to S3
- [x] Update Profile.tsx to use proper S3 upload instead of placeholder
- [x] Convert cropped image to base64 and upload via tRPC
- [ ] Verify profile data loads correctly after save (needs testing)


---

## Profile UX Improvements
### Profile Completion Indicator ✅
- [x] Calculate profile completion percentage (5 fields: photo, pen name, bio, website, accomplishments)
- [x] Add progress bar at top of Profile page showing completion percentage
- [x] Add checklist showing which fields are complete/incomplete
- [x] Use visual indicators (checkmarks for complete, empty circles for incomplete)
- [x] Show encouraging message when profile is complete ("Your profile is ready!")
- [x] Add CTA to complete profile if incomplete ("Complete your profile to unlock Book Wrap")
- [x] Create ProfileCompletionIndicator component
- [x] Display completion percentage and progress bar
- [x] Mark required fields with asterisk (*)
- [x] Show different messages based on completion status

### Profile Preview in Navigation ✅
- [x] Add profile preview component to header/navigation
- [x] Display small avatar (32x32px) in sidebar footer
- [x] Display pen name next to avatar
- [x] Add dropdown menu on click (View Profile, Logout)
- [x] Show default avatar if no photo uploaded (initials fallback)
- [x] Make it responsive (hide pen name when sidebar collapsed)
- [x] Fetch author profile data with trpc query
- [x] Display author avatar image if available
- [x] Show pen name instead of user name when available
- [x] Add "View Profile" menu item to dropdown


---

## Email Notification System
### Welcome & Onboarding Emails
- [ ] Welcome email immediately after signup
  - [ ] Introduce Authors Bureau and 2-day program
  - [ ] Explain the two personas (write from scratch vs upload manuscript)
  - [ ] Set expectations for the journey ahead
  - [ ] Add "Complete Your Profile" CTA
- [ ] Day 1 follow-up if no activity ("Need help getting started?")
- [ ] Day 3 follow-up if profile incomplete ("Your author profile is waiting")

### Progress & Milestone Emails
- [ ] Profile completion emails
  - [ ] 50% completion - "You're halfway there!"
  - [ ] 75% completion - "Almost done with your profile!"
  - [ ] 100% completion - "🎉 Your profile is complete!"
- [ ] Manuscript upload confirmation ("We received your manuscript!")
- [ ] AI analysis complete ("Your book analysis is ready")
- [ ] Cover generation complete ("Your book covers are ready to view")
- [ ] Export package ready ("Your KDP files are ready to download")
- [ ] First book published celebration ("Congratulations on publishing!")

### Engagement & Re-engagement Emails
- [ ] Weekly progress summary (if book in progress)
- [ ] Abandoned workflow reminder (started but didn't finish Ready to Publish)
- [ ] 30-day inactive reminder ("We miss you! Come back and finish your book")
- [ ] New feature announcements
- [ ] Success stories and tips from other authors

### Email Infrastructure
- [ ] Set up email service integration (SendGrid, AWS SES, or Resend)
- [ ] Create email templates with Authors Bureau branding
- [ ] Design responsive HTML email templates
- [ ] Add email preferences to user settings (opt-in/opt-out per category)
- [ ] Track email delivery status and open rates
- [ ] Add unsubscribe link to all emails (legal requirement)
- [ ] Implement email queue system for batch sending
- [ ] Test email delivery in sandbox/production
- [ ] Add email preview in admin dashboard

---

## Profile Preview Modal
- [ ] Create ProfilePreviewModal component
- [ ] Add "Preview Profile" button on Profile page
- [ ] Simulate Amazon Author Central profile view
- [ ] Show how profile appears to readers
- [ ] Include avatar, pen name, bio, website, accomplishments
- [ ] Add "Looks good!" and "Edit Profile" CTAs
- [ ] Make it shareable (generate preview link)

---

## LinkedIn Import Feature
- [ ] Add "Import from LinkedIn" button on Profile page
- [ ] Prompt user to paste LinkedIn profile URL
- [ ] Use web scraping or LinkedIn API to extract data
- [ ] Parse and extract:
  - [ ] Profile photo
  - [ ] Headline (use as bio starter)
  - [ ] Summary/About section
  - [ ] Experience (map to accomplishments)
  - [ ] Education
- [ ] Show preview of imported data before applying
- [ ] Let user review and edit before saving
- [ ] Add "Import" and "Cancel" buttons
- [ ] Handle LinkedIn URL validation
- [ ] Handle private/restricted profiles gracefully


---

## Bug Fix: Incorrect Button Text in Step 3 ✅
- [x] Fix "Continue to Cover Design" button in Step 3 (Review) → should say "Continue to Profile Check"
- [x] Verify all step transition buttons match the correct workflow order:
  - [x] Step 1 (Upload) → Step 2 (Analyzing)
  - [x] Step 2 (Analyzing) → Step 3 (Review)
  - [x] Step 3 (Review) → Step 4 (Profile Check)
  - [x] Step 4 (Profile Check) → Step 5 (Cover Design)
  - [x] Step 5 (Cover) → Step 6 (Amazon KDP)
  - [x] Step 6 (Amazon) → Step 7 (Book Wrap)
  - [x] Step 7 (Wrap) → Step 8 (Export)p 7 (Book Wrap)
  - [ ] Step 7 (Wrap) → Step 8 (Export)


---

## CRITICAL BUG: Book Resume Not Loading Workflow Data ✅
- [x] When clicking on existing book from dashboard, workflow progress doesn't load
- [x] Manuscript, AI analysis, covers, and other data not restored
- [x] This causes 404 errors on Amazon/Wrap/Export steps (missing aiAnalysis)
- [x] Investigate handleResumeProgress logic
- [x] Check if existingBook data is being passed correctly
- [x] Verify all workflow state is restored from database
- [x] Auto-restore workflow data when existingBook loads (no resume prompt needed)
- [x] Restore AI analysis, titles, covers, and current step automatically
- [ ] Test clicking book from "My Books" dashboard (needs user testing)


---

## Book Wrap Designer Bugs
### Bio Text Not Editable ✅
- [x] Author bio text is read-only in Book Wrap Designer
- [x] Add "Edit Bio" button or make text directly editable
- [x] Allow inline editing without going back to Profile page
- [x] Save edited bio back to author profile
- [x] Added "Save Bio to Profile" button that appears when bio is edited
- [x] Real-time preview updates as bio is edited
- [x] Toast notifications for save success/failure

### Blank Preview Issue ✅
- [x] Book Wrap preview shows completely white/blank - FIXED
- [x] Uploaded cover image not showing in full wrap preview - FIXED
- [x] Added error handling and debugging for image loading
- [x] Added console logs to track image load success/failure
- [x] Added fallback placeholder if image fails to load
- [x] Test with actual uploaded cover to identify root cause
- [x] Fix preview to show front cover, spine, and back cover properly
- [x] Ensure uploaded custom covers work in preview (not just AI-generated)
- [x] Added cover upload option directly in Book Wrap Designer step
- [x] Removed selectedCover requirement from Book Wrap rendering condition
- [x] Book Wrap Designer now accessible even without cover from previous step


---

## Critical KDP Manuscript Requirements (User Priority)

### Manuscript Export Quality
- [ ] **Copyright Page** - Auto-generate and include in all exports
  - [ ] Title, author name, copyright year
  - [ ] Publisher information
  - [ ] ISBN (if provided)
  - [ ] All rights reserved statement
  - [ ] Disclaimer (genre-appropriate)
- [ ] **Table of Contents** - Auto-generate from chapter structure
  - [ ] Extract chapter titles from manuscript
  - [ ] Include page numbers (for PDF/print)
  - [ ] Hyperlinked TOC (for EPUB/eBook)
- [ ] **Front Matter Order** - Proper KDP structure
  - [ ] Title Page (book title, subtitle, author name)
  - [ ] Copyright Page
  - [ ] Table of Contents
  - [ ] Dedication (optional, if provided)
  - [ ] Foreword (optional, if provided)
  - [ ] Main Content (chapters)
- [ ] **Page Numbering** - Start after front matter
  - [ ] Roman numerals for front matter (i, ii, iii)
  - [ ] Arabic numerals for main content (1, 2, 3)
  - [ ] Page numbers in footer (centered or right-aligned)
- [ ] **Proper Page Size** - Support multiple trim sizes
  - [ ] 6"x9" (most popular, current default)
  - [ ] 5"x8" (compact)
  - [ ] 5.5"x8.5" (digest)
  - [ ] 8.5"x11" (large format)
- [ ] **Chapter Formatting** - Professional appearance
  - [ ] Chapter titles on new pages
  - [ ] Consistent heading styles
  - [ ] Page breaks between chapters
  - [ ] First paragraph no indent, subsequent paragraphs indented

### Paperback PDF Requirements
- [ ] Verify 6"x9" trim size is correctly applied
- [ ] Check margins (1" gutter/left, 0.75" other sides)
- [ ] Ensure fonts are embedded
- [ ] Verify 300 DPI resolution for images
- [ ] Test PDF opens correctly in Adobe Reader
- [ ] Confirm file size is under 650MB (KDP limit)

### eBook DOCX/EPUB Requirements
- [ ] Reflowable layout (no fixed page sizes)
- [ ] Hyperlinked Table of Contents
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] No page numbers (eBook readers add their own)
- [ ] Optimized for Kindle devices
- [ ] Test on Kindle Previewer tool
