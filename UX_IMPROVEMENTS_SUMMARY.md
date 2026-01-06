# Authors Bureau UX Audit Summary
## Persona 1: Author with Finished Manuscript

**Date:** January 5, 2026  
**Tester:** Walking through as first-time author with completed manuscript (Hemispheric Intelligence, 13,201 words)  
**Goal:** Publish book on Amazon KDP with all required materials

---

## Executive Summary

The Authors Bureau platform has **critical UX issues** that prevent smooth publishing workflow for authors with finished manuscripts. The platform is heavily optimized for "writing from scratch" but creates significant friction for the "ready to publish" use case.

**Severity Breakdown:**
- 🔴 **Critical Issues:** 3
- 🟡 **Major Issues:** 9  
- 🟢 **Minor Issues:** 5

---

## Critical Issues (Must Fix)

### 1. Manuscript Re-Upload Required 🔴
**Problem:** After uploading manuscript to book project, "Ready to Publish" workflow asks to upload again  
**Impact:** Wastes time, creates confusion, breaks trust  
**Fix:** Auto-detect existing manuscript and skip upload step

### 2. No Clear "I Have a Manuscript" Path 🔴
**Problem:** Homepage, onboarding, and all CTAs assume "book idea" → writing from scratch  
**Impact:** Authors with finished manuscripts don't know where to start  
**Fix:** Add prominent "Upload Existing Manuscript" CTA on homepage and dashboard

### 3. Workflow Progress Not Saved 🔴
**Problem:** All workflow state (covers, categories, keywords) stored in React state, lost on refresh  
**Impact:** Users must complete entire workflow in one sitting  
**Fix:** Save each step to database, allow resuming from any point

---

## Major Issues

### 4. Missing Amazon KDP Requirements 🟡
**Missing Features:**
- ISBN management and warnings
- Permanent metadata warnings (9 fields can't be changed!)
- Legal review checklist
- Format specifications (trim size, paper, dimensions)
- Complete metadata collection
- eBook vs Paperback guidance
- Editing completion verification
- Royalty-aware pricing guidance

**Fix:** Implement comprehensive Amazon KDP checklist based on official guidelines

### 5. Confusing "Quick Actions" for Uploaded Manuscripts 🟡
**Problem:** Book detail page shows "Continue Day 1" and "Continue Day 2" even for uploaded manuscripts  
**Impact:** Cognitive overload, irrelevant options  
**Fix:** Hide writing program actions when manuscript is uploaded directly

### 6. No Copyright Page Generator in Workflow 🟡
**Problem:** Copyright page creation not integrated into publishing workflow  
**Impact:** Users forget this required element  
**Fix:** Add copyright page step before export

### 7. No Back Cover Designer in Workflow 🟡
**Problem:** Back cover copy not part of publishing workflow  
**Impact:** Users miss this critical sales element  
**Fix:** Add back cover designer step with templates

### 8. Export Button Unclear Purpose 🟡
**Problem:** "Export" button on book page doesn't explain what it exports  
**Impact:** Users unsure if it's the full publishing package  
**Fix:** Rename to "Download Publishing Package" with tooltip

### 9. Word Count Target Misleading 🟡
**Problem:** Shows "13,201 / 50,000 words" making complete book look incomplete  
**Impact:** Users feel their book isn't "done"  
**Fix:** Allow custom targets or hide for uploaded manuscripts

### 10. Amazon Navigation Goes to 404 🟡
**Problem:** Amazon link in sidebar shows "Page Not Found"  
**Impact:** Broken user experience  
**Fix:** ✅ FIXED - Added "Coming Soon" page

### 11. Book Content Display Was Ugly 🟡
**Problem:** Raw manuscript text dump with broken formatting  
**Impact:** Unprofessional appearance  
**Fix:** ✅ FIXED - Replaced with clean manuscript card

### 12. Continue Writing Button Not Working 🟡
**Problem:** Button had no onClick handler  
**Impact:** Dead-end navigation  
**Fix:** ✅ FIXED - Added navigation to Writing Studio

---

## Minor Issues

### 13. No "My Books" Link on Homepage 🟢
**Problem:** Logged-in users see same homepage as visitors  
**Impact:** Extra clicks to reach books  
**Fix:** Add "Go to My Books" button for logged-in users

### 14. Genre Shows as Badge Instead of Text 🟢
**Problem:** "Non-Fiction" displayed in small green badge  
**Impact:** Hard to read  
**Fix:** Use regular text with icon

### 15. No Book Cover Preview on Book Card 🟢
**Problem:** Book card shows generic icon instead of cover  
**Impact:** Less engaging, harder to identify books  
**Fix:** Show cover thumbnail when available

### 16. Target Word Count Not Customizable 🟢
**Problem:** Hardcoded to 50,000 words  
**Impact:** Doesn't fit all book types  
**Fix:** Allow users to set custom target

### 17. Status "Drafting" Misleading for Uploaded Books 🟢
**Problem:** Uploaded complete manuscript shows as "Drafting"  
**Impact:** Suggests book isn't finished  
**Fix:** Auto-detect upload and set status to "Ready to Publish"

---

## Recommended Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. Fix manuscript re-upload issue - detect existing manuscript
2. Add "Upload Existing Manuscript" path on homepage
3. Implement workflow progress persistence to database

### Phase 2: Amazon KDP Compliance (Week 2)
4. Add ISBN management and warnings
5. Implement permanent metadata warnings
6. Add format specifications selector
7. Create complete metadata collection form

### Phase 3: Publishing Workflow (Week 3)
8. Integrate copyright page generator
9. Integrate back cover designer
10. Add legal review checklist
11. Implement royalty-aware pricing calculator

### Phase 4: Polish & Optimization (Week 4)
12. Improve Quick Actions relevance
13. Add book cover previews
14. Customize word count targets
15. Improve status detection
16. Add "My Books" shortcut for logged-in users

---

## Success Metrics

**Before Fixes:**
- Time to publish: Unknown (workflow incomplete)
- User confusion points: 12+
- Workflow completion rate: Low (progress not saved)

**After Fixes (Target):**
- Time to publish: < 15 minutes for manuscript with cover
- User confusion points: < 3
- Workflow completion rate: > 80%
- Amazon KDP compliance: 100%

---

## Conclusion

The Authors Bureau platform has strong potential but needs significant UX improvements for the "ready to publish" use case. The biggest issue is assuming all users want to write from scratch, when many have finished manuscripts ready for optimization and publishing.

By implementing these fixes in priority order, the platform can become a true end-to-end publishing solution that serves both "writing" and "publishing" personas effectively.
