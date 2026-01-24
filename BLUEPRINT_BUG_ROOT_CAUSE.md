# Blueprint Generation Bug - Root Cause Analysis

**Date:** January 24, 2026  
**Issue:** Blueprint shows wrong author name ("Kefi Group") and wrong page count (280 pages instead of 150)

---

## Root Cause #1: Author Name Issue

### Problem
Blueprint shows "Author Name: Kefi Group" instead of the user's pen name from their profile.

### Code Location
`/home/ubuntu/authors-bureau-v2/server/routers.ts` line 663:

```typescript
const blueprintMarkdown = await generateBlueprintContent(blueprint, ctx.user.name || undefined);
```

### Root Cause
The code is passing `ctx.user.name` (which is "Kefi Group" from the OAuth/user table) instead of fetching the author's `penName` from the `authors` table.

### Correct Pattern (from other parts of codebase)
Line 1599 shows the correct pattern:
```typescript
const authorProfile = await db.select().from(authors)
  .where(eq(authors.userId, ctx.user.id))
  .limit(1);

const author = authorProfile[0];
const authorName = author?.penName || ctx.user.name || "[Author Name]";
```

### Fix Required
Replace line 663 with:
1. Fetch author profile from `authors` table
2. Use `author.penName` as first priority
3. Fall back to `ctx.user.name` only if pen name doesn't exist

---

## Root Cause #2: Page Count Issue

### Problem
Blueprint shows "75,000 words (for 280 pages)" when user selected 150 pages.

### Investigation Results
Database query shows:
```
ID: 570004, Title: Value Investing for Beginners, Pages: null, Chapters: null
```

The `targetPages` field is `null` in the database, which means the page selection wasn't saved properly.

### Possible Causes
1. **User didn't complete the final checkpoint modal** - Closed modal before clicking "Complete Blueprint"
2. **Frontend bug** - The modal submission didn't save `targetPages` to database
3. **Caching issue** - Old blueprint data is being displayed

### Where Page Selection Should Be Saved
`/home/ubuntu/authors-bureau-v2/client/src/pages/StartWritingProcess.tsx` - The `handleFinalCheckpointComplete` function should save `targetPages` to the database.

### Fix Required
1. Verify the final checkpoint modal properly saves `targetPages` to database
2. Add validation to ensure `targetPages` is not null before blueprint generation
3. If `targetPages` is null, show error message asking user to complete the page selection step

---

## Additional Issue: Caching

The user mentioned "Is it cache?" which suggests they may have:
1. Generated a blueprint before the fix
2. The old blueprint content is cached in the database (`blueprintContent` field)
3. Even though we updated `targetPages=150` in the database, the blueprint content wasn't regenerated

### Solution
Need to regenerate the blueprint content after fixing the author name issue, so it picks up:
1. Correct author pen name
2. Correct target pages (150)
3. Correct word count calculation

---

## Action Plan

1. ✅ Fix author name: Fetch pen name from authors table
2. ✅ Regenerate blueprint for existing book (ID 570004) with correct data
3. ✅ Test with user's account to verify fixes
4. ⏸️ Investigate why targetPages wasn't saved (may be user error, not code bug)
