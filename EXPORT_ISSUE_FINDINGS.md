# Export Issue Findings - January 25, 2026

## Problem
User reports export still shows "old format" with markdown symbols (**, ##) even after implementing stripMarkdown() function.

## Findings from Latest Export (1769304419390.docx)

### Page 2: Author Name
- Shows "Kefi Group" (incorrect - should be "Pauline Teo")

### Page 3: Copyright Page
- Shows "**ISBN: [Your ISBN Here]**" with asterisks
- Shows "**Disclaimer:**" with asterisks
- Markdown formatting is NOT being stripped

### Page 4-5: Table of Contents
- Clean formatting (no markdown issues here)

## Root Cause Analysis

The stripMarkdown() function I added is NOT being used because:

1. **Wrong export path**: The user is exporting from AI Writing Studio, which uses a DIFFERENT export function
2. **Multiple export functions exist**: 
   - `generateManuscriptFile` in routers.ts (used by Writing Studio)
   - `generateDOCX` in manuscript-export.ts (used by Publishing Studio)
3. **I only fixed one path**: I added stripMarkdown() to `generateDOCX` but the user is using `generateManuscriptFile`

## Solution Required

Need to trace where `generateManuscriptFile` calls `generateDOCX` and ensure the markdown stripping is applied there too, OR the copyright page generation itself is adding the asterisks.

Actually, looking at page 3, the copyright page itself has the asterisks. This means the copyright page generation code is ADDING the asterisks, not that they're coming from chapter content.

The issue is in the COPYRIGHT PAGE generation, not the chapter content!
