# Page-to-Chapter Calculation System

## Core Formula

```
Total Words = Pages × 250 words/page (6"×9" format, Georgia 12pt, 1.5 spacing)
Front/Back Matter = 2,500 words (Prologue, Copyright, Dedication, Acknowledgements, Author Bio, Newsletter)
Chapter Content Words = Total Words - Front/Back Matter
Words Per Chapter = Chapter Content Words ÷ Number of Chapters
```

## Optimal Chapter Count by Page Range

### 150 Pages
- **Total Words**: 37,500
- **Chapter Content**: 35,000 words
- **Optimal Chapters**: 10
- **Words/Chapter**: 3,500
- **Pages/Chapter**: 14 pages

### 200 Pages
- **Total Words**: 50,000
- **Chapter Content**: 47,500 words
- **Optimal Chapters**: 13
- **Words/Chapter**: 3,654
- **Pages/Chapter**: 14.6 pages

### 250 Pages
- **Total Words**: 62,500
- **Chapter Content**: 60,000 words
- **Optimal Chapters**: 16
- **Words/Chapter**: 3,750
- **Pages/Chapter**: 15 pages

### 300 Pages
- **Total Words**: 75,000
- **Chapter Content**: 72,500 words
- **Optimal Chapters**: 20
- **Words/Chapter**: 3,625
- **Pages/Chapter**: 14.5 pages

## Chapter Length Guidelines

**Ideal Range**: 3,000-4,000 words per chapter (12-16 pages)

- **< 2,000 words**: Too short, feels choppy
- **2,000-3,000 words**: Short chapters, fast-paced
- **3,000-4,000 words**: Optimal for non-fiction
- **4,000-5,000 words**: Long chapters, detailed
- **> 5,000 words**: Too long, reader fatigue

## Implementation

The system automatically calculates:
1. User selects target pages (150, 200, 250, 300, >300)
2. System calculates total words: `pages × 250`
3. System determines optimal chapter count based on table above
4. System calculates words per chapter: `(total - 2500) ÷ chapters`
5. AI generates chapters targeting the calculated word count

## Code Implementation

```typescript
function calculateOptimalChapters(targetPages: number): { chapters: number; wordsPerChapter: number } {
  const totalWords = targetPages * 250;
  const frontBackMatter = 2500;
  const chapterContent = totalWords - frontBackMatter;
  
  // Determine optimal chapter count based on page range
  let optimalChapters: number;
  if (targetPages <= 175) {
    optimalChapters = 10;
  } else if (targetPages <= 225) {
    optimalChapters = 13;
  } else if (targetPages <= 275) {
    optimalChapters = 16;
  } else {
    optimalChapters = 20;
  }
  
  const wordsPerChapter = Math.round(chapterContent / optimalChapters);
  
  return { chapters: optimalChapters, wordsPerChapter };
}
```

## Example Calculations

### User selects 150 pages:
- Total: 37,500 words
- Chapter content: 35,000 words
- Chapters: 10
- Words/chapter: 3,500
- AI prompt: "Write 3,500 words for this chapter"

### User selects 200 pages:
- Total: 50,000 words
- Chapter content: 47,500 words
- Chapters: 13
- Words/chapter: 3,654
- AI prompt: "Write 3,654 words for this chapter"

### User selects 250 pages:
- Total: 62,500 words
- Chapter content: 60,000 words
- Chapters: 16
- Words/chapter: 3,750
- AI prompt: "Write 3,750 words for this chapter"

### User selects 300 pages:
- Total: 75,000 words
- Chapter content: 72,500 words
- Chapters: 20
- Words/chapter: 3,625
- AI prompt: "Write 3,625 words for this chapter"
