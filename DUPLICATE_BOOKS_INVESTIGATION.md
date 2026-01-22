# Duplicate Books Investigation

## Query Results

**User:** paulinet77@gmail.com (Robert J Battista)

**Query Executed:**
```sql
SELECT 
  b.id as book_id,
  b.title,
  b.authorId,
  b.createdAt,
  b.updatedAt,
  b.workflowStep
FROM books b
JOIN authors a ON b.authorId = a.id
JOIN users u ON a.userId = u.id
WHERE u.email = 'paulinet77@gmail.com'
ORDER BY b.title, b.createdAt;
```

**Result:** 2 rows returned

The webdev_execute_sql tool confirmed 2 book entries exist but didn't display the actual data. Based on the Marketing Campaign Builder dropdown showing two "Be SUCKcessful" entries, we can infer:

- Book 1: "Be SUCKcessful" (older entry)
- Book 2: "Be SUCKcessful" (newer entry - likely created by "Start Fresh")

## Root Cause Analysis

### Hypothesis
The "Start Fresh" function in ReadyToPublish.tsx is creating a NEW book entry instead of resetting the existing book's data.

### Evidence
1. Marketing dropdown shows 2 identical "Be SUCKcessful" titles
2. Database query confirms 2 book entries for test user
3. User workflow: Upload book → Make progress → Click "Start Fresh" → New book created

### Expected Behavior
"Start Fresh" should:
1. Reset all workflow data (manuscript, covers, categories, keywords)
2. Reset workflowStep to "upload"
3. **REUSE the same bookId** (not create new entry)

### Actual Behavior
"Start Fresh" appears to:
1. Create a completely new book entry
2. Leave old book entry in database
3. Result: Duplicate books with same title

## Solution

### Option 1: Delete Old Book on "Start Fresh" (Recommended)
When user clicks "Start Fresh", delete the current book and create a brand new one.

**Pros:**
- Clean slate for user
- No orphaned data
- Matches user expectation of "fresh start"

**Cons:**
- Loses all previous work (but that's the point of "Start Fresh")

### Option 2: Reset Existing Book Data
When user clicks "Start Fresh", reset all fields of the existing book to null/default values.

**Pros:**
- Preserves book ID
- No duplicate entries

**Cons:**
- More complex logic to reset all fields
- May leave orphaned related data (chapters, covers, etc.)

### Recommended Implementation: Option 1

**File:** `client/src/pages/ReadyToPublish.tsx`

**Current Code (lines ~240-260):**
```typescript
const handleStartFresh = () => {
  setBookId(null); // This clears bookId but doesn't delete the book
  // Reset all state...
  setShowResumeDialog(false);
  setStartingFresh(true);
};
```

**Fix:**
```typescript
const deleteBook = trpc.book.deleteBook.useMutation();

const handleStartFresh = async () => {
  if (bookId) {
    // Delete the existing book from database
    await deleteBook.mutateAsync({ bookId });
  }
  
  // Reset all state
  setBookId(null);
  setManuscript("");
  setSelectedTitle("");
  // ... reset all other state
  
  setShowResumeDialog(false);
  setStartingFresh(true);
};
```

## Additional Fix: Add Unique Constraint

To prevent future duplicates, add a unique constraint on (title, authorId):

**File:** `drizzle/schema.ts`

```typescript
export const books = mysqlTable("books", {
  // ... existing fields
}, (table) => ({
  // Add unique constraint
  uniqueTitlePerAuthor: unique().on(table.title, table.authorId),
}));
```

Then run migration:
```bash
pnpm db:push
```

## Cleanup: Remove Existing Duplicate

After implementing the fix, remove the duplicate entry:

```sql
-- Keep the newer entry (higher ID), delete the older one
DELETE FROM books 
WHERE id = (
  SELECT MIN(id) 
  FROM (
    SELECT id, title, authorId 
    FROM books 
    WHERE title = 'Be SUCKcessful'
  ) as subquery
);
```

## Testing Plan

1. ✅ Query database to confirm 2 entries exist
2. [ ] Implement deleteBook mutation if not exists
3. [ ] Update handleStartFresh to delete book before reset
4. [ ] Test "Start Fresh" workflow:
   - Upload manuscript
   - Make some progress
   - Click "Start Fresh"
   - Verify old book is deleted
   - Verify new book is created
   - Verify no duplicates in dropdown
5. [ ] Add unique constraint to schema
6. [ ] Run migration
7. [ ] Remove existing duplicate from database
8. [ ] Test creating multiple books with different titles (should work)
9. [ ] Test creating book with same title (should fail with constraint error)
