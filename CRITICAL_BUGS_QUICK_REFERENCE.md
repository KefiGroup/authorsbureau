# Critical Bugs - Quick Reference

**Date:** January 21, 2026  
**Priority:** MUST FIX BEFORE LAUNCH

---

## 🔴 Bug #1: Keywords/Categories Data Flow Broken
**File:** `server/routers.ts` (likely in Amazon KDP optimization mutation)  
**Issue:** Step 7 generates keywords and categories, but Step 8 shows "You have 0 keywords" and "You have 0 categories"

**Debug Steps:**
1. Check database schema: Does Book table have `keywords` and `categories` fields?
2. Check Step 7 mutation: Does it save keywords/categories to database?
3. Check Step 8 query: Does it fetch keywords/categories from database?
4. Add console.log to track data flow

**Expected Fix Location:**
```typescript
// In server/routers.ts - Amazon KDP optimization mutation
updateAmazonKdpData: protectedProcedure
  .input(z.object({ 
    bookId: z.number(), 
    keywords: z.array(z.string()),  // ← Ensure this saves
    categories: z.array(z.string()) // ← Ensure this saves
  }))
  .mutation(async ({ input, ctx }) => {
    // Save keywords and categories to database
    await db.updateBook(input.bookId, {
      keywords: input.keywords,
      categories: input.categories
    });
  })
```

---

## 🔴 Bug #2: Missing Edit Buttons on AI Content
**Files:** 
- `client/src/pages/Marketing.tsx` (Email tab)
- `client/src/pages/Marketing.tsx` (Social Media tab)

**Issue:** User requirements state "ALL AI-generated content must have BOTH edit and copy buttons." Currently only has copy buttons.

**Expected Fix:**
1. Add edit button next to copy button
2. Add state management for edit mode
3. Make textarea editable when in edit mode
4. Add save/cancel buttons when editing
5. Add tRPC mutation to save edited content

**Reference Implementation:** See `client/src/pages/BookWrap.tsx` for working inline editing pattern

**Code Pattern:**
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editedContent, setEditedContent] = useState(aiGeneratedContent);

// Edit button
<Button onClick={() => setIsEditing(true)}>Edit</Button>

// Save button (shown when editing)
{isEditing && (
  <>
    <Button onClick={handleSave}>Save</Button>
    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
  </>
)}

// Textarea
<textarea 
  value={isEditing ? editedContent : aiGeneratedContent}
  onChange={(e) => setEditedContent(e.target.value)}
  readOnly={!isEditing}
/>
```

---

## 🔴 Bug #3: Profile Data Not Persisting
**File:** `server/routers.ts` (profile mutation)  
**Issue:** Profile fields and photo upload don't save to database

**Debug Steps:**
1. Check browser console for error messages (logging already added per context)
2. Check database schema: Does User table have all required profile fields?
3. Check profile mutation: Does it properly save to database?
4. Check photo upload: Does it upload to S3 and save URL to database?

**Expected Fix Location:**
```typescript
// In server/routers.ts - profile mutation
updateProfile: protectedProcedure
  .input(z.object({
    bio: z.string().optional(),
    website: z.string().optional(),
    photoUrl: z.string().optional(),
    // ... other fields
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('Updating profile for user:', ctx.user.id, 'with data:', input);
    
    const result = await db.updateUser(ctx.user.id, input);
    
    console.log('Profile update result:', result);
    
    if (!result) {
      throw new TRPCError({ 
        code: 'INTERNAL_SERVER_ERROR', 
        message: 'Failed to save profile' 
      });
    }
    
    return result;
  })
```

---

## 🟡 High Priority Issues

### Issue #1: Workflow Step Indicator Wrong
**File:** `client/src/pages/ReadyToPublish.tsx`  
**Issue:** Shows "Cover" highlighted when on "Export" step

**Fix:** Update step indicator logic to match current step

---

### Issue #2: Duplicate Book Entries
**File:** `server/routers.ts` (book creation mutation)  
**Issue:** Same book appears twice in My Books

**Fix:** 
1. Check database for duplicate entries
2. Fix "Start Fresh" function to properly clear/update existing book instead of creating new one
3. Add unique constraint on book title + user ID

---

### Issue #3: Pre-Publishing Checklist Not Saving
**File:** `client/src/pages/ReadyToPublish.tsx`  
**Issue:** Checkboxes don't persist when user navigates away

**Fix:**
1. Add tRPC mutation to save checkbox states
2. Add query to fetch checkbox states on page load
3. Update checkbox onChange handlers to call mutation

---

## Testing Checklist

After fixing bugs, test these user flows:

- [ ] Complete Step 7 (Amazon KDP Optimization) and verify keywords/categories appear in Step 8
- [ ] Click edit button on email campaign content, modify text, save, and verify it persists
- [ ] Fill out profile form, upload photo, save, navigate away, return, and verify data persists
- [ ] Complete workflow and verify step indicator shows correct current step
- [ ] Create book, click "Start Fresh", verify no duplicate entries
- [ ] Check pre-publishing checklist boxes, navigate away, return, verify checkboxes still checked

---

## Quick Test Commands

```bash
# Check database schema
sqlite3 /path/to/database.db ".schema books"
sqlite3 /path/to/database.db ".schema users"

# Check for duplicate books
sqlite3 /path/to/database.db "SELECT title, COUNT(*) FROM books GROUP BY title HAVING COUNT(*) > 1"

# View recent books
sqlite3 /path/to/database.db "SELECT id, title, keywords, categories FROM books ORDER BY created_at DESC LIMIT 5"

# View user profile
sqlite3 /path/to/database.db "SELECT * FROM users WHERE id = [USER_ID]"
```

---

## Browser Console Checks

Open browser console (F12) and look for:
- Red error messages during profile save
- Network tab: Check if mutations return 200 or error codes
- Console logs: Check for "Updating profile" and "Profile update result" logs

---

## Next Steps

1. **Immediate:** Fix Bug #1 (keywords/categories) - blocks publishing workflow
2. **Immediate:** Fix Bug #2 (edit buttons) - violates user requirements
3. **Immediate:** Fix Bug #3 (profile persistence) - blocks Book Wrap step
4. **Today:** Fix workflow step indicator
5. **Today:** Remove duplicate book entries
6. **Tomorrow:** Fix pre-publishing checklist persistence
7. **This Week:** Add validation and error handling across platform

---

**Remember:** Always test in browser after each fix to verify it works end-to-end!
