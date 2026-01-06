# Phase 4: Book Design Service - KDP-Aligned Implementation Plan

## Amazon KDP Publishing Requirements (Critical Context)

Based on Amazon KDP documentation, authors need:

### For eBook Publishing:
1. **eBook Cover File** - Minimum 1600x2560px (ideal), 625x1000px (minimum), 1.6:1 aspect ratio
2. **eBook Interior File** - EPUB format (safest), or DOCX/PDF
3. **Metadata** - Title, subtitle, description, keywords, categories, pricing

### For Paperback Publishing:
1. **Paperback Cover File** - Single PDF with back + spine + front + bleed (0.125" all sides)
2. **Paperback Interior File** - DOCX or PDF with proper margins, trim size, formatting
3. **Trim Size Selection** - Most popular: 6"x9", also 5"x8", 5.5"x8.5", 7"x10", 8.5"x11"
4. **Paper Type** - White or cream (affects spine width calculation)
5. **ISBN** - Required for paperback (free from Amazon or purchase from Bowker)

### Critical Permanent Decisions (Cannot Change After Publishing):
- Title, Subtitle, ISBN, Publisher Name, Author Name, Language
- Edition Number, Print Book Dimensions, Paper Type

## Current Platform Status

### ✅ Already Implemented:
- [x] AI-powered eBook cover generation (3 variations)
- [x] Custom cover upload option
- [x] Book Wrap Designer for paperback (front + spine + back)
- [x] Back cover layout system with presets and customization
- [x] Author photo cropping and upload
- [x] Live back cover preview
- [x] eBook DOCX export (KDP-ready formatting)
- [x] Paperback PDF export (6"x9" trim size, proper margins)
- [x] Copyright page generation
- [x] ISBN collection and guidance
- [x] Amazon metadata optimization (categories, keywords, description, pricing)

### 🔧 Needs Enhancement:
1. **Cover Design System** - Add more customization options
2. **Interior Formatting** - Add more trim sizes and formatting options
3. **Export System** - Add EPUB/MOBI generation for eBook
4. **Preview System** - Add interior preview before export
5. **Print-Ready Files** - Enhance PDF with bleed and trim marks

## Phase 4 Implementation Plan (KDP-Aligned)

### Priority 1: Cover Design Enhancements (Critical for KDP)

#### 1.1 Custom Cover Upload Improvements
**Current:** Basic file input with preview
**Needed:**
- Dimension validation (min 1600x2560px for eBook, calculated dimensions for paperback)
- Aspect ratio checking (1.6:1 for eBook)
- Resolution validation (300 DPI for print)
- File size optimization
- Format conversion (ensure RGB for eBook, CMYK for print)

#### 1.2 AI Cover Customization Tools
**Current:** AI generates 3 covers, users can select
**Needed:**
- Font selection (title, author name, subtitle)
- Color palette customization
- Layout templates (minimalist, bold, artistic, genre-specific)
- Text positioning controls
- Image filters and effects
- Background customization

#### 1.3 Cover Templates Gallery
**Needed:**
- Genre-specific templates (fiction, non-fiction, business, self-help, romance, thriller, etc.)
- Pre-designed layouts users can customize
- Professional design elements library
- Stock image integration
- Icon and graphic elements

### Priority 2: Interior Formatting (Critical for KDP)

#### 2.1 Manuscript Formatting Options
**Current:** Fixed Times New Roman 12pt, 1.5 spacing, 1" margins
**Needed:**
- Multiple trim size support (5"x8", 5.5"x8.5", 6"x9", 7"x10", 8.5"x11")
- Font selection (Times New Roman, Garamond, Baskerville, etc.)
- Font size options (10pt, 11pt, 12pt)
- Line spacing options (1.0, 1.15, 1.5, double)
- Margin presets for different trim sizes
- Chapter heading styles
- Page number positioning options
- Header/footer customization

#### 2.2 Interior Preview System
**Needed:**
- Visual preview of formatted pages (first 5 pages + sample chapter)
- Page-by-page navigation
- Zoom controls
- Preview for both eBook and paperback formats
- Before/after comparison
- Mobile preview for eBook

### Priority 3: Multi-Format Export (Critical for KDP)

#### 3.1 EPUB Generation (eBook Standard)
**Needed:**
- Convert manuscript to EPUB 3.0 format
- Embed cover image
- Generate table of contents
- Proper chapter navigation
- Metadata embedding
- Validation against EPUB standards
- Kindle compatibility testing

#### 3.2 MOBI Generation (Kindle Legacy)
**Needed:**
- Convert EPUB to MOBI format (for older Kindle devices)
- Amazon KDP compatibility
- Metadata preservation

#### 3.3 Enhanced PDF Export
**Current:** Basic PDF with text
**Needed:**
- Print-ready PDF with bleed and trim marks
- Embedded fonts
- CMYK color mode for print
- High-resolution images (300 DPI)
- Crop marks and registration marks
- PDF/X-1a compliance for professional printing

### Priority 4: Complete Export Package

#### 4.1 KDP-Ready Bundle
**Current:** ZIP with DOCX, PDF, covers, metadata
**Needed Enhancement:**
- EPUB file for eBook
- MOBI file for Kindle
- eBook cover (1600x2560px PNG/JPG)
- Paperback cover (PDF with bleed)
- Interior files (EPUB for eBook, PDF for paperback)
- Copyright page (formatted)
- Metadata file (JSON with all KDP fields)
- KDP Upload Guide (step-by-step instructions)
- Checklist (pre-flight verification)

## Implementation Priority Order

### Phase 4A: Critical KDP Requirements (Week 1)
1. ✅ Custom cover upload with validation
2. ✅ Book wrap designer for paperback
3. ⏳ EPUB generation for eBook
4. ⏳ Interior preview system
5. ⏳ Multiple trim size support

### Phase 4B: Enhanced Customization (Week 2)
6. ⏳ Cover customization tools (fonts, colors, layouts)
7. ⏳ Manuscript formatting options
8. ⏳ Cover templates gallery
9. ⏳ Design elements library

### Phase 4C: Professional Features (Week 3)
10. ⏳ MOBI generation
11. ⏳ Print-ready PDF with bleed/trim marks
12. ⏳ Advanced interior formatting
13. ⏳ Complete export package

## Success Criteria

✅ **Authors can publish to Amazon KDP with zero additional tools**
✅ **All files meet Amazon KDP technical specifications**
✅ **Both eBook and paperback formats supported**
✅ **Professional-quality covers and interiors**
✅ **Complete metadata optimization**
✅ **5-10 minute upload time to KDP**

## Technical Implementation Notes

### Libraries Needed:
- `epub-gen-memory` or `epub-gen` - EPUB generation
- `kindle-gen` or `calibre` CLI - MOBI conversion
- `pdfkit` or `puppeteer` - Enhanced PDF generation
- `sharp` - Image processing and validation
- `canvas` - Cover design rendering

### Database Schema Updates:
- Add `trimSize` field to books table
- Add `paperType` field (white/cream)
- Add `interiorFormatting` JSON field (font, size, spacing, margins)
- Add `coverCustomization` JSON field (fonts, colors, layout)

### API Endpoints:
- `POST /api/export/epub` - Generate EPUB file
- `POST /api/export/mobi` - Generate MOBI file
- `POST /api/export/print-ready-pdf` - Generate print PDF with bleed
- `POST /api/preview/interior` - Generate interior preview images
- `POST /api/validate/cover` - Validate cover dimensions/resolution

## Next Steps

1. ✅ Update todo.md with KDP-aligned Phase 4 tasks
2. ⏳ Implement EPUB generation (Priority 1)
3. ⏳ Add interior preview system (Priority 2)
4. ⏳ Implement cover customization tools (Priority 3)
5. ⏳ Add multiple trim size support (Priority 4)
6. ⏳ Test complete workflow with real KDP upload
