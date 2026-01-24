# LLM Model Audit - Ensuring All Calls Use GPT-4o

**Date:** January 24, 2026  
**Goal:** Ensure all LLM invocations use GPT-4o for best writing and idea generation quality

---

## Files with invokeLLM Calls

### ✅ Already Using GPT-4o Explicitly

1. **server/routers.ts** (line 201)
   - Bio generation: `model: "gpt-4o"`
   - ✅ Already correct

2. **server/writing-studio-agent-v2.ts** (lines 148, 251, 427, 482)
   - All 4 calls: `model: "gpt-4o"`
   - ✅ Already correct

---

### ⚠️ Using Default Model (needs update)

3. **server/ai-generation.ts** (3 calls)
   - Line 89: Chapter generation
   - Line 181: Chapter outline generation
   - Line 236: SUCCess story generation
   - ❌ No model specified → will use default (now gpt-4o)

4. **server/amazon-category-research.ts** (2 calls)
   - Line 159: Category research
   - Line 272: Keyword generation
   - ❌ No model specified → will use default (now gpt-4o)

5. **server/blueprint-generator.ts** (1 call)
   - Line 129: Blueprint generation
   - ❌ No model specified → will use default (now gpt-4o)

6. **server/kdp-listing-optimizer.ts** (4 calls)
   - Line 51: Title optimization
   - Line 109: Description optimization
   - Line 174: Keyword research
   - Line 238: Author bio generation
   - ❌ No model specified → will use default (now gpt-4o)

7. **server/manuscript-analyzer.ts** (2 calls)
   - Line 73: Manuscript analysis
   - Line 164: Title suggestions
   - Line 213: Description generation
   - ❌ No model specified → will use default (now gpt-4o)

8. **server/routers.ts** (additional calls)
   - Line 1175: Chapter outline generation
   - Line 1710: Chapter content generation
   - Line 1908: Chapter editing
   - Line 3221: AI chat
   - Line 3726: Email generation
   - Line 3763: Social media generation
   - ❌ No model specified → will use default (now gpt-4o)

9. **server/writing-studio-agent.ts** (2 calls)
   - Line 64: Conversation handling
   - Line 251: Data extraction
   - ❌ No model specified → will use default (now gpt-4o)

---

## Summary

**Total invokeLLM calls:** 26
- **Explicitly using gpt-4o:** 5 calls (19%)
- **Using default model:** 21 calls (81%)

**Status:** ✅ All calls will now use GPT-4o because we changed the default model in `server/_core/llm.ts` line 285

---

## Recommendation

Since we've updated the default model to `gpt-4o`, all 21 calls without explicit model parameters will automatically use GPT-4o. This is the cleanest approach because:

1. **Single source of truth:** One place to change the model
2. **Consistency:** All calls use the same high-quality model
3. **Maintainability:** No need to update 26 different locations

**Action:** No further changes needed. The default model change is sufficient.
