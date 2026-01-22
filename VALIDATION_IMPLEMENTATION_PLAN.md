# Form Validation Implementation Plan

## Overview
Implement comprehensive client-side and server-side validation across all Authors Bureau forms to improve data quality, prevent errors, and enhance user experience.

## Priority Areas

### 1. Ready to Publish Workflow (HIGH PRIORITY)

#### Step 1: Upload Manuscript
**Client-side Validation:**
- File format: .txt, .doc, .docx only
- File size: Maximum 10MB
- Content: Not empty after upload
- Word count: Minimum 5,000 words (typical book minimum)

**User Feedback:**
- Show file size before upload
- Display error message for invalid format
- Show warning if word count < 5,000
- Disable "Continue" button until valid file uploaded

#### Step 2: AI Analysis
**No validation needed** - Automatic step

#### Step 3: Review & Edit Titles
**Client-side Validation:**
- Title: Required, 1-150 characters (Amazon KDP limit)
- Subtitle: Optional, max 200 characters
- Real-time character count display
- Warning if title too short (< 10 chars) or too long

**User Feedback:**
- Character counter turns red when over limit
- Disable "Continue" until title provided
- Show helpful tooltip with Amazon KDP guidelines

#### Step 4: Profile Check
**Validation:**
- Check if profile has required fields (pen name, bio, photo)
- Show completion percentage
- Allow skip with warning dialog

#### Step 5: Cover Design
**Validation:**
- At least one cover generated OR custom cover uploaded
- Cover image minimum resolution: 1600x2560px (Amazon KDP minimum)
- File size: Max 50MB
- Format: JPG, PNG only

**User Feedback:**
- Show image dimensions after upload
- Warning if resolution too low
- Disable "Continue" until cover selected

#### Step 6: Book Wrap (Optional)
**Validation:**
- If uploaded: Check dimensions match KDP template
- File size: Max 50MB
- Format: PDF, PNG, JPG

#### Step 7: Amazon KDP Optimization
**Validation:**
- Categories: 1-3 selected (Amazon requirement)
- Keywords: 7 maximum (Amazon limit)
- Each keyword: Max 50 characters

**User Feedback:**
- Disable category selection after 3 chosen
- Show count: "2/3 categories selected"
- Show count: "5/7 keywords"
- Warning if no categories/keywords selected

#### Step 8: Export & Download
**No validation needed** - Final step

---

### 2. Profile Page (HIGH PRIORITY)

**Required Fields:**
- Pen Name: Required, 2-100 characters
- Bio: Required, 50-2000 characters (Amazon Author Central limit)
- Profile Photo: Required, min 300x300px (Amazon requirement)

**Optional Fields:**
- LinkedIn URL: Valid URL format if provided
- Books Authored: Max 500 characters
- Accomplishments: Max 1000 characters
- Education: Max 500 characters

**Validation Rules:**
- Bio character counter: Show "450 / 2000" in real-time
- Photo: Check dimensions before upload
- URLs: Validate format (https://...)

**User Feedback:**
- Show required field indicators (red asterisk)
- Disable "Save Profile" until required fields filled
- Show success toast after save
- Show error toast with specific field errors

---

### 3. Marketing Campaign Builder (MEDIUM PRIORITY)

**Validation:**
- Book selection: Required before generating content
- Campaign type: Required (Book Launch, Promotion, Re-launch)
- Email type: Required before generating email

**User Feedback:**
- Disable "Generate" buttons until book selected
- Show tooltip: "Please select a book first"

---

### 4. AI Writing Studio (LOWER PRIORITY)

**Validation:**
- Book title: Required
- Chapter title: Required when creating chapter
- Content: Warn if chapter < 500 words (unusually short)

---

## Implementation Strategy

### Phase 1: Critical Validations (This Session)
1. ✅ Upload Manuscript: File format and size
2. ✅ Title/Subtitle: Character limits
3. ✅ Profile: Required fields
4. ✅ Amazon KDP: Category and keyword limits

### Phase 2: Enhanced Validations (Next Session)
1. Cover image resolution check
2. Book wrap dimensions check
3. URL format validation
4. Word count minimums

### Phase 3: Server-side Validation (Future)
1. Add Zod schemas to all tRPC mutations
2. Return specific error messages
3. Handle validation errors gracefully in UI

---

## Technical Implementation

### Client-side Validation Pattern

```typescript
// Validation state
const [errors, setErrors] = useState<Record<string, string>>({});

// Validation function
const validateField = (field: string, value: any) => {
  const newErrors = { ...errors };
  
  switch (field) {
    case 'title':
      if (!value || value.trim().length === 0) {
        newErrors.title = 'Title is required';
      } else if (value.length > 150) {
        newErrors.title = 'Title must be 150 characters or less';
      } else {
        delete newErrors.title;
      }
      break;
    // ... more cases
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Form submission
const handleSubmit = () => {
  if (!validateForm()) {
    toast.error('Please fix validation errors');
    return;
  }
  // Proceed with submission
};
```

### Error Display Pattern

```typescript
{errors.title && (
  <p className="text-sm text-red-500 mt-1">
    {errors.title}
  </p>
)}

<Input
  className={errors.title ? 'border-red-500' : ''}
  // ...
/>
```

### Character Counter Pattern

```typescript
<div className="flex justify-between items-center">
  <label>Title</label>
  <span className={`text-sm ${title.length > 150 ? 'text-red-500' : 'text-gray-500'}`}>
    {title.length} / 150
  </span>
</div>
```

---

## Testing Checklist

After implementation, test:
- [ ] Try to submit empty forms (should show errors)
- [ ] Try to exceed character limits (should prevent/warn)
- [ ] Upload invalid file formats (should reject)
- [ ] Upload oversized files (should reject)
- [ ] Fill forms correctly (should succeed)
- [ ] Check error messages are helpful and specific
- [ ] Verify validation doesn't block legitimate use cases

---

## Success Criteria

✅ Users cannot submit invalid data  
✅ Error messages are clear and actionable  
✅ Validation happens in real-time (not just on submit)  
✅ Valid data passes through without friction  
✅ Form state persists across navigation  
✅ Validation rules match Amazon KDP requirements
