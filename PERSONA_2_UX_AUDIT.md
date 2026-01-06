# Persona 2 (Upload Existing Manuscript) UX Audit

**Goal:** Ensure smooth flow from manuscript upload to Amazon KDP-ready export.

## Current Workflow: 8 Steps
1. Upload Manuscript → 2. AI Analysis → 3. Review Titles → 4. Cover Design → 5. Book Wrap → 6. Amazon KDP → 7. Pre-Publishing Checklist → 8. Export

## Critical UX Gaps (High Priority)

### 1. Step Numbering Mismatch
- **Issue:** Header says "7-Step Process" but actually 8 steps
- **Fix:** Update to "8-Step Process"

### 2. Missing Author Profile Prompt
- **Issue:** Book Wrap (Step 5) needs photo+bio but no earlier prompt
- **Impact:** Workflow interruption, users must backtrack
- **Fix:** Prompt profile creation in Step 1 or 2

### 3. No Post-Export KDP Instructions
- **Issue:** After download, users don't know how to upload to KDP
- **Fix:** Add modal with step-by-step KDP upload guide

### 4. Step 4 Label Wrong
- **Issue:** Shows "(In Progress)" but it's complete
- **Fix:** Change to "✅"

## Medium Priority Improvements

### 5. No Visual Progress Persistence
- **Fix:** Add checkmarks to completed steps

### 6. Cover Generation Wait Time
- **Fix:** Show "Did You Know?" KDP tips during loading

### 7. Interior Preview Not Discoverable
- **Fix:** Add tooltip: "👀 Preview how your book will look!"

### 8. Export Contents Not Previewed
- **Fix:** Show file list before download

## Low Priority Polish

### 9. No Time Estimate
- **Fix:** Show "~15 min remaining"

### 10. No Back Button
- **Fix:** Add "← Back to [Step]" button

### 11. No Completion Celebration
- **Fix:** Add "🎉 Ready for Amazon KDP!" success message

## Implementation Plan

**Phase 1: Critical Fixes**
- Fix step numbering
- Add author profile prompt early
- Add post-export KDP instructions
- Fix Step 4 label

**Phase 2: Flow Improvements**
- Progress checkmarks
- Loading tips
- Preview discoverability
- Export preview

**Phase 3: Polish**
- Time estimates
- Back buttons
- Celebration moment
